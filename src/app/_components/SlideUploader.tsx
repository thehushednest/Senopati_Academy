"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { ArrowRightIcon, CheckIcon } from "./Icon";

type Material = {
  id: string;
  pdfUrl: string;
  pdfFilename: string;
  pdfSizeBytes: number;
  sourceFormat: string;
  uploadedAt: string;
  title: string | null;
  totalPages: number | null;
};

type Props = {
  moduleSlug: string;
  sessionIndex: number;
  existing: Material | null;
  afterDeleteRedirect?: string;
};

const ALLOWED_EXTS = [".pdf", ".ppt", ".pptx"];
const MAX_SIZE_MB = 50;

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot).toLowerCase() : "";
}

function contentTypeOf(ext: string): string {
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".pptx")
    return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  if (ext === ".ppt") return "application/vnd.ms-powerpoint";
  return "application/octet-stream";
}

export function SlideUploader({ moduleSlug, sessionIndex, existing, afterDeleteRedirect }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState(existing?.title ?? "");
  const [changeNote, setChangeNote] = useState("");
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [phase, setPhase] = useState<"idle" | "signing" | "uploading" | "committing" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const pickFile = (f: File | null) => {
    setError(null);
    setProgress(0);
    setPhase("idle");
    if (!f) {
      setFile(null);
      return;
    }
    const ext = extOf(f.name);
    if (!ALLOWED_EXTS.includes(ext)) {
      setError(`Format tidak didukung (${ext}). Pakai PDF / PPT / PPTX.`);
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File melebihi batas ${MAX_SIZE_MB} MB.`);
      return;
    }
    setFile(f);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files?.[0] ?? null);
  }, []);

  const upload = async () => {
    if (!file) return;
    setError(null);
    try {
      // 1. Request presigned URL
      setPhase("signing");
      const ext = extOf(file.name);
      const contentType = contentTypeOf(ext);
      const presignRes = await fetch("/api/materials/presigned-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleSlug,
          sessionIndex,
          filename: file.name,
          contentType,
          sizeBytes: file.size,
        }),
      });
      if (!presignRes.ok) {
        const data = await presignRes.json().catch(() => ({ error: "Gagal request upload URL" }));
        throw new Error(data.error ?? "Gagal request upload URL");
      }
      const presign = await presignRes.json();

      // 2. Upload ke MinIO via PUT ke presigned URL (pakai XHR supaya ada progress bar)
      setPhase("uploading");
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", presign.uploadUrl);
        xhr.setRequestHeader("Content-Type", contentType);
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            setProgress(Math.round((ev.loaded / ev.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload gagal (HTTP ${xhr.status})`));
        };
        xhr.onerror = () => reject(new Error("Upload gagal — cek koneksi"));
        xhr.send(file);
      });

      // 3. Commit ke backend — simpan record di DB
      setPhase("committing");
      const commitRes = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleSlug,
          sessionIndex,
          objectKey: presign.objectKey,
          pdfFilename: file.name,
          title: title.trim() || undefined,
          sourceFormat: ext.replace(".", ""),
          changeNote: changeNote.trim() || undefined,
        }),
      });
      if (!commitRes.ok) {
        const data = await commitRes.json().catch(() => ({ error: "Gagal simpan metadata" }));
        throw new Error(data.error ?? "Gagal simpan metadata");
      }

      setPhase("done");
      setFile(null);
      setChangeNote("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    } catch (err) {
      setPhase("error");
      setError(err instanceof Error ? err.message : "Upload gagal");
    }
  };

  const handleDelete = async () => {
    if (!existing) return;
    if (!window.confirm("Hapus materi ini? Semua versi riwayat juga ikut terhapus.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/materials/${existing.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Gagal hapus" }));
        throw new Error(data.error ?? "Gagal hapus");
      }
      if (afterDeleteRedirect) {
        router.push(afterDeleteRedirect);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal hapus");
    } finally {
      setDeleting(false);
    }
  };

  const busy = phase === "signing" || phase === "uploading" || phase === "committing";

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {existing ? (
        <div
          style={{
            padding: 16,
            borderRadius: 14,
            background: "rgba(24, 194, 156, 0.06)",
            border: "1px solid rgba(24, 194, 156, 0.22)",
          }}
        >
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 300px", minWidth: 0 }}>
              <p className="eyebrow eyebrow--brand">Materi Aktif</p>
              <strong style={{ display: "block", marginTop: 4 }}>
                {existing.title ?? existing.pdfFilename}
              </strong>
              <small style={{ color: "var(--muted)", display: "block", marginTop: 4 }}>
                {existing.pdfFilename} · {humanSize(existing.pdfSizeBytes)} ·{" "}
                {existing.totalPages ? `${existing.totalPages} slide` : "halaman belum tercatat"} ·{" "}
                upload {new Date(existing.uploadedAt).toLocaleDateString("id-ID")}
              </small>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <a
                className="button button--secondary button--sm"
                href={existing.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Buka PDF
              </a>
              <button
                type="button"
                className="button button--ghost button--sm"
                onClick={handleDelete}
                disabled={deleting}
                style={{ borderColor: "#c62828", color: "#c62828" }}
              >
                {deleting ? "Menghapus…" : "Hapus Materi"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div style={{ display: "grid", gap: 12 }}>
        <fieldset className="form-field">
          <legend>
            <strong>Judul materi (opsional)</strong>
            <span>Default: nama file. Biasanya cukup.</span>
          </legend>
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Misal: Slide Sesi 02 — Zero-shot vs Few-shot"
            maxLength={200}
          />
        </fieldset>

        <fieldset className="form-field">
          <legend>
            <strong>File materi</strong>
            <span>PDF / PPT / PPTX, maks {MAX_SIZE_MB} MB. Disarankan PDF — render paling stabil.</span>
          </legend>
          <label
            className="slide-uploader__drop"
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            style={{
              display: "block",
              padding: 24,
              border: `2px dashed ${dragging ? "var(--brand-strong)" : "rgba(15,23,42,0.15)"}`,
              borderRadius: 14,
              background: dragging ? "rgba(24, 194, 156, 0.05)" : "rgba(15,23,42,0.02)",
              textAlign: "center",
              cursor: "pointer",
              transition: "border-color 0.15s ease, background 0.15s ease",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              style={{ display: "none" }}
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <div>
                <strong>{file.name}</strong>
                <br />
                <small style={{ color: "var(--muted)" }}>
                  {humanSize(file.size)} · {extOf(file.name).replace(".", "").toUpperCase()}
                </small>
              </div>
            ) : (
              <div>
                <strong>Drop file di sini atau klik untuk pilih</strong>
                <br />
                <small style={{ color: "var(--muted)" }}>PDF / PPT / PPTX · Maks {MAX_SIZE_MB} MB</small>
              </div>
            )}
          </label>
        </fieldset>

        {existing ? (
          <fieldset className="form-field">
            <legend>
              <strong>Catatan perubahan (opsional)</strong>
              <span>Dicatat di history versi. Mis: "Fix typo slide 4", "Update contoh CTCF".</span>
            </legend>
            <input
              type="text"
              className="form-input"
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              placeholder="Misal: Update contoh prompt"
              maxLength={500}
            />
          </fieldset>
        ) : null}

        {busy ? (
          <div>
            <div className="active-progress-bar" aria-hidden="true">
              <span style={{ width: `${progress}%` }} />
            </div>
            <small style={{ color: "var(--muted)" }}>
              {phase === "signing"
                ? "Menyiapkan upload URL…"
                : phase === "uploading"
                ? `Mengunggah… ${progress}%`
                : "Menyimpan metadata…"}
            </small>
          </div>
        ) : null}

        {error ? (
          <p className="login-error" role="alert">
            {error}
          </p>
        ) : null}
        {phase === "done" ? (
          <p className="profile-form__hint" role="status" style={{ color: "var(--brand-strong)" }}>
            <CheckIcon size={14} /> Materi berhasil di-upload.
          </p>
        ) : null}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            className="button button--primary"
            onClick={upload}
            disabled={!file || busy}
          >
            {busy ? "Memproses…" : existing ? "Ganti Materi" : "Upload Materi"}
            <ArrowRightIcon size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
