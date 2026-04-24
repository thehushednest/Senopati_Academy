import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { getCurrentUser } from "../../lib/session";
import { ArrowRightIcon } from "../_components/Icon";

export const metadata: Metadata = {
  title: "Notifikasi — Senopati Academy",
  description: "Semua notifikasi aktivitas belajar, reply diskusi, dan sertifikat.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/notifikasi" },
};

export const dynamic = "force-dynamic";

function formatDateTime(d: Date) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export default async function NotifikasiPage() {
  const user = await getCurrentUser();
  // Middleware sudah protect, tapi defensive.
  if (!user) {
    return null;
  }

  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);

  return (
    <main className="academy-shell">
      <div className="container">
        <section className="onboarding-hero onboarding-hero--compact" aria-label="Notifikasi">
          <p className="eyebrow eyebrow--brand">Notifikasi</p>
          <h1>
            {unreadCount > 0 ? (
              <>
                Ada <span className="highlight-text">{unreadCount} update</span> yang belum kamu baca.
              </>
            ) : (
              <>
                Semua notifikasi <span className="highlight-text">sudah terbaca</span>.
              </>
            )}
          </h1>
          <p className="lede">
            Reply thread, feedback mentor, sertifikat baru, dan update belajar lainnya akan
            muncul di sini.
          </p>
        </section>

        <section aria-label="Daftar notifikasi" className="section-spacer">
          {items.length === 0 ? (
            <div className="catalog-empty">
              <p>Belum ada notifikasi. Mulai interaksi di thread diskusi atau selesaikan modul untuk mendapat update.</p>
              <div style={{ marginTop: 12 }}>
                <Link className="button button--primary button--sm" href="/dashboard">
                  Kembali ke Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <ul className="notif-page-list">
              {items.map((n) => {
                const unread = n.readAt === null;
                const content = (
                  <>
                    <div>
                      <strong>{n.title}</strong>
                      <p>{n.body}</p>
                      <span className="notif-page-list__time">{formatDateTime(n.createdAt)}</span>
                    </div>
                    {unread ? <span className="notif-item__dot" aria-label="Belum dibaca" /> : null}
                  </>
                );
                return (
                  <li
                    className={"notif-page-item" + (unread ? " notif-page-item--unread" : "")}
                    key={n.id}
                  >
                    {n.href ? (
                      <Link href={n.href}>
                        {content}
                        <ArrowRightIcon size={14} />
                      </Link>
                    ) : (
                      <div>{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
