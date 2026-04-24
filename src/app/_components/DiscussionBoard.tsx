"use client";

import { useEffect, useState } from "react";
import type { DiscussionThread as StaticThread } from "../../lib/content";
import { ArrowRightIcon, MessageIcon } from "./Icon";

type ApiThread = {
  id: string;
  moduleSlug: string;
  sessionIndex: number | null;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string; avatarUrl: string | null };
  _count: { replies: number; likes: number };
};

type Props = {
  moduleSlug: string;
  initialThreads: StaticThread[];
};

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

function relativeTime(iso: string) {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now - then);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Baru saja";
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID");
}

export function DiscussionBoard({ moduleSlug, initialThreads }: Props) {
  const [threads, setThreads] = useState<ApiThread[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/discussion?moduleSlug=${encodeURIComponent(moduleSlug)}`);
        if (!res.ok) throw new Error("Gagal memuat diskusi");
        const data = await res.json();
        if (!cancelled) setThreads(data.threads ?? []);
      } catch {
        if (!cancelled) setThreads([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [moduleSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/discussion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleSlug,
          title: title.trim(),
          body: body.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Gagal mengirim thread" }));
        throw new Error(data.error ?? "Gagal mengirim thread");
      }
      const data = await res.json();
      setThreads((prev) => [data.thread, ...(prev ?? [])]);
      setTitle("");
      setBody("");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim thread");
    } finally {
      setSubmitting(false);
    }
  };

  // Gabungkan hardcoded initial (contoh) + DB threads saat kosong, supaya halaman tidak kelihatan kosong di fase awal.
  const displayThreads: Array<
    | { kind: "api"; thread: ApiThread }
    | { kind: "static"; thread: StaticThread }
  > = threads && threads.length > 0
    ? threads.map((t) => ({ kind: "api" as const, thread: t }))
    : initialThreads.map((t) => ({ kind: "static" as const, thread: t }));

  return (
    <div className="discussion-board">
      <div className="discussion-board__header">
        <div>
          <h2>Diskusi modul</h2>
          <p>
            Tanya, bagikan insight, atau minta feedback ke mentor dan peserta lain. Semua orang di
            sini sedang belajar hal yang sama.
          </p>
        </div>
        <button
          type="button"
          className="button button--primary"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "Tutup Form" : "Buat Thread Baru"}
        </button>
      </div>

      {showForm ? (
        <form className="discussion-form" onSubmit={handleSubmit}>
          <label>
            <span>Judul singkat</span>
            <input
              className="form-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Misal: Di sesi 02, saya bingung soal…"
              maxLength={120}
              required
            />
          </label>
          <label>
            <span>Pertanyaan atau diskusimu</span>
            <textarea
              className="form-input"
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Jelaskan secukupnya — konteks yang baik membantu orang lain ikut menjawab."
              required
            />
          </label>
          {error ? (
            <p className="profile-form__hint" role="alert" style={{ color: "#c62828" }}>
              {error}
            </p>
          ) : null}
          <div className="discussion-form__actions">
            <button
              type="button"
              className="button button--secondary"
              onClick={() => setShowForm(false)}
              disabled={submitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="button button--primary"
              disabled={!title.trim() || !body.trim() || submitting}
            >
              {submitting ? "Mengirim…" : "Kirim Thread"}
              <ArrowRightIcon size={16} />
            </button>
          </div>
        </form>
      ) : null}

      {loading ? (
        <div className="catalog-empty">
          <p>Memuat diskusi…</p>
        </div>
      ) : displayThreads.length === 0 ? (
        <div className="catalog-empty">
          <p>Belum ada thread. Mulai diskusi pertama dari tombol di atas.</p>
        </div>
      ) : (
        <ul className="thread-list" aria-label="Daftar thread">
          {displayThreads.map((entry) => {
            if (entry.kind === "api") {
              const t = entry.thread;
              return (
                <li className="thread-card" key={t.id}>
                  <span className="thread-card__avatar">{initialsOf(t.author.name)}</span>
                  <div className="thread-card__body">
                    <div className="thread-card__meta">
                      <strong>{t.author.name}</strong>
                      <span>·</span>
                      <span>{relativeTime(t.updatedAt)}</span>
                      {t.sessionIndex !== null ? (
                        <>
                          <span>·</span>
                          <span>Sesi {String(t.sessionIndex + 1).padStart(2, "0")}</span>
                        </>
                      ) : null}
                    </div>
                    <h3>{t.title}</h3>
                    <p>{t.body}</p>
                    <div className="thread-card__footer">
                      <span>
                        <MessageIcon size={14} /> {t._count.replies} balasan
                      </span>
                      <span>♥ {t._count.likes} like</span>
                    </div>
                  </div>
                </li>
              );
            }
            const t = entry.thread;
            return (
              <li className="thread-card" key={t.id}>
                <span className="thread-card__avatar">{t.initials}</span>
                <div className="thread-card__body">
                  <div className="thread-card__meta">
                    <strong>{t.author}</strong>
                    <span>·</span>
                    <span>{t.lastActivity}</span>
                    {t.sessionIndex !== undefined ? (
                      <>
                        <span>·</span>
                        <span>Sesi {String(t.sessionIndex + 1).padStart(2, "0")}</span>
                      </>
                    ) : null}
                  </div>
                  <h3>{t.title}</h3>
                  <p>{t.body}</p>
                  <div className="thread-card__footer">
                    <span>
                      <MessageIcon size={14} /> {t.replies} balasan
                    </span>
                    <span>♥ {t.likes} like</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
