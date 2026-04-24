"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { BellIcon, CheckIcon } from "./Icon";
import { useAuth } from "./AuthProvider";

type Notification = {
  id: string;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

function relativeTime(iso: string) {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now - then);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}j`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}h`;
  return new Date(iso).toLocaleDateString("id-ID");
}

export function NotificationBell() {
  const { user, isHydrated } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/notifications?limit=15");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // ignore
    }
  }, [user]);

  // Fetch count saat mount & kalau user berubah; poll tiap 60 detik.
  useEffect(() => {
    if (!isHydrated || !user) return;
    refresh();
    const handle = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(handle);
  }, [isHydrated, user, refresh]);

  // Refresh juga ketika dibuka.
  useEffect(() => {
    if (open) {
      setLoading(true);
      refresh().finally(() => setLoading(false));
    }
  }, [open, refresh]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  const markRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    } catch {
      // ignore
    }
    setNotifications((prev) =>
      prev ? prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)) : prev,
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
    } catch {
      // ignore
    }
    setNotifications((prev) =>
      prev
        ? prev.map((n) => (n.readAt ? n : { ...n, readAt: new Date().toISOString() }))
        : prev,
    );
    setUnreadCount(0);
  };

  // Tidak render sama sekali saat belum hydrated atau belum login.
  if (!isHydrated || !user) return null;

  return (
    <div className="notif-bell" ref={wrapperRef}>
      <button
        type="button"
        className="icon-button notif-bell__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-label={unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : "Notifikasi"}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <BellIcon size={18} />
        {unreadCount > 0 ? (
          <span className="notif-bell__badge" aria-hidden="true">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="notif-bell__panel" role="menu">
          <div className="notif-bell__header">
            <strong>Notifikasi</strong>
            {unreadCount > 0 ? (
              <button type="button" className="notif-bell__mark-all" onClick={markAllRead}>
                <CheckIcon size={12} /> Tandai dibaca
              </button>
            ) : null}
          </div>

          {loading && notifications === null ? (
            <p className="notif-bell__empty">Memuat…</p>
          ) : !notifications || notifications.length === 0 ? (
            <p className="notif-bell__empty">Belum ada notifikasi. Balasan thread, sertifikat baru, dan update lain akan muncul di sini.</p>
          ) : (
            <ul className="notif-bell__list">
              {notifications.map((n) => {
                const unread = n.readAt === null;
                const content = (
                  <>
                    <div className="notif-item__body">
                      <strong>{n.title}</strong>
                      <p>{n.body}</p>
                      <span className="notif-item__time">{relativeTime(n.createdAt)}</span>
                    </div>
                    {unread ? <span className="notif-item__dot" aria-label="Belum dibaca" /> : null}
                  </>
                );
                return (
                  <li
                    className={"notif-item" + (unread ? " notif-item--unread" : "")}
                    key={n.id}
                  >
                    {n.href ? (
                      <Link href={n.href} onClick={() => { setOpen(false); if (unread) markRead(n.id); }}>
                        {content}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { if (unread) markRead(n.id); }}
                      >
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <div className="notif-bell__footer">
            <Link href="/notifikasi" onClick={() => setOpen(false)}>
              Lihat semua notifikasi
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
