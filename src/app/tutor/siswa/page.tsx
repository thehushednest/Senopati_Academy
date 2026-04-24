import type { Metadata } from "next";
import Link from "next/link";
import { DashboardRightBar } from "../../_components/DashboardRightBar";
import { DashboardSidebar } from "../../_components/DashboardSidebar";
import { DashboardTopbar } from "../../_components/DashboardTopbar";
import { ArrowRightIcon, MessageIcon } from "../../_components/Icon";

export const metadata: Metadata = {
  title: "Siswa & Diskusi — Tutor",
  robots: { index: false, follow: false },
  alternates: { canonical: "/tutor/siswa" }
};

type Student = {
  name: string;
  initials: string;
  module: string;
  progress: number;
  lastActive: string;
  status: "active" | "stuck" | "inactive";
};

const STUDENTS: Student[] = [
  { name: "Alya Pertiwi", initials: "A", module: "Introduction to AI", progress: 75, lastActive: "2 jam lalu", status: "active" },
  { name: "Bima Saputra", initials: "B", module: "AI Prompts 101", progress: 42, lastActive: "Kemarin", status: "active" },
  { name: "Chandra Wijaya", initials: "C", module: "Introduction to AI", progress: 15, lastActive: "3 hari lalu", status: "stuck" },
  { name: "Dewi Anggraini", initials: "D", module: "AI untuk Menulis", progress: 88, lastActive: "1 jam lalu", status: "active" },
  { name: "Eko Prasetyo", initials: "E", module: "AI Prompts 101", progress: 22, lastActive: "5 hari lalu", status: "inactive" },
  { name: "Fariz Maulana", initials: "F", module: "AI Prompts 101", progress: 58, lastActive: "4 jam lalu", status: "active" }
];

type Thread = {
  id: string;
  student: string;
  initials: string;
  module: string;
  title: string;
  excerpt: string;
  time: string;
  replies: number;
  needsResponse: boolean;
};

const THREADS: Thread[] = [
  {
    id: "th1",
    student: "Alya Pertiwi",
    initials: "A",
    module: "Introduction to AI",
    title: "Bingung bedanya supervised dan unsupervised di sesi 02",
    excerpt: "Saya coba baca materi ulang tapi masih belum nangkep contohnya. Ada analogi yang lebih simple?",
    time: "15 menit lalu",
    replies: 0,
    needsResponse: true
  },
  {
    id: "th2",
    student: "Bima Saputra",
    initials: "B",
    module: "AI Prompts 101",
    title: "Error saat coba chain-of-thought prompt",
    excerpt: "AI-nya jawab tidak sesuai pattern yang diajarkan. Apa mungkin ada kesalahan di struktur prompt?",
    time: "1 jam lalu",
    replies: 1,
    needsResponse: true
  },
  {
    id: "th3",
    student: "Chandra Wijaya",
    initials: "C",
    module: "Introduction to AI",
    title: "Rekomendasi referensi untuk topik bias",
    excerpt: "Setelah sesi 04, saya pengen pelajari lebih dalam soal bias di konteks Indonesia.",
    time: "3 jam lalu",
    replies: 2,
    needsResponse: false
  }
];

const STATUS_META = {
  active: { label: "Aktif", tone: "brand" as const },
  stuck: { label: "Stuck", tone: "accent" as const },
  inactive: { label: "Tidak aktif", tone: "muted" as const }
};

