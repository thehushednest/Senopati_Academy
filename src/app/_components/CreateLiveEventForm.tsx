"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRightIcon } from "./Icon";

type ModuleOption = { slug: string; title: string };

type Props = {
  modules: ModuleOption[];
  isAdmin: boolean;
};

function defaultDateTime(): string {
  // Format ISO local untuk <input type="datetime-local"> default ke +1 hari, jam 19:00
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(19, 0, 0, 0);
  return d.toISOString().slice(0, 16);
}

export function CreateLiveEventForm({ modules, isAdmin }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [moduleSlug, setModuleSlug] = useState<string>("");
  const [scheduledAt, setScheduledAt] = useState(defaultDateTime());
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [meetingUrl, setMeetingUrl] = useState("");
  const [maxParticipants, setMaxParticipants] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setTitle("");
    setDescription("");
    setModuleSlug("");
    setScheduledAt(defaultDateTime());
    setDurationMinutes(60);
    setMeetingUrl("");
    setMaxParticipants("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (title.trim().length < 3) {
      setError("Judul minimal 3 karakter");
      return;
    }
    setSubmitting(true);
    try {
      // Convert local datetime ke ISO UTC
      const scheduledAtIso = new Date(scheduledAt).toISOString();
      const res = await fetch("/api/live-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          moduleSlug: moduleSlug || null,
          scheduledAt: scheduledAtIso,
          durationMinutes,
          meetingUrl: meetingUrl.trim() || null,
          maxParticipants: maxParticipants ? Number.parseInt(maxParticipants, 10) : null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Gagal buat event" }));
        throw new Error(data.error ?? "Gagal buat event");
      }
      reset();
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal buat event");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        className="button button--primary"
        onClick={() => setOpen(true)}
      >
        + Buat Live Session Baru
      </button>
    );
  }

  return (
    <form
      className="profile-form"
      onSubmit={handleSubmit}
      noValidate
      style={{
        background: "rgba(15, 23, 42, 0.02)",
        padding: 18,
        borderRadius: 14,
        border: "1px solid rgba(15, 23, 42, 0.08)",
      }}
    >
      <fieldset className="form-field">
        <legend>
          <strong>Judul live session</strong>
        </legend>
        <input
          type="text"
          className="form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Misal: Q&A Mingguan — Foundations Track"
          maxLength={200}
          required
        />
      </fieldset>

      <fieldset className="form-field">
        <legend>
          <strong>Deskripsi (opsional)</strong>
          <span>Apa yang akan dibahas, siapa target peserta, dll.</span>
        </legend>
        <textarea
          className="form-input"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={4000}
          placeholder="Misal: Diskusi terbuka soal pertanyaan dari modul minggu lalu, plus demo singkat tools terbaru."
        />
      </fieldset>

      <div className="register-form__row">
        <fieldset className="form-field">
          <legend>
            <strong>Scope modul</strong>
            <span>{isAdmin ? "Admin: pilih modul mana saja, atau platform-wide." : "Hanya modul yang kamu ampu."}</span>
          </legend>
          <select
            className="form-input"
            value={moduleSlug}
            onChange={(e) => setModuleSlug(e.target.value)}
          >
            <option value="">— Platform-wide (tanpa scope modul) —</option>
            {modules.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.title}
              </option>
            ))}
          </select>
        </fieldset>

        <fieldset className="form-field">
          <legend>
            <strong>Kapasitas (opsional)</strong>
          </legend>
          <input
            type="number"
            className="form-input"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(e.target.value)}
            min={1}
            max={10000}
            placeholder="Tidak terbatas"
          />
        </fieldset>
      </div>

      <div className="register-form__row">
        <fieldset className="form-field">
          <legend>
            <strong>Tanggal &amp; jam</strong>
          </legend>
          <input
            type="datetime-local"
            className="form-input"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
          />
        </fieldset>

        <fieldset className="form-field">
          <legend>
            <strong>Durasi (menit)</strong>
          </legend>
          <input
            type="number"
            className="form-input"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Math.max(5, Math.min(480, Number.parseInt(e.target.value, 10) || 60)))}
            min={5}
            max={480}
            required
          />
        </fieldset>
      </div>

      <fieldset className="form-field">
        <legend>
          <strong>Meeting URL (opsional)</strong>
          <span>
            Link Zoom, Google Meet, Jitsi, atau platform meeting lain. Kosongkan untuk
            event in-class — peserta cukup buka Slide Room di-platform.
          </span>
        </legend>
        <input
          type="url"
          className="form-input"
          value={meetingUrl}
          onChange={(e) => setMeetingUrl(e.target.value)}
          placeholder="https://meet.google.com/abc-defg-hij"
        />
      </fieldset>

      {error ? (
        <p className="login-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="profile-form__actions">
        <button
          type="button"
          className="button button--secondary"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          disabled={submitting}
        >
          Batal
        </button>
        <button type="submit" className="button button--primary" disabled={submitting}>
          {submitting ? "Menyimpan…" : "Buat Event"}
          <ArrowRightIcon size={16} />
        </button>
      </div>
    </form>
  );
}
