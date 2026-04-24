import type { Metadata } from "next";
import Link from "next/link";
import { DashboardRightBar } from "../../_components/DashboardRightBar";
import { DashboardSidebar } from "../../_components/DashboardSidebar";
import { DashboardTopbar } from "../../_components/DashboardTopbar";
import { ArrowRightIcon, CheckIcon, ClockIcon, SparklesIcon, UsersIcon } from "../../_components/Icon";
import { ProgressRing } from "../../_components/ProgressRing";

export const metadata: Metadata = {
  title: "Analitik — Tutor",
  robots: { index: false, follow: false },
  alternates: { canonical: "/tutor/analitik" }
};

const WEEKLY_ENROLLMENT = [
  { week: "W1", count: 8 },
  { week: "W2", count: 12 },
  { week: "W3", count: 14 },
  { week: "W4", count: 9 },
  { week: "W5", count: 18 },
  { week: "W6", count: 22 },
  { week: "W7", count: 15 },
  { week: "W8", count: 24 }
];

const MODULE_ANALYTICS = [
  {
    slug: "introduction-to-ai",
    title: "Introduction to AI",
    students: 42,
    completion: 68,
    avgQuiz: 82,
    avgSubmission: 78,
    satisfaction: 4.7
  },
  {
    slug: "ai-prompts-101",
    title: "AI Prompts 101",
    students: 68,
    completion: 52,
    avgQuiz: 75,
    avgSubmission: 80,
    satisfaction: 4.8
  },
  {
    slug: "ai-for-writing",
    title: "AI untuk Menulis",
    students: 24,
    completion: 41,
    avgQuiz: 70,
    avgSubmission: 74,
    satisfaction: 4.5
  }
];

const TOP_STUDENTS = [
  { name: "Dewi Anggraini", initials: "D", module: "AI untuk Menulis", score: 94 },
  { name: "Alya Pertiwi", initials: "A", module: "Introduction to AI", score: 91 },
  { name: "Nadia Putri", initials: "N", module: "AI Prompts 101", score: 89 },
  { name: "Fariz Maulana", initials: "F", module: "AI Prompts 101", score: 86 },
  { name: "Rizky Pramudita", initials: "R", module: "AI Prompts 101", score: 84 }
];

const INSIGHTS = [
  {
    tone: "brand" as const,
    title: "Sesi 04 jadi titik drop-off",
    desc: "28% siswa berhenti di Sesi 04 Introduction to AI. Pertimbangkan revisi pacing atau tambah contoh nyata."
  },
  {
    tone: "accent" as const,
    title: "SLA review kamu 38 jam",
    desc: "Bagus — di bawah target 48 jam. Konsistensi ini bantu engagement siswa tetap tinggi."
  },
  {
    tone: "indigo" as const,
    title: "Rating feedback 4.7★",
    desc: "Siswa apresiasi feedback spesifik kamu. Pola template 'Revisi terarah' jadi favorit."
  }
];

const MAX_ENROLL = Math.max(...WEEKLY_ENROLLMENT.map((w) => w.count));

export default function TutorAnalitikPage() {
  const totalStudents = MODULE_ANALYTICS.reduce((s, m) => s + m.students, 0);
  const avgCompletion = Math.round(
    MODULE_ANALYTICS.reduce((s, m) => s + m.completion, 0) / MODULE_ANALYTICS.length
  );
  const avgSatisfaction = (
    MODULE_ANALYTICS.reduce((s, m) => s + m.satisfaction, 0) / MODULE_ANALYTICS.length
  ).toFixed(1);

  return (
    <main className="academy-shell dashboard-shell">
      <div className="container dashboard-app">
        <DashboardSidebar />

        <section className="dashboard-app__main" aria-label="Analitik tutor">
          <DashboardTopbar placeholder="Cari data modul atau siswa" />

          <header className="dashboard-page-header">
            <div>
              <p className="eyebrow eyebrow--brand">Analitik</p>
              <h1>Performance modul & siswa kamu</h1>
              <p>
                Update setiap jam. Gunakan data ini untuk identifikasi drop-off, topik sulit, atau
                siswa yang butuh perhatian ekstra.
              </p>
            </div>
            <Link className="button button--secondary" href="#export">
              Export CSV
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
                  <strong>{avgSatisfaction}★</strong>
                  <span>Kepuasan siswa</span>
                </div>
                <div className="tutor-stat">
                  <span className="tutor-stat__icon tutor-stat__icon--pink">
                    <ClockIcon size={18} />
                  </span>
                  <strong>38j</strong>
                  <span>SLA review</span>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Enrollment 8 Minggu Terakhir</h2>
              <span className="dashboard-section__count">+122 siswa total</span>
            </header>
            <div className="analitik-chart">
              <div className="analitik-chart__bars" role="img" aria-label="Grafik enrollment mingguan">
                {WEEKLY_ENROLLMENT.map((w) => (
                  <div key={w.week} className="analitik-chart__col">
                    <span className="analitik-chart__bar" style={{ height: `${(w.count / MAX_ENROLL) * 100}%` }}>
                      <span>{w.count}</span>
                    </span>
                    <small>{w.week}</small>
                  </div>
                ))}
              </div>
              <p className="analitik-chart__note">
                Trend naik konsisten, kecuali W4 dan W7 (holiday & libur UTS). Sudah sesuai
                ekspektasi.
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
            <div className="analitik-module-table">
              <div className="analitik-module-table__head" role="row">
                <span>Modul</span>
                <span>Siswa</span>
                <span>Completion</span>
                <span>Avg Quiz</span>
                <span>Avg Tugas</span>
                <span>Kepuasan</span>
              </div>
              {MODULE_ANALYTICS.map((m) => (
                <div className="analitik-module-table__row" role="row" key={m.slug}>
                  <span>
                    <strong>{m.title}</strong>
                  </span>
                  <span>{m.students}</span>
                  <span className="analitik-bar-cell">
                    <div className="active-progress-bar" aria-hidden="true">
                      <span style={{ width: `${m.completion}%` }} />
                    </div>
                    <small>{m.completion}%</small>
                  </span>
                  <span>{m.avgQuiz}</span>
                  <span>{m.avgSubmission}</span>
                  <span><strong>{m.satisfaction}★</strong></span>
                </div>
              ))}
            </div>
          </div>

          <div className="tutor-columns">
            <div className="dashboard-section">
              <header className="dashboard-section__head">
                <h2>Insight Otomatis</h2>
                <span className="dashboard-section__count">{INSIGHTS.length} temuan</span>
              </header>
              <ul className="analitik-insights">
                {INSIGHTS.map((i) => (
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
              <ol className="analitik-top">
                {TOP_STUDENTS.map((t, idx) => (
                  <li key={t.name}>
                    <span className="analitik-top__rank">{String(idx + 1).padStart(2, "0")}</span>
                    <span className="analitik-top__avatar">{t.initials}</span>
                    <div>
                      <strong>{t.name}</strong>
                      <span>{t.module}</span>
                    </div>
                    <strong className="analitik-top__score">{t.score}</strong>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <DashboardRightBar />
      </div>
    </main>
  );
}
