"use client";

import { useState } from "react";
import { ArrowRightIcon, CheckIcon } from "./Icon";

type Props = {
  briefTitle: string;
  moduleSlug?: string;
  sessionIndex?: number;
};

const ALLOWED_EXTS = [".pdf", ".png", ".jpg", ".jpeg", ".webp", ".txt", ".md"];
const MAX_SIZE_MB = 10;

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".txt": "text/plain",
  ".md": "text/markdown",
};

function extOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot).toLowerCase() : "";
}

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AssignmentForm({ briefTitle, moduleSlug, sessionIndex }: Props) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [phase, setPhase] = useState<"idle" | "signing" | "uploading" | "submitting">("idle");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickFile = (f: File | null) => {
    setFileError(null);
    setUploadProgress(0);
    if (!f) {
      setFile(null);
      return;
    }
    const ext = extOf(f.name);
    if (!ALLOWED_EXTS.includes(ext)) {
      setFileError(`Format ${ext || "ini"} tidak didukung. Pakai PDF / PNG / JPG / WEBP / TXT / MD.`);
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`File melebihi batas ${MAX_SIZE_MB} MB.`);
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 30) return;
    setError(null);

    if (!moduleSlug || sessionIndex === undefined) {
      setSubmitted(true);
      return;
    }

    let attachmentUrl: string | null = null;

    // 1. Upload file kalau ada
    if (file) {
      try {
        setPhase("signing");
        const ext = extOf(file.name);
        const contentType = CONTENT_TYPE_BY_EXT[ext];
        if (!contentType) throw new Error("Format file tidak didukung");

        const presignRes = await fetch("/api/assignment/presigned-upload", {
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
          const data = await presignRes.json().catch(() => ({ error: "Gagal request upload" }));
          throw new Error(data.error ?? "Gagal request upload");
        }
        const presign = await presignRes.json();

        setPhase("uploading");
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", presign.uploadUrl);
          xhr.setRequestHeader("Content-Type", contentType);
          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) {
              setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(new Error(`Upload gagal (HTTP ${xhr.status})`));
          };
          xhr.onerror = () => reject(new Error("Upload gagal — cek koneksi"));
          xhr.send(file);
        });

        attachmentUrl = presign.publicUrl;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload lampiran gagal");
        setPhase("idle");
        return;
      }
    }

    // 2. Submit text + attachmentUrl
    setPhase("submitting");
    try {
      const res = await fetch("/api/assignment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleSlug,
          sessionIndex,
          text: text.trim(),
          attachmentUrl,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Gagal mengirim tugas" }));
        throw new Error(data.error ?? "Gagal mengirim tugas");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim tugas");
    } finally {
      setPhase("idle");
    }
  };

  if (submitted) {
    return (
      <div className="assignment-success" role="status">
        <span className="assignment-success__icon">
          <CheckIcon size={22} />
        </span>
        <h3>Tugas berhasil dikirim</h3>
        <p>
          Kami akan review submission kamu dalam 2 x 24 jam. Notifikasi feedback akan muncul di
          halaman ini dan dashboard.
        </p>
        <button
          type="button"
          className="button button--secondary button--sm"
          onClick={() => {
            setSubmitted(false);
            setText("");
            setFile(null);
            setUploadProgress(0);
          }}
        >
          Kirim versi baru
        </button>
      </div>
    );
  }

  const busy = phase !== "idle";

  return (
    <form className="assignment-form" onSubmit={handleSubmit} noValidate>
      <fieldset className="form-field">
        <legend>
          <strong>Jawaban kamu untuk: {briefTitle}</strong>
          <span>Minimal 30 karakter. Tulis singkat tapi jelas — kualitas lebih penting dari panjang.</span>
        </legend>
        <textarea
          className="form-input"
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tulis jawaban, contoh prompt, atau insight yang kamu temukan di sini…"
        />
        <span className="assignment-form__counter">
          {text.length.toLocaleString("id-ID")} karakter
        </span>
      </fieldset>

      <fieldset className="form-field">
        <legend>
          <strong>Lampiran (opsional)</strong>
          <span>
            Screenshot, PDF dokumen pendukung, atau catatan singkat. Maks {MAX_SIZE_MB} MB. Format:
            PDF, PNG, JPG, WEBP, TXT, MD.
          </span>
        </legend>
        <label className="assignment-form__file">
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,application/pdf,image/png,image/jpeg,image/webp,text/plain,text/markdown"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            hidden
            disabled={busy}
          />
          <span>{file ? "Ganti file" : "Pilih file"}</span>
          <small>
            {file ? `${file.name} · ${humanSize(file.size)}` : "Belum ada file dipilih"}
          </small>
        </label>
        {fileError ? (
          <p className="profile-form__hint" role="alert" style={{ color: "#c62828", marginTop: 6 }}>
            {fileError}
          </p>
        ) : null}
      </fieldset>

      {phase === "uploading" || phase === "signing" ? (
        <div>
          <div className="active-progress-bar" aria-hidden="true">
            <span style={{ width: `${uploadProgress}%` }} />
          </div>
          <small style={{ color: "var(--muted)" }}>
            {phase === "signing"
              ? "Menyiapkan upload lampiran…"
              : `Mengunggah lampiran… ${uploadProgress}%`}
          </small>
        </div>
      ) : null}

      {error ? (
        <p className="profile-form__hint" role="alert" style={{ color: "#c62828" }}>
          {error}
        </p>
      ) : null}

      <div className="assignment-form__actions">
        <button type="button" className="button button--secondary" disabled={busy}>
          Simpan Draft
        </button>
        <button
          type="submit"
          className="button button--primary"
          disabled={text.trim().length < 30 || busy}
        >
          {phase === "submitting"
            ? "Mengirim…"
            : phase === "uploading"
            ? "Mengunggah…"
            : phase === "signing"
            ? "Menyiapkan…"
            : "Kirim Tugas"}
          <ArrowRightIcon size={16} />
        </button>
      </div>
    </form>
  );
}
