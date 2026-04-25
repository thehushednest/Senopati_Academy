"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon } from "./Icon";
import { RoomSlideCanvas } from "./RoomSlideCanvas";
import { RoomSidePanel } from "./RoomSidePanel";

type Material = {
  id: string;
  title: string | null;
  pdfFilename: string;
  pdfUrl: string;
  moduleSlug: string;
  moduleTitle: string;
  sessionIndex: number;
};

type Props = {
  eventId: string;
  currentUserId: string;
  materials: Material[];
  initialMaterialId: string | null;
  initialSlide: number | null;
  initialPdfUrl: string | null;
};

export function PresenterRoom({
  eventId,
  currentUserId,
  materials,
  initialMaterialId,
  initialSlide,
  initialPdfUrl,
}: Props) {
  // SSE source — presenter butuh untuk receive chat + qna events.
  // Slide events tidak di-subscribe (presenter yang push, bukan listen).
  const [source, setSource] = useState<EventSource | null>(null);
  useEffect(() => {
    const es = new EventSource(`/api/live-events/${eventId}/stream`);
    setSource(es);
    return () => {
      es.close();
      setSource(null);
    };
  }, [eventId]);

  const [pickerOpen, setPickerOpen] = useState(initialMaterialId === null);
  const [selectedMaterialId, setSelectedMaterialId] = useState(
    initialMaterialId ?? materials[0]?.id ?? "",
  );
  const [activeMaterialId, setActiveMaterialId] = useState<string | null>(initialMaterialId);
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(initialPdfUrl);
  const [slide, setSlide] = useState(initialSlide ?? 0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const post = async (body: Record<string, unknown>): Promise<boolean> => {
    setError(null);
    const res = await fetch(`/api/live-events/${eventId}/present`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Gagal" }));
      setError(data.error ?? "Gagal");
      return false;
    }
    return true;
  };

  const startPresent = async () => {
    if (!selectedMaterialId) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/live-events/${eventId}/present`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", materialId: selectedMaterialId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Gagal start" }));
        setError(data.error ?? "Gagal start");
        return;
      }
      const data = await res.json();
      setActiveMaterialId(data.material.id);
      setActivePdfUrl(data.material.pdfUrl);
      setSlide(0);
      setPickerOpen(false);
    } finally {
      setBusy(false);
    }
  };

  // Debounced slide push — kalau presenter klik cepat, jangan flood API.
  const slideSyncTimer = useRef<number | null>(null);
  const pendingSlideRef = useRef<number | null>(null);
  const lastSyncedSlideRef = useRef<number>(initialSlide ?? 0);

  useEffect(() => {
    if (activeMaterialId === null) return;
    if (slide === lastSyncedSlideRef.current) return;
    pendingSlideRef.current = slide;
    if (slideSyncTimer.current !== null) {
      window.clearTimeout(slideSyncTimer.current);
    }
    slideSyncTimer.current = window.setTimeout(() => {
      const target = pendingSlideRef.current;
      if (target === null) return;
      lastSyncedSlideRef.current = target;
      void post({ action: "slide", slide: target });
    }, 150);
    return () => {
      if (slideSyncTimer.current !== null) {
        window.clearTimeout(slideSyncTimer.current);
        slideSyncTimer.current = null;
      }
    };
  }, [slide, activeMaterialId]);

  const endPresent = async () => {
    if (!window.confirm("Hentikan presenter mode? Slide hilang dari layar viewer.")) return;
    setBusy(true);
    try {
      const ok = await post({ action: "end" });
      if (ok) {
        setActiveMaterialId(null);
        setActivePdfUrl(null);
        setSlide(0);
        setPickerOpen(true);
      }
    } finally {
      setBusy(false);
    }
  };

  const onPrev = () => setSlide((s) => Math.max(0, s - 1));
  const onNext = () =>
    setSlide((s) => (totalPages > 0 ? Math.min(totalPages - 1, s + 1) : s + 1));

  // Keyboard nav untuk presenter (← → / Space)
  useEffect(() => {
    if (!activeMaterialId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        onNext();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        onPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMaterialId, totalPages]);

  if (materials.length === 0) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 360px)",
          gap: 16,
        }}
        className="room-grid"
      >
        <div className="catalog-empty">
          <p>
            Belum ada slide materi yang bisa kamu present. Upload PDF/PPT di halaman modul yang kamu
            ampu dulu.
          </p>
        </div>
        <RoomSidePanel
          eventId={eventId}
          currentUserId={currentUserId}
          isHostOrAdmin={true}
          source={source}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 360px)",
        gap: 16,
        alignItems: "stretch",
      }}
      className="room-grid"
    >
    <div style={{ display: "grid", gap: 14, minWidth: 0 }}>
      {pickerOpen ? (
        <div
          style={{
            padding: 18,
            background: "rgba(15, 23, 42, 0.02)",
            border: "1px solid rgba(15, 23, 42, 0.08)",
            borderRadius: 14,
            display: "grid",
            gap: 10,
          }}
        >
          <strong>Pilih materi yang akan di-present</strong>
          <select
            className="form-input"
            value={selectedMaterialId}
            onChange={(e) => setSelectedMaterialId(e.target.value)}
          >
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.moduleTitle} · Sesi {m.sessionIndex + 1}
                {m.title ? ` — ${m.title}` : ` — ${m.pdfFilename}`}
              </option>
            ))}
          </select>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="button button--primary"
              onClick={startPresent}
              disabled={busy || !selectedMaterialId}
            >
              {busy ? "Menyiapkan…" : "Mulai Present"}
              <ArrowRightIcon size={14} />
            </button>
            {activeMaterialId ? (
              <button
                type="button"
                className="button button--secondary"
                onClick={() => setPickerOpen(false)}
                disabled={busy}
              >
                Batal
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {activeMaterialId && activePdfUrl ? (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <small style={{ color: "var(--muted)" }}>
                Sedang present · slide {slide + 1}
                {totalPages > 0 ? ` / ${totalPages}` : ""}
              </small>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className="button button--ghost button--sm"
                onClick={() => setPickerOpen(true)}
                disabled={busy}
              >
                Ganti materi
              </button>
              <button
                type="button"
                className="button button--ghost button--sm"
                onClick={endPresent}
                disabled={busy}
                style={{ color: "#c62828", borderColor: "#c62828" }}
              >
                Stop Present
              </button>
            </div>
          </div>

          <RoomSlideCanvas
            pdfUrl={activePdfUrl}
            slide={slide}
            onTotalPages={(n) => setTotalPages(n)}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 10,
              alignItems: "center",
            }}
          >
            <button
              type="button"
              className="button button--secondary"
              onClick={onPrev}
              disabled={slide === 0 || busy}
            >
              ← Prev
            </button>
            <span style={{ minWidth: 80, textAlign: "center" }}>
              <strong>
                {slide + 1}
                {totalPages > 0 ? ` / ${totalPages}` : ""}
              </strong>
            </span>
            <button
              type="button"
              className="button button--primary"
              onClick={onNext}
              disabled={(totalPages > 0 && slide >= totalPages - 1) || busy}
            >
              Next →
            </button>
          </div>
          <small
            style={{ color: "var(--muted)", textAlign: "center", display: "block" }}
          >
            Tips: pakai panah ← / → atau Space untuk advance.
          </small>
        </>
      ) : null}

      {error ? (
        <p className="profile-form__hint" role="alert" style={{ color: "#c62828" }}>
          {error}
        </p>
      ) : null}
    </div>
      <RoomSidePanel
        eventId={eventId}
        currentUserId={currentUserId}
        isHostOrAdmin={true}
        source={source}
      />
    </div>
  );
}