export default function TutorSiswaPage() {
  const active = STUDENTS.filter((s) => s.status === "active").length;
  const stuck = STUDENTS.filter((s) => s.status === "stuck").length;
  const unread = THREADS.filter((t) => t.needsResponse).length;

  return (
    <main className="academy-shell dashboard-shell">
      <div className="container dashboard-app">
        <DashboardSidebar />

        <section className="dashboard-app__main" aria-label="Siswa & diskusi">
          <DashboardTopbar placeholder="Cari siswa atau thread diskusi" />

          <header className="dashboard-page-header">
            <div>
              <p className="eyebrow eyebrow--brand">Siswa & Diskusi</p>
              <h1>Kelola siswa dan respon pertanyaan</h1>
              <p>
                {STUDENTS.length} siswa enrolled · {active} aktif · {stuck} stuck · {unread} diskusi
                butuh balasan.
              </p>
            </div>
            <div className="tutor-siswa-stats">
              <div>
                <strong>{STUDENTS.length}</strong>
                <span>Total siswa</span>
              </div>
              <div>
                <strong>{active}</strong>
                <span>Aktif 7 hari</span>
              </div>
              <div>
                <strong>{stuck}</strong>
                <span>Butuh bantuan</span>
              </div>
              <div>
                <strong>{unread}</strong>
                <span>Diskusi pending</span>
              </div>
            </div>
          </header>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Diskusi Butuh Balasan</h2>
              <span className="dashboard-section__count">{unread} thread</span>
            </header>
            <div className="tutor-thread-cards">
              {THREADS.map((t) => (
                <article
                  className={`tutor-thread-card${t.needsResponse ? " tutor-thread-card--pending" : ""}`}
                  key={t.id}
                >
                  <span className="tutor-thread-card__avatar">{t.initials}</span>
                  <div className="tutor-thread-card__body">
                    <div className="tutor-thread-card__meta">
                      <strong>{t.student}</strong>
                      <span>·</span>
                      <span>{t.module}</span>
                      <span>·</span>
                      <span>{t.time}</span>
                      {t.needsResponse ? (
                        <span className="tutor-thread-card__pending">Belum dibalas</span>
                      ) : null}
                    </div>
                    <h3>{t.title}</h3>
                    <p>"{t.excerpt}"</p>
                    <div className="tutor-thread-card__footer">
                      <span>
                        <MessageIcon size={14} /> {t.replies} balasan
                      </span>
                      <Link
                        className={t.needsResponse ? "button button--primary button--sm" : "button button--secondary button--sm"}
                        href={`#${t.id}`}
                      >
                        {t.needsResponse ? "Balas Thread" : "Lihat Thread"}
                        <ArrowRightIcon size={12} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Daftar Siswa</h2>
              <span className="dashboard-section__count">{STUDENTS.length} peserta</span>
            </header>
            <div className="rekaman-filters">
              <button className="chip chip--active" type="button">Semua</button>
              <button className="chip" type="button">Aktif</button>
              <button className="chip" type="button">Stuck</button>
              <button className="chip" type="button">Tidak aktif</button>
              <button className="chip" type="button">Introduction to AI</button>
              <button className="chip" type="button">AI Prompts 101</button>
            </div>

            <div className="student-grid">
              {STUDENTS.map((s) => {
                const status = STATUS_META[s.status];
                return (
                  <article className="student-card" key={s.name}>
                    <div className="student-card__head">
                      <span className={`student-card__avatar student-card__avatar--${status.tone}`}>
                        {s.initials}
                      </span>
                      <div>
                        <strong>{s.name}</strong>
                        <span>{s.module}</span>
                      </div>
                      <span className={`tutor-status tutor-status--${status.tone}`}>
                        <span className="tutor-status__dot" aria-hidden="true" />
                        {status.label}
                      </span>
                    </div>
                    <div className="student-card__progress">
                      <div className="student-card__progress-head">
                        <span>Progress</span>
                        <strong>{s.progress}%</strong>
                      </div>
                      <div className="active-progress-bar" aria-hidden="true">
                        <span style={{ width: `${s.progress}%` }} />
                      </div>
                    </div>
                    <footer className="student-card__footer">
                      <span>Terakhir aktif {s.lastActive}</span>
                      <Link className="button button--ghost button--sm" href={`#${s.name}`}>
                        Detail
                        <ArrowRightIcon size={12} />
                      </Link>
                    </footer>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <DashboardRightBar />
      </div>
    </main>
  );
}
