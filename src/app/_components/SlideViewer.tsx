"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRightIcon, CheckIcon, ClockIcon } from "./Icon";

type SlideNote = { slideIndex: number; note: string };

type Props = {
  materialId: string;
  pdfUrl: string;
  filename: string;
  initialLastSlide: number;
  initialMaxSlide: number;
  /** true kalau viewer dipakai oleh user yang belum login (tutor preview, guest) — skip POST progress */
  readOnly?: boolean;
  /** Callback saat maxSlide berubah — dipakai untuk unlock tombol selesai di parent */
  onMaxSlideReached?: (maxSlide: number, totalPages: number) => void;
  /** Tampilkan panel speaker notes (untuk tutor/admin) */
  showNotes?: boolean;
  /** Initial notes data (kalau showNotes=true) */
  initialNotes?: SlideNote[];
  /** Tutor/admin boleh edit notes (false untuk preview-only mode) */
  canEditNotes?: boolean;
};

// pdfjs-dist dimuat lazy di effect supaya tidak dieksekusi di SSR
type PDFDocumentProxy = {
  numPages: number;
  getPage(pageNum: number): Promise<PDFPageProxy>;
};
type PDFPageProxy = {
  getViewport(params: { scale: number }): { width: number; height: number };
  render(params: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }): { promise: Promise<void> };
};

