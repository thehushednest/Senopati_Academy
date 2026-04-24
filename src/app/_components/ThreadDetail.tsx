"use client";

import { useEffect, useState } from "react";
import { ArrowRightIcon, MessageIcon } from "./Icon";

type Author = { id: string; name: string; avatarUrl: string | null };

type Reply = {
  id: string;
  body: string;
  createdAt: string;
  author: Author;
};

type ThreadPayload = {
  id: string;
  moduleSlug: string;
  sessionIndex: number | null;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: Author;
  replies: Reply[];
  _count: { likes: number };
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

type Props = {
  threadId: string;
};

export function ThreadDetail({ threadId }: Props) {
  const [thread, setThread] = useState<ThreadPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [replyBody, setReplyBody] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [togglingLike, setTogglingLike] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/discussion/${threadId}`);
        if (!res.ok) throw new Error("Thread tidak ditemukan");
        const data = await res.json();
        if (cancelled) return;
        setThread(data.thread);
        setLikeCount(data.thread._count?.likes ?? 0);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Gagal memuat thread");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [threadId]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (replyBody.trim().length < 2) return;
    setReplyError(null);
    setSubmittingReply(true);
    try {
      const res = await fetch(`/api/discussion/${threadId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyBody.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Gagal mengirim balasan" }));
        throw new Error(data.error ?? "Gagal mengirim balasan");
      }
      const data = await res.json();
      setThread((prev) =>
        prev
          ? { ...prev, replies: [...prev.replies, data.reply as Reply] }
          : prev
      );
      setReplyBody("");
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : "Gagal mengirim balasan");
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleLike = async () => {
    if (togglingLike) return;
    setTogglingLike(true);
    try {
      const res = await fetch(`/api/discussion/${threadId}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setLiked(Boolean(data.liked));
        setLikeCount(Number(data.count ?? 0));
      }
    } catch {
      // ignore
    } finally {
      setTogglingLike(false);
    }
  };

  if (loading) {
    return (
      <div className="catalog-empty">
        <p>Memuat thread…</p>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="catalog-empty">
        <p>{error ?? "Thread tidak ditemukan."}</p>
      </div>
    );
  }

  return (
    <article className="thread-detail">
      <header className="thread-detail__head">
        <span className="thread-card__avatar">{initialsOf(thread.author.name)}</span>
        <div>
          <div className="thread-card__meta">
            <strong>{thread.author.name}</strong>
            <span>·</span>
            <span>{relativeTime(thread.createdAt)}</span>
            {thread.sessionIndex !== null ? (
              <>
                <span>·</span>
                <span>Sesi {String(thread.sessionIndex + 1).padStart(2, "0")}</span>
              </>
            ) : null}
          </div>
          <h1 style={{ marginTop: 8 }}>{thread.title}</h1>
        </div>
      </header>

      <div className="thread-detail__body">
        <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, color: "var(--ink)" }}>
          {thread.body}
        </p>
      </div>

      <footer className="thread-detail__meta">
        <button
          type="button"
          className={"button button--sm " + (liked ? "button--primary" : "button--secondary")}
          onClick={handleLike}
          disabled={togglingLike}
          aria-pressed={liked}
        >
          ♥ {likeCount} like
        </button>
        <span style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
          <MessageIcon size={14} /> {thread.replies.length} balasan
        </span>
      </footer>

      <section aria-label="Balasan" className="thread-replies">
        <h2 style={{ marginTop: 28, marginBottom: 12 }}>Balasan</h2>
        {thread.replies.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>
            Belum ada balasan. Jadi yang pertama jawab atau sekadar kasih dukungan.
          </p>
        ) : (
          <ul className="reply-list">
            {thread.replies.map((reply) => (
              <li className="reply-item" key={reply.id}>
                <span className="thread-card__avatar">{initialsOf(reply.author.name)}</span>
                <div>
                  <div className="thread-card__meta">
                    <strong>{reply.author.name}</strong>
                    <span>·</span>
                    <span>{relativeTime(reply.createdAt)}</span>
                  </div>
                  <p style={{ whiteSpace: "pre-wrap", marginTop: 6, lineHeight: 1.6 }}>
                    {reply.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Form balas" className="thread-reply-form">
        <h3 style={{ marginTop: 28, marginBottom: 10 }}>Balas thread ini</h3>
        <form onSubmit={handleReply}>
          <textarea
            className="form-input"
            rows={4}
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder="Tulis balasan kamu — bisa jawaban, pertanyaan lanjutan, atau tautan referensi."
            maxLength={4000}
          />
          {replyError ? (
            <p className="profile-form__hint" role="alert" style={{ color: "#c62828" }}>
              {replyError}
            </p>
          ) : null}
          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              type="submit"
              className="button button--primary button--sm"
              disabled={replyBody.trim().length < 2 || submittingReply}
            >
              {submittingReply ? "Mengirim…" : "Kirim Balasan"}
              <ArrowRightIcon size={14} />
            </button>
          </div>
        </form>
      </section>
    </article>
  );
}
