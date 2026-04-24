"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRightIcon, CheckIcon } from "./Icon";

type Props = {
  submissionId: string;
  initialStatus: "submitted" | "reviewing" | "approved" | "needs_revision";
  initialFeedback: string | null;
  initialGrade: number | null;
};

export function ReviewSubmissionForm({
  submissionId,
  initialStatus,
  initialFeedback,
  initialGrade,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<Props["initialStatus"]>(initialStatus);
  const [feedback, setFeedback] = useState(initialFeedback ?? "");
  const [grade, setGrade] = useState<string>(initialGrade?.toString() ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const submit = async (finalStatus: "reviewing" | "approved" | "needs_revision") => {
    setError(null);
    setSaved(false);

    if (finalStatus === "approved" || finalStatus === "needs_revision") {
      if (feedback.trim().length < 3) {
        setError("Feedback minimal 3 karakter sebelum submit final.");
        return;
      }
    }

    const gradeNum = grade.trim().length > 0 ? Number.parseInt(grade, 10) : null;
    if (grade.trim().length > 0 && (Number.isNaN(gradeNum!) || gradeNum! < 0 || gradeNum! > 100)) {
      setError("Nilai harus angka 0-100.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/tutor/submissions/${submissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: finalStatus,
          feedback: feedback.trim() || null,
          grade: gradeNum,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Gagal menyimpan review" }));
        throw new Error(data.error ?? "Gagal menyimpan review");
      }
      setStatus(finalStatus);
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      className="profile-form"
      onSubmit={(e) => {
        e.preventDefault();
      }}
      noValidate
    >
      <fieldset className="form-field">
        <legend>
          <strong>Feedback untuk siswa</strong>
          <span>
            Spesifik (rujuk bagian jawabannya), actionable (langkah perbaikan kalau perlu revisi),
            dan balance (apresiasi + arahan).
          </span>
        </legend>
        <textarea
          className="form-input"
          rows={8}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Tulis feedback di sini — akan dikirim sebagai notifikasi ke siswa."
          maxLength={8000}
        />
        <span className="assignment-form__counter">{feedback.length} karakter</span>
      </fieldset>

      <fieldset className="form-field">
        <legend>
          <strong>Nilai (opsional)</strong>
          <span>Angka 0-100 berdasarkan rubric. Boleh dikosongkan.</span>
        </legend>
        <input
          type="number"
          className="form-input"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          min={0}
          max={100}
          placeholder="misal: 85"
          style={{ maxWidth: 160 }}
        />
      </fieldset>

      {error ? (
        <p className="login-error" role="alert">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="profile-form__hint" role="status" style={{ color: "var(--brand-strong)" }}>
          <CheckIcon size={14} /> Review tersimpan. Siswa dapat notifikasi otomatis kalau final.
        </p>
      ) : null}

      <div className="review-actions">
        <button
          type="button"
          className="button button--secondary"
          disabled={submitting || status === "reviewing"}
          onClick={() => submit("reviewing")}
        >
          Simpan Draft (sedang review)
        </button>
        <button
          type="button"
          className="button button--ghost"
          disabled={submitting}
          onClick={() => submit("needs_revision")}
          style={{ borderColor: "#b45309", color: "#b45309" }}
        >
          Perlu Revisi
        </button>
        <button
          type="button"
          className="button button--primary"
          disabled={submitting}
          onClick={() => submit("approved")}
        >
          {submitting ? "Mengirim…" : "Setujui & Kirim"}
          <ArrowRightIcon size={16} />
        </button>
      </div>
    </form>
  );
}
