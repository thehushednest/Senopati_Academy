import type { Metadata } from "next";
import Link from "next/link";
import { DashboardRightBar } from "../../_components/DashboardRightBar";
import { DashboardSidebar } from "../../_components/DashboardSidebar";
import { DashboardTopbar } from "../../_components/DashboardTopbar";
import { ArrowRightIcon, CheckIcon, ClockIcon, SparklesIcon, UsersIcon } from "../../_components/Icon";
import { ProgressRing } from "../../_components/ProgressRing";
import { getMyTaughtSlugs } from "../../../lib/tutor-scope";
import { getCurrentUser } from "../../../lib/session";
import {
  buildInsights,
  getEnrollmentPerWeek,
  getPerformancePerModule,
  getTopStudents,
} from "../../../lib/tutor-analytics";

export const metadata: Metadata = {
  title: "Analitik — Tutor",
  robots: { index: false, follow: false },
  alternates: { canonical: "/tutor/analitik" },
};

export const dynamic = "force-dynamic";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export default async function TutorAnalitikPage() {
  const viewer = await getCurrentUser();
  const taughtSlugs = await getMyTaughtSlugs(); // null = admin (all)

  const [weekly, performance, topStudents] = await Promise.all([
    getEnrollmentPerWeek(taughtSlugs, 8),
    getPerformancePerModule(taughtSlugs),
    getTopStudents(taughtSlugs, 30, 5),
  ]);

  const insights = buildInsights(performance, weekly);

  const totalStudents = performance.reduce((s, m) => s + m.students, 0);
  const avgCompletion =
    performance.length > 0
      ? Math.round(performance.reduce((s, m) => s + m.averageCompletionPercent, 0) / performance.length)
      : 0;
  const completedCount = performance.reduce((s, m) => s + m.completedCount, 0);
  const newThisWeek = weekly[weekly.length - 1]?.count ?? 0;
  const totalEnrollmentsLast8w = weekly.reduce((s, w) => s + w.count, 0);

  // Average exam score across modules (non-null)
  const examScores = performance
    .map((m) => m.averageFinalExamScore)
    .filter((x): x is number => x !== null);
  const avgExamScore =
    examScores.length > 0 ? Math.round(examScores.reduce((a, b) => a + b, 0) / examScores.length) : null;

  const MAX_ENROLL = Math.max(...weekly.map((w) => w.count), 1);
  const hasMentorMapping = Array.isArray(taughtSlugs) && taughtSlugs.length > 0;
  const isAdmin = viewer?.role === "admin";

  return (
    <main className="academy-shell dashboard-shell">
      <div className="container dashboard-app">
        <DashboardSidebar />

        <section className="dashboard-app__main" aria-label="Analitik tutor">
          <DashboardTopbar placeholder="Cari data modul atau siswa" />

          <header className="dashboard-page-header">
            <div>
              <p className="eyebrow eyebrow--brand">Analitik</p>
              <h1>Performance modul &amp; siswa</h1>
              <p>
                {isAdmin
                  ? "Admin view: data lintas seluruh platform, tidak di-scope ke modul tertentu."
                  : hasMentorMapping
                  ? `Scope ke ${taughtSlugs.length} modul yang kamu ampu. Update real-time setiap student melakukan aksi.`
                  : "Akunmu belum di-map ke mentor track. Minta admin untuk map kamu ke track tertentu (mis. Praktis) supaya analitik terfokus."}
              </p>
            </div>
            <Link className="button button--secondary" href="/tutor/modul">
              Buka Modul Saya
              <ArrowRightIcon size={14} />
            </Link>
          </header>

          <div className="dashboard-section">
            <div className="analitik-summary">
              <div className="analitik-summary__ring">
                <ProgressRing value={avgCompletion} size={140} label="Avg completion" />
              </div>
              <div className="analitik-summary__stats">
                <div className="tutor-stat">
                  <span className="tutor-stat__icon tutor-stat__icon--brand">
                    <UsersIcon size={18} />
                  </span>
                  <strong>{totalStudents}</strong>
                  <span>Total siswa</span>
                </div>
                <div className="tutor-stat">
                  <span className="tutor-stat__icon tutor-stat__icon--accent">
                    <CheckIcon size={18} />
                  </span>
                  <strong>{avgCompletion}%</strong>
                  <span>Rata-rata selesai</span>
                </div>
                <div className="tutor-stat">
                  <span className="tutor-stat__icon tutor-stat__icon--indigo">
                    <SparklesIcon size={18} />
                  </span>
                  <strong>{completedCount}</strong>
                  <span>Modul selesai</span>
                </div>
                <div className="tutor-stat">
                  <span className="tutor-stat__icon tutor-stat__icon--pink">
                    <ClockIcon size={18} />
                  </span>
                  <strong>{avgExamScore !== null ? avgExamScore : "—"}</strong>
                  <span>Avg skor ujian</span>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Enrollment 8 Minggu Terakhir</h2>
              <span className="dashboard-section__count">{totalEnrollmentsLast8w} enrollment total</span>
            </header>
            <div className="analitik-chart">
              <div className="analitik-chart__bars" role="img" aria-label="Grafik enrollment mingguan">
                {weekly.map((w) => {
                  const ratio = (w.count / MAX_ENROLL) * 100;
                  return (
                    <div key={w.weekStart.toISOString()} className="analitik-chart__col">
                      <span
                        className="analitik-chart__bar"
                        style={{ height: `${Math.max(ratio, w.count > 0 ? 5 : 0)}%` }}
                        title={`${w.label}: ${w.count} enrollment, minggu mulai ${w.weekStart
                          .toISOString()
                          .slice(0, 10)}`}
                      >
                        <span>{w.count}</span>
                      </span>
                      <small>{w.label}</small>
                    </div>
                  );
                })}
              </div>
              <p className="analitik-chart__note">
                {totalEnrollmentsLast8w === 0
                  ? "Belum ada enrollment dalam window 8 minggu."
                  : `Total ${totalEnrollmentsLast8w} enrollment dalam 8 minggu terakhir${
                      newThisWeek > 0 ? ` (${newThisWeek} minggu ini)` : ""
                    }.`}
              </p>
            </div>
          </div>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Performance per Modul</h2>
              <Link className="dashboard-section__link" href="/tutor/modul">
                Buka Modul <ArrowRightIcon size={12} />
              </Link>
            </header>
            {performance.length === 0 ? (
              <div className="catalog-empty">
                <p>
                  {hasMentorMapping
                    ? "Belum ada aktivitas di modul yang kamu ampu."
                    : isAdmin
                    ? "Belum ada enrollment di platform."
                    : "Akunmu belum di-map ke mentor track."}
                </p>
              </div>
            ) : (
              <div className="analitik-module-table">
                <div className="analitik-module-table__head" role="row">
                  <span>Modul</span>
                  <span>Siswa</span>
                  <span>Completion</span>
                  <span>Avg Quiz</span>
                  <span>Avg Ujian</span>
                  <span>Avg Tugas</span>
                </div>
                {performance.map((m) => (
                  <div className="analitik-module-table__row" role="row" key={m.slug}>
                    <span>
                      <strong>{m.title}</strong>
                      {m.completedCount > 0 ? (
                        <small style={{ color: "var(--muted)", display: "block" }}>
                          {m.completedCount} selesai · {m.approvedSubmissions} tugas approved
                        </small>
                      ) : null}
                    </span>
                    <span>{m.students}</span>
                    <span className="analitik-bar-cell">
                      <div className="active-progress-bar" aria-hidden="true">
                        <span style={{ width: `${m.averageCompletionPercent}%` }} />
                      </div>
                      <small>{m.averageCompletionPercent}%</small>
                    </span>
                    <span>{m.averageQuizScore ?? "—"}</span>
                    <span>{m.averageFinalExamScore ?? "—"}</span>
                    <span>{m.averageReviewGrade ?? "—"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="tutor-columns">
            <div className="dashboard-section">
              <header className="dashboard-section__head">
                <h2>Insight Otomatis</h2>
                <span className="dashboard-section__count">{insights.length} temuan</span>
              </header>
              <ul className="analitik-insights">
                {insights.map((i) => (
                  <li key={i.title} className={`analitik-insight analitik-insight--${i.tone}`}>
                    <strong>{i.title}</strong>
                    <p>{i.desc}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="dashboard-section">
              <header className="dashboard-section__head">
                <h2>Top Siswa (30 Hari)</h2>
                <Link className="dashboard-section__link" href="/tutor/siswa">
                  Daftar Siswa <ArrowRightIcon size={12} />
                </Link>
              </header>
              {topStudents.length === 0 ? (
                <div className="catalog-empty">
                  <p>Belum ada siswa aktif dalam 30 hari terakhir.</p>
                </div>
              ) : (
                <ol className="analitik-top">
                  {topStudents.map((t, idx) => (
                    <li key={t.id}>
                      <span className="analitik-top__rank">{String(idx + 1).padStart(2, "0")}</span>
                      <span className="analitik-top__avatar">{initialsOf(t.name)}</span>
                      <div>
                        <strong>{t.name}</strong>
                        <span>
                          {t.sessionsCompleted} sesi · {t.approvedAssignments} tugas · {t.discussionReplies} balasan
                          {t.averageQuizScore !== null ? ` · avg kuis ${t.averageQuizScore}` : ""}
                        </span>
                      </div>
                      <strong className="analitik-top__score">{t.compositeScore}</strong>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </section>

        <DashboardRightBar />
      </div>
    </main>
  );
}