export function SlideViewer({
  materialId,
  pdfUrl,
  filename,
  initialLastSlide,
  initialMaxSlide,
  readOnly,
  onMaxSlideReached,
  showNotes,
  initialNotes,
  canEditNotes,
}: Props) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(initialLastSlide);
  const [maxSlide, setMaxSlide] = useState(initialMaxSlide);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Speaker notes state — keyed by slideIndex
  const initialNotesMap = new Map<number, string>(
    (initialNotes ?? []).map((n) => [n.slideIndex, n.note]),
  );
  const [notesMap, setNotesMap] = useState<Map<number, string>>(initialNotesMap);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const thumbsContainerRef = useRef<HTMLDivElement | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const thumbnailCache = useRef<Map<number, string>>(new Map());

  // Sync noteDraft dengan slide aktif saat ganti slide
  useEffect(() => {
    if (!showNotes) return;
    setNoteDraft(notesMap.get(currentSlide) ?? "");
    setNoteSaved(false);
  }, [currentSlide, showNotes, notesMap]);

  const saveNote = async () => {
    if (!showNotes || !canEditNotes) return;
    const trimmed = noteDraft.trim();
    const existing = notesMap.get(currentSlide) ?? "";
    if (trimmed === existing) {
      setNoteSaved(false);
      return;
    }

    setNoteSaving(true);
    try {
      // Build full notes array — replace/add current slide
      const newMap = new Map(notesMap);
      if (trimmed === "") {
        newMap.delete(currentSlide);
      } else {
        newMap.set(currentSlide, trimmed);
      }
      const slideNotes = Array.from(newMap.entries())
        .map(([slideIndex, note]) => ({ slideIndex, note }))
        .sort((a, b) => a.slideIndex - b.slideIndex);

      const res = await fetch(`/api/materials/${materialId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slideNotes }),
      });
      if (!res.ok) {
        throw new Error("Gagal menyimpan catatan");
      }
      setNotesMap(newMap);
      setNoteSaved(true);
      window.setTimeout(() => setNoteSaved(false), 2000);
    } catch (err) {
      console.error("[saveNote]", err);
    } finally {
      setNoteSaving(false);
    }
  };

  // Load PDF document (lazy import pdfjs-dist)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const loadingTask = pdfjs.getDocument({ url: pdfUrl });
        const doc = (await loadingTask.promise) as unknown as PDFDocumentProxy;
        if (cancelled) return;
        setPdf(doc);
        setTotalPages(doc.numPages);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Gagal memuat PDF");
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  // Render main canvas on page change
  useEffect(() => {
    if (!pdf || !mainCanvasRef.current || totalPages === 0) return;
    const canvas = mainCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let cancelled = false;

    (async () => {
      try {
        const pageNum = Math.max(1, Math.min(currentSlide + 1, totalPages));
        const page = await pdf.getPage(pageNum);
        // Scale supaya resolution ~2x container width, capped 2000px
        const containerWidth = canvas.parentElement?.clientWidth ?? 800;
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = Math.min(2, Math.max(1.25, (containerWidth * 1.5) / baseViewport.width));
        const viewport = page.getViewport({ scale });
        if (cancelled) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = "100%";
        canvas.style.height = "auto";
        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch (err) {
        if (!cancelled) console.error("[SlideViewer] render failed:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pdf, currentSlide, totalPages]);

  // Update maxSlide & schedule progress save
  useEffect(() => {
    if (totalPages === 0) return;
    let next = maxSlide;
    if (currentSlide > maxSlide) {
      next = currentSlide;
      setMaxSlide(next);
      onMaxSlideReached?.(next, totalPages);
    }

    if (readOnly) return;

    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      fetch(`/api/materials/${materialId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastSlideIndex: currentSlide,
          totalPages,
        }),
      }).catch(() => {
        // fire-and-forget
      });
    }, 800);
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [currentSlide, totalPages, maxSlide, materialId, readOnly, onMaxSlideReached]);

  // Render thumbnail for a given page index, cache as data URL
  const renderThumb = useCallback(
    async (pageIndex: number, canvas: HTMLCanvasElement) => {
      if (!pdf) return;
      const cached = thumbnailCache.current.get(pageIndex);
      if (cached) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const img = new Image();
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
          };
          img.src = cached;
        }
        return;
      }
      try {
        const page = await pdf.getPage(pageIndex + 1);
        const viewport = page.getViewport({ scale: 0.25 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        await page.render({ canvasContext: ctx, viewport }).promise;
        thumbnailCache.current.set(pageIndex, canvas.toDataURL());
      } catch {
        // ignore
      }
    },
    [pdf],
  );

  // Keyboard navigation
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      // Skip kalau user sedang ketik di input
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      )
        return;

      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        setCurrentSlide((c) => Math.min(c + 1, Math.max(0, totalPages - 1)));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        setCurrentSlide((c) => Math.max(0, c - 1));
      } else if (e.key === "Home") {
        e.preventDefault();
        setCurrentSlide(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setCurrentSlide(Math.max(0, totalPages - 1));
      } else if (e.key === "f" || e.key === "F") {
        if (!target || target.tagName !== "INPUT") toggleFullscreen();
      } else if (e.key === "Escape" && isFullscreen) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages, isFullscreen]);

  // Fullscreen change listener
  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
      } catch {
        // user gesture required / not supported
      }
    } else {
      await document.exitFullscreen();
    }
  };

  // Scroll active thumbnail into view
  useEffect(() => {
    if (!thumbsContainerRef.current) return;
    const active = thumbsContainerRef.current.querySelector(".slide-thumb--active");
    active?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [currentSlide]);

  const goPrev = () => setCurrentSlide((c) => Math.max(0, c - 1));
  const goNext = () => setCurrentSlide((c) => Math.min(c + 1, Math.max(0, totalPages - 1)));

  if (error) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: 16,
          background: "rgba(239, 68, 68, 0.05)",
        }}
      >
        <strong>Gagal memuat slide</strong>
        <p style={{ color: "var(--muted)", marginTop: 6 }}>{error}</p>
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="button button--secondary button--sm" style={{ marginTop: 12 }}>
          Download PDF manual
        </a>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={"slide-viewer" + (isFullscreen ? " slide-viewer--fullscreen" : "")}
      style={{
        background: "#0f172a",
        borderRadius: isFullscreen ? 0 : 16,
        padding: isFullscreen ? 16 : 14,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div
        style={{
          background: "#0b1226",
          borderRadius: 12,
          overflow: "hidden",
          position: "relative",
          minHeight: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <div style={{ padding: 40, color: "#cbd5e1" }}>Memuat slide…</div>
        ) : (
          <canvas ref={mainCanvasRef} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            className="button button--secondary button--sm"
            onClick={goPrev}
            disabled={currentSlide === 0 || loading}
            aria-label="Slide sebelumnya"
          >
            ←
          </button>
          <button
            type="button"
            className="button button--secondary button--sm"
            onClick={goNext}
            disabled={currentSlide >= totalPages - 1 || loading}
            aria-label="Slide berikutnya"
          >
            →
          </button>
          <span
            style={{
              color: "#cbd5e1",
              fontSize: "0.88rem",
              padding: "0 8px",
              fontWeight: 700,
            }}
          >
            {totalPages > 0 ? `${currentSlide + 1} / ${totalPages}` : "—"}
          </span>
          {maxSlide >= totalPages - 1 && totalPages > 0 ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 8px",
                borderRadius: 999,
                background: "rgba(24, 194, 156, 0.18)",
                color: "#5eead4",
                fontSize: "0.7rem",
                fontWeight: 800,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              <CheckIcon size={10} /> Selesai dibaca
            </span>
          ) : totalPages > 0 ? (
            <span style={{ color: "#94a3b8", fontSize: "0.78rem" }}>
              <ClockIcon size={10} /> {maxSlide + 1}/{totalPages} dilihat
            </span>
          ) : null}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="button button--ghost button--sm"
            style={{ borderColor: "rgba(203, 213, 225, 0.3)", color: "#cbd5e1" }}
          >
            Download
          </a>
          <button
            type="button"
            className="button button--ghost button--sm"
            onClick={toggleFullscreen}
            style={{ borderColor: "rgba(203, 213, 225, 0.3)", color: "#cbd5e1" }}
            aria-label={isFullscreen ? "Keluar fullscreen" : "Masuk fullscreen"}
            title="Tekan F untuk fullscreen"
          >
            {isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
          </button>
        </div>
      </div>

      {totalPages > 1 ? (
        <div
          ref={thumbsContainerRef}
          className="slide-thumbs"
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            padding: "6px 2px",
            scrollbarWidth: "thin",
          }}
          role="tablist"
          aria-label="Thumbnail slide"
        >
          {Array.from({ length: totalPages }).map((_, i) => (
            <SlideThumb
              key={i}
              index={i}
              active={i === currentSlide}
              viewed={i <= maxSlide}
              onClick={() => setCurrentSlide(i)}
              render={renderThumb}
            />
          ))}
        </div>
      ) : null}

      {showNotes ? (
        <div
          style={{
            background: "#f8fafc",
            color: "#0f172a",
            borderRadius: 12,
            padding: 14,
            border: "1px solid rgba(15, 23, 42, 0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <strong style={{ fontSize: "0.84rem", color: "var(--ink)" }}>
              📝 Speaker Notes — Slide {currentSlide + 1}
            </strong>
            <small style={{ color: "var(--muted)", fontSize: "0.74rem" }}>
              {canEditNotes
                ? "Hanya tutor & admin yang lihat catatan ini."
                : "Mode preview — tidak bisa edit."}
            </small>
          </div>
          {canEditNotes ? (
            <>
              <textarea
                className="form-input"
                rows={4}
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                onBlur={saveNote}
                placeholder="Tulis catatan untuk slide ini — talking points, contoh nyata, pertanyaan ke audience, dll."
                maxLength={4000}
                style={{ resize: "vertical", minHeight: 80 }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 6,
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <small style={{ color: "var(--muted)", fontSize: "0.74rem" }}>
                  Tersimpan otomatis saat klik di luar field
                </small>
                <small
                  style={{
                    fontSize: "0.74rem",
                    color: noteSaving
                      ? "var(--muted)"
                      : noteSaved
                      ? "var(--brand-strong)"
                      : "transparent",
                  }}
                >
                  {noteSaving ? "Menyimpan…" : noteSaved ? "✓ Tersimpan" : "—"}
                </small>
              </div>
            </>
          ) : (
            <div
              style={{
                whiteSpace: "pre-wrap",
                color: "var(--ink-soft)",
                fontSize: "0.88rem",
                lineHeight: 1.6,
                minHeight: 40,
              }}
            >
              {notesMap.get(currentSlide) || (
                <em style={{ color: "var(--muted)" }}>Tidak ada catatan untuk slide ini.</em>
              )}
            </div>
          )}
        </div>
      ) : null}

      <p
        style={{
          color: "#64748b",
          fontSize: "0.72rem",
          margin: 0,
          textAlign: "center",
        }}
      >
        Tips: panah ← → untuk navigasi, F untuk fullscreen, Esc untuk keluar · {filename}
      </p>
    </div>
  );
}

type ThumbProps = {
  index: number;
  active: boolean;
  viewed: boolean;
  onClick: () => void;
  render: (pageIndex: number, canvas: HTMLCanvasElement) => Promise<void>;
};

function SlideThumb({ index, active, viewed, onClick, render }: ThumbProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendered = useRef(false);

  useEffect(() => {
    if (rendered.current || !canvasRef.current) return;
    rendered.current = true;
    render(index, canvasRef.current);
  }, [index, render]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={"slide-thumb" + (active ? " slide-thumb--active" : "")}
      aria-label={`Slide ${index + 1}${viewed ? " (sudah dibaca)" : ""}`}
      title={`Slide ${index + 1}`}
      style={{
        flex: "0 0 auto",
        width: 92,
        height: 66,
        padding: 2,
        background: "#1e293b",
        border: active
          ? "2px solid #10b981"
          : viewed
          ? "1px solid rgba(16, 185, 129, 0.4)"
          : "1px solid rgba(203, 213, 225, 0.2)",
        borderRadius: 6,
        cursor: "pointer",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        opacity: viewed ? 1 : 0.72,
        transition: "border-color 0.12s, opacity 0.12s",
      }}
    >
      <canvas ref={canvasRef} style={{ maxWidth: "100%", maxHeight: "100%", display: "block" }} />
      <span
        style={{
          position: "absolute",
          bottom: 2,
          right: 4,
          fontSize: "0.6rem",
          fontWeight: 800,
          color: "#cbd5e1",
          background: "rgba(15, 23, 42, 0.7)",
          padding: "1px 4px",
          borderRadius: 3,
        }}
      >
        {index + 1}
      </span>
    </button>
  );
}
