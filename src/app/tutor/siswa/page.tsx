import type { Metadata } from "next";
import Link from "next/link";
import { DashboardRightBar } from "../../_components/DashboardRightBar";
import { DashboardSidebar } from "../../_components/DashboardSidebar";
import { DashboardTopbar } from "../../_components/DashboardTopbar";
import { ArrowRightIcon, MessageIcon } from "../../_components/Icon";
import { prisma } from "../../../lib/prisma";
import { findModule } from "../../../lib/content";

export const metadata: Metadata = {
  title: "Siswa & Diskusi — Tutor",
  robots: { index: false, follow: false },
  alternates: { canonical: "/tutor/siswa" },
};

export const dynamic = "force-dynamic";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

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

type StudentStatus = "active" | "stuck" | "inactive";

function classifyStatus(lastActiveAt: Date | null): StudentStatus {
  if (!lastActiveAt) return "inactive";
  const daysSince = Math.floor((Date.now() - lastActiveAt.getTime()) / (24 * 3600 * 1000));
  if (daysSince <= 2) return "active";
  if (daysSince <= 7) return "stuck";
  return "inactive";
}

const STATUS_META: Record<StudentStatus, { label: string; tone: "brand" | "accent" | "muted" }> = {
  active: { label: "Aktif", tone: "brand" },
  stuck: { label: "Butuh bantuan", tone: "accent" },
  inactive: { label: "Tidak aktif", tone: "muted" },
};

