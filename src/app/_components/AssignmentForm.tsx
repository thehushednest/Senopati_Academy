"use client";

import { useState } from "react";
import { ArrowRightIcon, CheckIcon } from "./Icon";

type Props = {
  briefTitle: string;
  moduleSlug?: string;
  sessionIndex?: number;
};

export function AssignmentForm({ briefTitle, moduleSlug, sessionIndex }: Props) {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 30) return;
    setError(null);

    if (!moduleSlug || sessionIndex === undefined) {
      // Fallback UI-only mode kalau komponen dipakai tanpa konteks modul.
      setSubmitted(true);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/assignment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleSlug,
          sessionIndex,
          text: text.trim(),
          // File upload belum di-wire — kita simpan nama saja di future (S3/MinIO integration).
          attachmentUrl: null,
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
      setSubmitting(false);
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
            setFileName(null);
          }}
        >
          Kirim versi baru
        </button>
      </div>
    );
  }

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
          <span>Bisa upload screenshot, link dokumen, atau file referensi pendukung.</span>
        </legend>
        <label className="assignment-form__file">
          <input
            type="file"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            hidden
          />
          <span>Pilih file</span>
          <small>{fileName ?? "Belum ada file dipilih"}</small>
        </label>
      </fieldset>

      {error ? (
        <p className="profile-form__hint" role="alert" style={{ color: "#c62828" }}>
          {error}
        </p>
      ) : null}

      <div className="assignment-form__actions">
        <button type="button" className="button button--secondary" disabled={submitting}>
          Simpan Draft
        </button>
        <button
          type="submit"
          className="button button--primary"
          disabled={text.trim().length < 30 || submitting}
        >
          {submitting ? "Mengirim…" : "Kirim Tugas"}
          <ArrowRightIcon size={16} />
        </button>
      </div>
    </form>
  );
}
