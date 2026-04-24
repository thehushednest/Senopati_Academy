import type { Metadata } from "next";
import Link from "next/link";
import { DashboardRightBar } from "../../_components/DashboardRightBar";
import { DashboardSidebar } from "../../_components/DashboardSidebar";
import { DashboardTopbar } from "../../_components/DashboardTopbar";
import { ArrowRightIcon, MessageIcon } from "../../_components/Icon";
import { DeleteThreadButton } from "../../_components/DeleteThreadButton";
import { prisma } from "../../../lib/prisma";
import { findModule } from "../../../lib/content";

export const metadata: Metadata = {
  title: "Admin · Moderasi",
  robots: { index: false, follow: false },
  alternates: { canonical: "/admin/moderasi" },
};

export const dynamic = "force-dynamic";

function relativeTime(d: Date | string) {
  const then = new Date(d).getTime();
  const diff = Math.max(0, Date.now() - then);
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${Math.max(m, 1)} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const dd = Math.floor(h / 24);
  return `${dd} hari lalu`;
}

export default async function AdminModerationPage() {
  const [threads, recentReplies] = await Promise.all([
    prisma.discussionThread.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { replies: true, likes: true } },
      },
    }),
    prisma.discussionReply.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        author: { select: { id: true, name: true, email: true } },
        thread: { select: { id: true, title: true, moduleSlug: true } },
      },
    }),
  ]);

  return (
    <main className="academy-shell dashboard-shell">
      <div className="container dashboard-app">
        <DashboardSidebar />

        <section className="dashboard-app__main" aria-label="Admin moderasi">
          <DashboardTopbar placeholder="Cari thread / balasan" />

          <header className="dashboard-page-header">
            <div>
              <p className="eyebrow eyebrow--brand">Admin · Moderasi</p>
              <h1>Moderasi diskusi platform</h1>
              <p>
                {threads.length} thread terbaru · {recentReplies.length} balasan terbaru. Admin bisa hapus thread
                apabila melanggar kebijakan komunitas (spam, misinformasi, dll).
              </p>
            </div>
          </header>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Thread Terbaru</h2>
              <span className="dashboard-section__count">{threads.length}</span>
            </header>
            {threads.length === 0 ? (
              <div className="catalog-empty">
                <p>Belum ada thread di platform.</p>
              </div>
            ) : (
              <div className="tutor-thread-cards">
                {threads.map((t) => {
                  const mod = findModule(t.moduleSlug);
                  return (
                    <article
                      className={`tutor-thread-card${t._count.replies === 0 ? " tutor-thread-card--pending" : ""}`}
                      key={t.id}
                    >
                      <span className="tutor-thread-card__avatar">
                        {t.author.name.trim().charAt(0).toUpperCase()}
                      </span>
                      <div className="tutor-thread-card__body">
                        <div className="tutor-thread-card__meta">
                          <strong>{t.author.name}</strong>
                          <span>·</span>
                          <span>{t.author.email}</span>
                          <span>·</span>
                          <span>{mod?.title ?? t.moduleSlug}</span>
                          <span>·</span>
                          <span>{relativeTime(t.createdAt)}</span>
                        </div>
                        <h3>{t.title}</h3>
                        <p>
                          "{t.body.slice(0, 200)}
                          {t.body.length > 200 ? "…" : ""}"
                        </p>
                        <div className="tutor-thread-card__footer">
                          <span>
                            <MessageIcon size={14} /> {t._count.replies} balasan · ♥ {t._count.likes}
                          </span>
                          <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
                            <Link
                              className="button button--ghost button--sm"
                              href={`/belajar/${t.moduleSlug}/diskusi/${t.id}`}
                            >
                              Buka
                              <ArrowRightIcon size={12} />
                            </Link>
                            <DeleteThreadButton threadId={t.id} />
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Balasan Terbaru</h2>
              <span className="dashboard-section__count">{recentReplies.length}</span>
            </header>
            {recentReplies.length === 0 ? (
              <div className="catalog-empty">
                <p>Belum ada balasan di platform.</p>
              </div>
            ) : (
              <ul className="activity-list">
                {recentReplies.map((r) => {
                  const mod = findModule(r.thread.moduleSlug);
                  return (
                    <li className="activity-item" key={r.id}>
                      <span className="activity-item__tag">Balasan</span>
                      <div className="activity-item__body">
                        <strong>{r.author.name}</strong>
                        <p>
                          Di &quot;{r.thread.title}&quot; ({mod?.title ?? r.thread.moduleSlug}) —{" "}
                          {r.body.slice(0, 140)}
                          {r.body.length > 140 ? "…" : ""}
                        </p>
                        <span className="activity-item__time">{relativeTime(r.createdAt)}</span>
                      </div>
                      <Link
                        className="activity-item__link"
                        href={`/belajar/${r.thread.moduleSlug}/diskusi/${r.thread.id}`}
                      >
                        Buka
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <DashboardRightBar />
      </div>
    </main>
  );
}

