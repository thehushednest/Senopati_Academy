import Link from "next/link";
import { DashboardRightBar } from "./DashboardRightBar";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopbar } from "./DashboardTopbar";
import {
  ArrowRightIcon,
  BookIcon,
  CheckIcon,
  MessageIcon,
  SparklesIcon,
  UsersIcon
} from "./Icon";
import { UserName } from "./UserName";
import { prisma } from "../../lib/prisma";
import { findModule } from "../../lib/content";

function relativeTime(d: Date | string) {
  const then = new Date(d).getTime();
  const diff = Math.max(0, Date.now() - then);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const dd = Math.floor(h / 24);
  if (dd < 7) return `${dd} hari lalu`;
  return new Date(d).toLocaleDateString("id-ID");
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export async function TutorDashboard() {
  const [studentCount, pendingReviews, reviewingReviews, queueItems, recentEnrollments, threadsPending] =
    await Promise.all([
      prisma.user.count({ where: { role: "student" } }),
      prisma.assignmentSubmission.count({ where: { status: "submitted" } }),
      prisma.assignmentSubmission.count({ where: { status: "reviewing" } }),
      prisma.assignmentSubmission.findMany({
        where: { status: "submitted" },
        orderBy: { submittedAt: "desc" },
        take: 5,
        include: { student: { select: { id: true, name: true, avatarUrl: true } } },
      }),
      prisma.moduleProgress.findMany({
        orderBy: { startedAt: "desc" },
        take: 5,
        select: {
          moduleSlug: true,
          startedAt: true,
          student: { select: { id: true, name: true } },
        },
      }),
      prisma.discussionThread.findMany({
        orderBy: { updatedAt: "desc" },
        take: 6,
        include: {
          author: { select: { id: true, name: true } },
          _count: { select: { replies: true } },
        },
      }),
    ]);

  // Modul yang sedang dipelajari siswa (aggregate). Untuk sekarang ambil top modules by count.
  const moduleEnrollments = await prisma.moduleProgress.groupBy({
    by: ["moduleSlug"],
    _count: { _all: true },
    _avg: { completedSessions: true, totalSessions: true },
    _max: { updatedAt: true },
    orderBy: { _count: { moduleSlug: "desc" } },
    take: 4,
  });

  const totalEnrollments = await prisma.moduleProgress.count();
  const unansweredThreads = threadsPending.filter((t) => t._count.replies === 0);

  return (
    <main className="academy-shell dashboard-shell">
      <div className="container dashboard-app">
        <DashboardSidebar />

        <section className="dashboard-app__main" aria-label="Tutor dashboard">
          <DashboardTopbar placeholder="Cari siswa, modul, atau submission" />

          <div className="tutor-hero">
            <div>
              <p className="eyebrow eyebrow--brand">Tutor Dashboard</p>
              <h1>
                Halo, <UserName fallback="Tutor" />.
              </h1>
              <p>
                {pendingReviews === 0 && reviewingReviews === 0
                  ? "Tidak ada tugas menunggu review saat ini."
                  : `${pendingReviews} tugas menunggu review${reviewingReviews > 0 ? `, ${reviewingReviews} sedang di-review` : ""}.`}{" "}
                {unansweredThreads.length > 0
                  ? `${unansweredThreads.length} thread diskusi belum dibalas.`
                  : "Semua thread diskusi sudah dibalas."}
              </p>
              <div className="tutor-hero__actions">
                <Link className="button button--primary" href="/tutor/review">
                  {pendingReviews > 0 ? `Review ${pendingReviews} Tugas` : "Lihat Antrean Review"}
                  <ArrowRightIcon size={16} />
                </Link>
                <Link className="button button--secondary" href="/tutor/siswa">
                  Daftar Siswa
                </Link>
              </div>
            </div>
            <div className="tutor-stats">
              <div className="tutor-stat">
                <span className="tutor-stat__icon tutor-stat__icon--brand">
                  <UsersIcon size={18} />
                </span>
                <strong>{studentCount}</strong>
                <span>Total siswa</span>
              </div>
              <div className="tutor-stat">
                <span className="tutor-stat__icon tutor-stat__icon--accent">
                  <BookIcon size={18} />
                </span>
                <strong>{totalEnrollments}</strong>
                <span>Enrollment modul</span>
              </div>
              <div className="tutor-stat">
                <span className="tutor-stat__icon tutor-stat__icon--indigo">
                  <CheckIcon size={18} />
                </span>
                <strong>{pendingReviews}</strong>
                <span>Review pending</span>
              </div>
              <div className="tutor-stat">
                <span className="tutor-stat__icon tutor-stat__icon--pink">
                  <SparklesIcon size={18} />
                </span>
                <strong>{unansweredThreads.length}</strong>
                <span>Thread tanpa balasan</span>
              </div>
            </div>
          </div>

          <div className="tutor-columns">
            <div className="dashboard-section">
              <header className="dashboard-section__head">
                <h2>Antrean Review</h2>
                <Link className="dashboard-section__link" href="/tutor/review">
                  Semua · {pendingReviews} <ArrowRightIcon size={14} />
                </Link>
              </header>
              {queueItems.length === 0 ? (
                <div className="catalog-empty">
                  <p>Tidak ada submission pending. Santai dulu atau cek diskusi.</p>
                </div>
              ) : (
                <ul className="tutor-queue">
                  {queueItems.map((item) => {
                    const mod = findModule(item.moduleSlug);
                    return (
                      <li className="tutor-queue__item" key={item.id}>
                        <span className="tutor-queue__avatar" aria-hidden="true">
                          {initialsOf(item.student.name)}
                        </span>
                        <div className="tutor-queue__body">
                          <strong>{item.student.name}</strong>
                          <span>
                            {mod?.title ?? item.moduleSlug} · Sesi {String(item.sessionIndex + 1).padStart(2, "0")}
                          </span>
                          <small>Dikirim {relativeTime(item.submittedAt)}</small>
                        </div>
                        <div className="tutor-queue__actions">
                          <Link
                            className="button button--primary button--sm"
                            href={`/tutor/review/${item.id}`}
                          >
                            Review
                            <ArrowRightIcon size={14} />
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="dashboard-section">
              <header className="dashboard-section__head">
                <h2>Diskusi Terbaru</h2>
                <Link className="dashboard-section__link" href="/tutor/siswa">
                  Semua <ArrowRightIcon size={14} />
                </Link>
              </header>
              {threadsPending.length === 0 ? (
                <div className="catalog-empty">
                  <p>Belum ada thread diskusi dari siswa.</p>
                </div>
              ) : (
                <ul className="tutor-thread-list">
                  {threadsPending.slice(0, 4).map((t) => (
                    <li key={t.id}>
                      <span
                        className="tutor-thread-list__dot"
                        aria-hidden="true"
                        style={
                          t._count.replies === 0
                            ? { background: "#e11d48" }
                            : { background: "rgba(15,23,42,0.18)" }
                        }
                      />
                      <div>
                        <strong>{t.title}</strong>
                        <span>
                          {t.author.name} · {findModule(t.moduleSlug)?.title ?? t.moduleSlug} ·{" "}
                          {relativeTime(t.updatedAt)}
                        </span>
                      </div>
                      <Link
                        className={
                          t._count.replies === 0
                            ? "button button--primary button--sm"
                            : "button button--secondary button--sm"
                        }
                        href={`/belajar/${t.moduleSlug}/diskusi/${t.id}`}
                      >
                        {t._count.replies === 0 ? "Balas" : "Buka"}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Modul yang Banyak Dipelajari</h2>
              <Link className="dashboard-section__link" href="/modul">
                Lihat Katalog <ArrowRightIcon size={14} />
              </Link>
            </header>
            {moduleEnrollments.length === 0 ? (
              <div className="catalog-empty">
                <p>Belum ada siswa yang memulai modul.</p>
              </div>
            ) : (
              <div className="tutor-modul-grid">
                {moduleEnrollments.map((me) => {
                  const mod = findModule(me.moduleSlug);
                  if (!mod) return null;
                  const avgCompleted = me._avg.completedSessions ?? 0;
                  const avgTotal = me._avg.totalSessions ?? 0;
                  const completion =
                    avgTotal > 0 ? Math.round((avgCompleted / avgTotal) * 100) : 0;
                  return (
                    <article className="tutor-modul-card" key={me.moduleSlug}>
                      <header>
                        <h3>{mod.title}</h3>
                        <Link href={`/modul/${mod.slug}`} className="tutor-modul-card__edit">
                          Buka
                          <ArrowRightIcon size={12} />
                        </Link>
                      </header>
                      <div className="tutor-modul-card__stats">
                        <div>
                          <strong>{me._count._all}</strong>
                          <span>siswa</span>
                        </div>
                        <div>
                          <strong>{completion}%</strong>
                          <span>avg selesai</span>
                        </div>
                        <div>
                          <strong>{me._max.updatedAt ? relativeTime(me._max.updatedAt) : "-"}</strong>
                          <span>aktivitas</span>
                        </div>
                      </div>
                      <div className="active-progress-bar" aria-hidden="true">
                        <span style={{ width: `${completion}%` }} />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Enrollment Terbaru</h2>
              <Link className="dashboard-section__link" href="/tutor/siswa">
                Daftar Siswa <ArrowRightIcon size={14} />
              </Link>
            </header>
            {recentEnrollments.length === 0 ? (
              <div className="catalog-empty">
                <p>Belum ada enrollment baru.</p>
              </div>
            ) : (
              <ul className="tutor-enroll-list">
                {recentEnrollments.map((e, idx) => {
                  const mod = findModule(e.moduleSlug);
                  return (
                    <li key={idx}>
                      <span className="tutor-enroll-list__avatar" aria-hidden="true">
                        {initialsOf(e.student.name)}
                      </span>
                      <div>
                        <strong>{e.student.name}</strong>
                        <span>{mod?.title ?? e.moduleSlug}</span>
                      </div>
                      <small>{relativeTime(e.startedAt)}</small>
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