export default async function TutorSiswaPage() {
  const [students, threads] = await Promise.all([
    prisma.user.findMany({
      where: { role: "student" },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        school: true,
        grade: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.discussionThread.findMany({
      orderBy: { updatedAt: "desc" },
      take: 10,
      include: {
        author: { select: { id: true, name: true } },
        _count: { select: { replies: true } },
      },
    }),
  ]);

  const studentIds = students.map((s) => s.id);
  const progresses =
    studentIds.length > 0
      ? await prisma.moduleProgress.findMany({
          where: { studentId: { in: studentIds } },
          orderBy: { updatedAt: "desc" },
          select: {
            studentId: true,
            moduleSlug: true,
            completedSessions: true,
            totalSessions: true,
            updatedAt: true,
          },
        })
      : [];

  const studentMap = new Map<
    string,
    {
      completed: number;
      total: number;
      count: number;
      lastActive: Date | null;
      latestModuleSlug: string | null;
    }
  >();

  for (const p of progresses) {
    const agg = studentMap.get(p.studentId) ?? {
      completed: 0,
      total: 0,
      count: 0,
      lastActive: null as Date | null,
      latestModuleSlug: null as string | null,
    };
    agg.completed += p.completedSessions;
    agg.total += p.totalSessions;
    agg.count += 1;
    if (!agg.lastActive || p.updatedAt > agg.lastActive) {
      agg.lastActive = p.updatedAt;
      agg.latestModuleSlug = p.moduleSlug;
    }
    studentMap.set(p.studentId, agg);
  }

  const enrichedStudents = students.map((s) => {
    const agg = studentMap.get(s.id);
    const status = classifyStatus(agg?.lastActive ?? null);
    const progressPercent =
      agg && agg.total > 0 ? Math.round((agg.completed / agg.total) * 100) : 0;
    const moduleTitle = agg?.latestModuleSlug
      ? findModule(agg.latestModuleSlug)?.title ?? agg.latestModuleSlug
      : "Belum mulai modul";
    return { ...s, status, progressPercent, moduleTitle, lastActive: agg?.lastActive ?? null };
  });

  const activeCount = enrichedStudents.filter((s) => s.status === "active").length;
  const stuckCount = enrichedStudents.filter((s) => s.status === "stuck").length;
  const unansweredThreads = threads.filter((t) => t._count.replies === 0);

  return (
    <main className="academy-shell dashboard-shell">
      <div className="container dashboard-app">
        <DashboardSidebar />

        <section className="dashboard-app__main" aria-label="Siswa & diskusi">
          <DashboardTopbar placeholder="Cari siswa atau thread diskusi" />

          <header className="dashboard-page-header">
            <div>
              <p className="eyebrow eyebrow--brand">Siswa &amp; Diskusi</p>
              <h1>Kelola siswa dan respon pertanyaan</h1>
              <p>
                {students.length} siswa terdaftar · {activeCount} aktif · {stuckCount} butuh
                bantuan · {unansweredThreads.length} diskusi belum dibalas.
              </p>
            </div>
            <div className="tutor-siswa-stats">
              <div>
                <strong>{students.length}</strong>
                <span>Total siswa</span>
              </div>
              <div>
                <strong>{activeCount}</strong>
                <span>Aktif 2 hari</span>
              </div>
              <div>
                <strong>{stuckCount}</strong>
                <span>Stuck 3-7 hari</span>
              </div>
              <div>
                <strong>{unansweredThreads.length}</strong>
                <span>Diskusi pending</span>
              </div>
            </div>
          </header>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Diskusi Terbaru</h2>
              <span className="dashboard-section__count">{threads.length} thread</span>
            </header>
            {threads.length === 0 ? (
              <div className="catalog-empty">
                <p>Belum ada thread diskusi dari siswa.</p>
              </div>
            ) : (
              <div className="tutor-thread-cards">
                {threads.map((t) => {
                  const mod = findModule(t.moduleSlug);
                  const needsResponse = t._count.replies === 0;
                  return (
                    <article
                      className={`tutor-thread-card${needsResponse ? " tutor-thread-card--pending" : ""}`}
                      key={t.id}
                    >
                      <span className="tutor-thread-card__avatar">{initialsOf(t.author.name)}</span>
                      <div className="tutor-thread-card__body">
                        <div className="tutor-thread-card__meta">
                          <strong>{t.author.name}</strong>
                          <span>·</span>
                          <span>{mod?.title ?? t.moduleSlug}</span>
                          <span>·</span>
                          <span>{relativeTime(t.updatedAt)}</span>
                          {needsResponse ? (
                            <span className="tutor-thread-card__pending">Belum dibalas</span>
                          ) : null}
                        </div>
                        <h3>{t.title}</h3>
                        <p>
                          "{t.body.slice(0, 180)}
                          {t.body.length > 180 ? "…" : ""}"
                        </p>
                        <div className="tutor-thread-card__footer">
                          <span>
                            <MessageIcon size={14} /> {t._count.replies} balasan
                          </span>
                          <Link
                            className={
                              needsResponse
                                ? "button button--primary button--sm"
                                : "button button--secondary button--sm"
                            }
                            href={`/belajar/${t.moduleSlug}/diskusi/${t.id}`}
                          >
                            {needsResponse ? "Balas Thread" : "Buka Thread"}
                            <ArrowRightIcon size={12} />
                          </Link>
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
              <h2>Daftar Siswa</h2>
              <span className="dashboard-section__count">{students.length} peserta</span>
            </header>

            {enrichedStudents.length === 0 ? (
              <div className="catalog-empty">
                <p>Belum ada siswa terdaftar.</p>
              </div>
            ) : (
              <div className="student-grid">
                {enrichedStudents.map((s) => {
                  const status = STATUS_META[s.status];
                  return (
                    <article className="student-card" key={s.id}>
                      <div className="student-card__head">
                        <span className={`student-card__avatar student-card__avatar--${status.tone}`}>
                          {initialsOf(s.name)}
                        </span>
                        <div>
                          <strong>{s.name}</strong>
                          <span>{s.moduleTitle}</span>
                        </div>
                        <span className={`tutor-status tutor-status--${status.tone}`}>
                          <span className="tutor-status__dot" aria-hidden="true" />
                          {status.label}
                        </span>
                      </div>
                      <div className="student-card__progress">
                        <div className="student-card__progress-head">
                          <span>Progress</span>
                          <strong>{s.progressPercent}%</strong>
                        </div>
                        <div className="active-progress-bar" aria-hidden="true">
                          <span style={{ width: `${s.progressPercent}%` }} />
                        </div>
                      </div>
                      <footer className="student-card__footer">
                        <span>
                          {s.lastActive
                            ? `Terakhir aktif ${relativeTime(s.lastActive)}`
                            : "Belum pernah aktif"}
                        </span>
                        <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
                          {s.school || s.grade ? `${s.school ?? ""}${s.school && s.grade ? " · " : ""}${s.grade ?? ""}` : s.email}
                        </span>
                      </footer>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <DashboardRightBar />
      </div>
    </main>
  );
}
