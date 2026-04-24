"use client";

import { useState } from "react";
import { ArrowRightIcon, CheckIcon } from "./Icon";

type Props = {
  moduleTitle: string;
  moduleSlug?: string;
};

const EXPERIENCE_OPTIONS: Array<{ value: string; label: string; desc: string }> = [
  {
    value: "amazing",
    label: "Sangat memuaskan",
    desc: "Modul ini melebihi ekspektasi — langsung kerasa dampaknya."
  },
  {
    value: "good",
    label: "Cukup puas",
    desc: "Secara umum berguna, walaupun ada beberapa bagian yang bisa lebih baik."
  },
  {
    value: "neutral",
    label: "Biasa saja",
    desc: "Beberapa insight dapat, tapi tidak mengubah cara belajar saya secara signifikan."
  },
  {
    value: "bad",
    label: "Kurang sesuai",
    desc: "Modul ini belum pas dengan kebutuhan saya — butuh penyesuaian."
  }
];

const TAGS = [
  "Mentor jelas",
  "Materi lengkap",
  "Pace pas",
  "Challenge menarik",
  "Template berguna",
  "Komunitas aktif",
  "Referensi bagus",
  "Contoh relate"
];

export function ReviewForm({ moduleTitle, moduleSlug }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [experience, setExperience] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [testimoni, setTestimoni] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const canSubmit = rating > 0 && experience && testimoni.trim().length >= 20;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);

    if (!moduleSlug) {
      setSubmitted(true);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleSlug,
          rating,
          experience,
          tags,
          body: testimoni.trim(),
          anonymous,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Gagal mengirim review" }));
        throw new Error(data.error ?? "Gagal mengirim review");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim review");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="review-success" role="status">
        <span className="review-success__icon">
          <CheckIcon size={22} />
        </span>
        <h3>Terima kasih untuk reviewnya</h3>
        <p>
          Feedback kamu akan kami kirim ke mentor dan tim kurikulum. Review yang kamu kasih bantu
          peserta lain menentukan modul yang tepat.
        </p>
        <div className="review-success__summary">
          <div>
            <span>Rating</span>
            <strong>{rating}/5 ★</strong>
          </div>
          <div>
            <span>Tag</span>
            <strong>{tags.length ? tags.join(", ") : "—"}</strong>
          </div>
          <div>
            <span>Mode</span>
            <strong>{anonymous ? "Anonim" : "Pakai nama"}</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="review-form" onSubmit={handleSubmit} noValidate>
      <fieldset className="form-field">
        <legend>
          <strong>Kasih rating untuk modul ini</strong>
          <span>
            Klik bintang — {rating > 0 ? `kamu kasih ${rating}/5` : "belum ada rating"}
          </span>
        </legend>
        <div className="rating-stars" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((val) => {
            const filled = (hover || rating) >= val;
            return (
              <button
                key={val}
                type="button"
                role="radio"
                aria-checked={rating === val}
                aria-label={`${val} dari 5 bintang`}
                className={`rating-star${filled ? " rating-star--filled" : ""}`}
                onClick={() => setRating(val)}
                onMouseEnter={() => setHover(val)}
                onMouseLeave={() => setHover(0)}
                onFocus={() => setHover(val)}
                onBlur={() => setHover(0)}
              >
                ★
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="form-field">
        <legend>
          <strong>Bagaimana pengalamanmu?</strong>
          <span>Pilih yang paling mendekati perasaanmu saat selesai modul.</span>
        </legend>
        <div className="option-grid">
          {EXPERIENCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`option-card${experience === opt.value ? " option-card--active" : ""}`}
              onClick={() => setExperience(opt.value)}
              aria-pressed={experience === opt.value}
            >
              <span className="option-card__check" aria-hidden="true">
                {experience === opt.value ? <CheckIcon size={14} /> : null}
              </span>
              <span className="option-card__body">
                <strong>{opt.label}</strong>
                <span>{opt.desc}</span>
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="form-field">
        <legend>
          <strong>Apa yang paling menonjol dari modul ini?</strong>
          <span>Pilih satu atau lebih. Opsional, tapi sangat membantu peserta lain.</span>
        </legend>
        <div className="review-tags">
          {TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`review-tag${tags.includes(tag) ? " review-tag--active" : ""}`}
              onClick={() => toggleTag(tag)}
              aria-pressed={tags.includes(tag)}
            >
              {tags.includes(tag) ? <CheckIcon size={12} /> : null}
              {tag}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="form-field">
        <legend>
          <strong>Testimoni singkat</strong>
          <span>
            Ceritakan pengalamanmu saat belajar di modul <em>{moduleTitle}</em>. Minimal 20
            karakter.
          </span>
        </legend>
        <textarea
          className="form-input"
          rows={6}
          value={testimoni}
          onChange={(e) => setTestimoni(e.target.value)}
          placeholder="Misal: Sesi 03 paling memorable karena langsung bisa dipakai untuk tugas sekolah…"
        />
        <span className="review-form__counter">
          {testimoni.length.toLocaleString("id-ID")} karakter
        </span>
      </fieldset>

      <label className="review-form__anon">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
        />
        <span>
          Kirim sebagai <strong>anonim</strong> (nama kamu tidak ditampilkan di halaman modul).
        </span>
      </label>

      {error ? (
        <p className="profile-form__hint" role="alert" style={{ color: "#c62828" }}>
          {error}
        </p>
      ) : null}

      <div className="review-form__actions">
        <button type="button" className="button button--secondary" disabled={submitting}>
          Simpan Draft
        </button>
        <button type="submit" className="button button--primary" disabled={!canSubmit || submitting}>
          {submitting ? "Mengirim…" : "Kirim Review"}
          <ArrowRightIcon size={16} />
        </button>
      </div>
      {!canSubmit ? (
        <p className="profile-form__hint" role="status">
          Lengkapi rating, pengalaman, dan testimoni minimal 20 karakter.
        </p>
      ) : null}
    </form>
  );
}
