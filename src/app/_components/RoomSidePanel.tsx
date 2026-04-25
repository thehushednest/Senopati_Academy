"use client";

import { useEffect, useRef, useState } from "react";

type ChatMsg = {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  ts: number;
};

type Question = {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  upvotes: number;
  answered: boolean;
  createdAt: number;
  votedByMe?: boolean;
};

type Props = {
  eventId: string;
  currentUserId: string;
  isHostOrAdmin: boolean;
  /** Shared SSE source — pass dari parent (Presenter/Viewer Room) supaya hanya 1 connection per page. */
  source: EventSource | null;
};

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export function RoomSidePanel({ eventId, currentUserId, isHostOrAdmin, source }: Props) {
  const [tab, setTab] = useState<"chat" | "qna">("chat");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [chatDraft, setChatDraft] = useState("");
  const [qnaDraft, setQnaDraft] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [qnaSending, setQnaSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [qnaError, setQnaError] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Initial Q&A fetch
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/live-events/${eventId}/qna`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data.questions)) setQuestions(data.questions);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  // Subscribe ke shared SSE — chat + qna_* events.
  useEffect(() => {
    if (!source) return;

    const onChat = (e: MessageEvent) => {
      try {
        const msg = JSON.parse(e.data) as ChatMsg;
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg].slice(-100);
        });
      } catch {
        // ignore
      }
    };
    const onQnaNew = (e: MessageEvent) => {
      try {
        const q = JSON.parse(e.data) as Question;
        setQuestions((prev) => {
          if (prev.some((x) => x.id === q.id)) return prev;
          return [...prev, { ...q, votedByMe: false }];
        });
      } catch {
        // ignore
      }
    };
    const onQnaUpdate = (e: MessageEvent) => {
      try {
        const upd = JSON.parse(e.data) as { id: string; upvotes: number; answered: boolean };
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === upd.id ? { ...q, upvotes: upd.upvotes, answered: upd.answered } : q,
          ),
        );
      } catch {
        // ignore
      }
    };
    const onQnaDelete = (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data) as { id: string };
        setQuestions((prev) => prev.filter((q) => q.id !== d.id));
      } catch {
        // ignore
      }
    };

    source.addEventListener("chat", onChat);
    source.addEventListener("qna_new", onQnaNew);
    source.addEventListener("qna_update", onQnaUpdate);
    source.addEventListener("qna_delete", onQnaDelete);

    return () => {
      source.removeEventListener("chat", onChat);
      source.removeEventListener("qna_new", onQnaNew);
      source.removeEventListener("qna_update", onQnaUpdate);
      source.removeEventListener("qna_delete", onQnaDelete);
    };
  }, [source]);

  // Auto-scroll chat
  useEffect(() => {
    if (tab !== "chat") return;
    const el = chatScrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, tab]);

  const sendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatDraft.trim();
    if (!text) return;
    setChatSending(true);
    setChatError(null);
    try {
      const res = await fetch(`/api/live-events/${eventId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Gagal kirim" }));
        setChatError(data.error ?? "Gagal kirim");
        return;
      }
      setChatDraft("");
    } finally {
      setChatSending(false);
    }
  };

  const sendQna = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = qnaDraft.trim();
    if (body.length < 3) {
      setQnaError("Pertanyaan minimal 3 karakter");
      return;
    }
    setQnaSending(true);
    setQnaError(null);
    try {
      const res = await fetch(`/api/live-events/${eventId}/qna`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Gagal kirim" }));
        setQnaError(data.error ?? "Gagal kirim");
        return;
      }
      setQnaDraft("");
    } finally {
      setQnaSending(false);
    }
  };

  const toggleVote = async (q: Question) => {
    if (q.authorId === currentUserId) return; // tidak vote sendiri
    // Optimistic update
    setQuestions((prev) =>
      prev.map((x) =>
        x.id === q.id
          ? { ...x, upvotes: x.upvotes + (x.votedByMe ? -1 : 1), votedByMe: !x.votedByMe }
          : x,
      ),
    );
    try {
      const res = await fetch(`/api/live-events/${eventId}/qna/${q.id}/vote`, {
        method: "POST",
      });
      if (!res.ok) {
        // Revert
        setQuestions((prev) =>
          prev.map((x) =>
            x.id === q.id
              ? { ...x, upvotes: x.upvotes + (x.votedByMe ? -1 : 1), votedByMe: !x.votedByMe }
              : x,
          ),
        );
      }
    } catch {
      // ignore — server-broadcast akan re-sync state
    }
  };

  const markAnswered = async (q: Question) => {
    await fetch(`/api/live-events/${eventId}/qna/${q.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answered: !q.answered }),
    });
  };

  const deleteQna = async (q: Question) => {
    if (!window.confirm("Hapus pertanyaan ini?")) return;
    await fetch(`/api/live-events/${eventId}/qna/${q.id}`, { method: "DELETE" });
  };

  // Sort: answered terakhir, sisanya by upvotes desc, lalu createdAt asc.
  const sortedQuestions = [...questions].sort((a, b) => {
    if (a.answered !== b.answered) return a.answered ? 1 : -1;
    if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
    return a.createdAt - b.createdAt;
  });

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "10px 8px",
    border: "none",
    background: active ? "#fff" : "transparent",
    borderBottom: active ? "2px solid var(--brand-strong)" : "2px solid transparent",
    color: active ? "var(--ink)" : "var(--muted)",
    fontWeight: 700,
    fontSize: "0.85rem",
    cursor: "pointer",
    letterSpacing: "0.02em",
  });

  return (
    <aside
      style={{
        background: "rgba(15, 23, 42, 0.02)",
        border: "1px solid rgba(15, 23, 42, 0.08)",
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 420,
      }}
    >
      <div
        role="tablist"
        style={{
          display: "flex",
          borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
          background: "rgba(15, 23, 42, 0.04)",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "chat"}
          onClick={() => setTab("chat")}
          style={tabBtnStyle(tab === "chat")}
        >
          Chat
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "qna"}
          onClick={() => setTab("qna")}
          style={tabBtnStyle(tab === "qna")}
        >
          Q&amp;A
          {questions.filter((q) => !q.answered).length > 0 ? (
            <span
              style={{
                marginLeft: 6,
                fontSize: "0.7rem",
                background: "var(--brand-strong)",
                color: "#fff",
                padding: "1px 6px",
                borderRadius: 999,
              }}
            >
              {questions.filter((q) => !q.answered).length}
            </span>
          ) : null}
        </button>
      </div>

      {tab === "chat" ? (
        <>
          <div
            ref={chatScrollRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 12,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {messages.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: "0.85rem", textAlign: "center", margin: "auto" }}>
                Belum ada pesan. Chat di sini bersifat sementara — tidak disimpan.
              </p>
            ) : (
              messages.map((m) => {
                const mine = m.authorId === currentUserId;
                return (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: mine ? "flex-end" : "flex-start",
                    }}
                  >
                    <small
                      style={{
                        color: "var(--muted)",
                        fontSize: "0.7rem",
                        marginBottom: 2,
                      }}
                    >
                      {mine ? "Kamu" : m.authorName} · {fmtTime(m.ts)}
                    </small>
                    <div
                      style={{
                        background: mine ? "var(--brand-strong)" : "#fff",
                        color: mine ? "#fff" : "var(--ink)",
                        padding: "6px 10px",
                        borderRadius: 10,
                        fontSize: "0.88rem",
                        maxWidth: "85%",
                        wordBreak: "break-word",
                        border: mine ? "none" : "1px solid rgba(15, 23, 42, 0.08)",
                      }}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <form
            onSubmit={sendChat}
            style={{
              display: "flex",
              gap: 6,
              padding: 10,
              borderTop: "1px solid rgba(15, 23, 42, 0.08)",
            }}
          >
            <input
              type="text"
              className="form-input"
              value={chatDraft}
              onChange={(e) => setChatDraft(e.target.value)}
              placeholder="Tulis pesan…"
              maxLength={500}
              disabled={chatSending}
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              className="button button--primary button--sm"
              disabled={chatSending || !chatDraft.trim()}
            >
              Kirim
            </button>
          </form>
          {chatError ? (
            <small style={{ color: "#c62828", padding: "0 12px 8px" }}>{chatError}</small>
          ) : null}
        </>
      ) : (
        <>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 12,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {sortedQuestions.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: "0.85rem", textAlign: "center", margin: "auto" }}>
                Belum ada pertanyaan. Tulis pertanyaanmu di bawah.
              </p>
            ) : (
              sortedQuestions.map((q) => {
                const isAuthor = q.authorId === currentUserId;
                return (
                  <div
                    key={q.id}
                    style={{
                      display: "flex",
                      gap: 8,
                      padding: 10,
                      borderRadius: 10,
                      background: q.answered ? "rgba(24, 194, 156, 0.06)" : "#fff",
                      border: q.answered
                        ? "1px solid rgba(24, 194, 156, 0.3)"
                        : "1px solid rgba(15, 23, 42, 0.08)",
                      opacity: q.answered ? 0.85 : 1,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleVote(q)}
                      disabled={isAuthor}
                      title={isAuthor ? "Tidak bisa vote pertanyaan sendiri" : "Upvote"}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                        padding: "4px 6px",
                        border: "1px solid",
                        borderColor: q.votedByMe ? "var(--brand-strong)" : "rgba(15, 23, 42, 0.12)",
                        borderRadius: 6,
                        background: q.votedByMe ? "rgba(24, 194, 156, 0.12)" : "#fff",
                        color: q.votedByMe ? "var(--brand-strong)" : "var(--ink-soft)",
                        cursor: isAuthor ? "not-allowed" : "pointer",
                        minWidth: 36,
                        fontSize: "0.75rem",
                      }}
                    >
                      <span style={{ fontSize: "0.85rem", lineHeight: 1 }}>▲</span>
                      <strong>{q.upvotes}</strong>
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                        <small style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                          {isAuthor ? "Kamu" : q.authorName} · {fmtTime(q.createdAt)}
                        </small>
                        {q.answered ? (
                          <span
                            style={{
                              fontSize: "0.65rem",
                              fontWeight: 800,
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                              padding: "1px 6px",
                              borderRadius: 999,
                              background: "rgba(24, 194, 156, 0.18)",
                              color: "var(--brand-strong)",
                            }}
                          >
                            ✓ Dijawab
                          </span>
                        ) : null}
                      </div>
                      <p
                        style={{
                          margin: "4px 0 0 0",
                          fontSize: "0.88rem",
                          wordBreak: "break-word",
                        }}
                      >
                        {q.body}
                      </p>
                      {(isHostOrAdmin || isAuthor) && (
                        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                          {isHostOrAdmin ? (
                            <button
                              type="button"
                              onClick={() => markAnswered(q)}
                              style={{
                                fontSize: "0.72rem",
                                background: "transparent",
                                border: "none",
                                padding: 0,
                                color: "var(--brand-strong)",
                                cursor: "pointer",
                                fontWeight: 600,
                              }}
                            >
                              {q.answered ? "Buka kembali" : "Tandai dijawab"}
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => deleteQna(q)}
                            style={{
                              fontSize: "0.72rem",
                              background: "transparent",
                              border: "none",
                              padding: 0,
                              color: "#c62828",
                              cursor: "pointer",
                              fontWeight: 600,
                            }}
                          >
                            Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <form
            onSubmit={sendQna}
            style={{
              display: "flex",
              gap: 6,
              padding: 10,
              borderTop: "1px solid rgba(15, 23, 42, 0.08)",
              flexDirection: "column",
            }}
          >
            <textarea
              className="form-input"
              value={qnaDraft}
              onChange={(e) => setQnaDraft(e.target.value)}
              placeholder="Tulis pertanyaan…"
              maxLength={1000}
              rows={2}
              disabled={qnaSending}
              style={{ resize: "vertical" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <small style={{ color: "var(--muted)", fontSize: "0.72rem" }}>
                {qnaDraft.length}/1000
              </small>
              <button
                type="submit"
                className="button button--primary button--sm"
                disabled={qnaSending || qnaDraft.trim().length < 3}
              >
                Kirim Pertanyaan
              </button>
            </div>
          </form>
          {qnaError ? (
            <small style={{ color: "#c62828", padding: "0 12px 8px" }}>{qnaError}</small>
          ) : null}
        </>
      )}
    </aside>
  );
}
