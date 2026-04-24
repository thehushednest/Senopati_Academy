import Link from "next/link";
import { DashboardRightBar } from "./DashboardRightBar";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopbar } from "./DashboardTopbar";
import {
  ArrowRightIcon,
  BookIcon,
  CheckIcon,
  ClockIcon,
  MessageIcon,
  PlayIcon,
  SparklesIcon,
  UsersIcon
} from "./Icon";
import { UserName } from "./UserName";

const REVIEW_QUEUE = [
  {
    id: "rv1",
    student: "Alya Pertiwi",
    moduleSlug: "introduction-to-ai",
    moduleTitle: "Introduction to AI",
    session: "Sesi 03 — Challenge prompt",
    submittedAt: "2 jam lalu",
    urgent: true
  },
  {
    id: "rv2",
    student: "Fariz Maulana",
    moduleSlug: "ai-prompts-101",
    moduleTitle: "AI Prompts 101",
    session: "Sesi 02 — Zero-shot vs Few-shot",
    submittedAt: "4 jam lalu",
    urgent: false
  },
  {
    id: "rv3",
    student: "Intan Rahma",
    moduleSlug: "introduction-to-ai",
    moduleTitle: "Introduction to AI",
    session: "Sesi 02 — Memahami training data",
    submittedAt: "1 hari lalu",
    urgent: false
  },
  {
    id: "rv4",
    student: "Rizky Pramudita",
    moduleSlug: "ai-prompts-101",
    moduleTitle: "AI Prompts 101",
    session: "Sesi 04 — Chain-of-thought",
    submittedAt: "2 hari lalu",
    urgent: false
  }
];

const OWNED_MODULES = [
  {
    slug: "introduction-to-ai",
    title: "Introduction to AI",
    students: 42,
    completion: 68,
    newEnroll: 4,
    pendingReview: 3,
    unreadDiscussion: 2
  },
  {
    slug: "ai-prompts-101",
    title: "AI Prompts 101",
    students: 68,
    completion: 52,
    newEnroll: 9,
    pendingReview: 5,
    unreadDiscussion: 7
  },
  {
    slug: "ai-for-writing",
    title: "AI untuk Menulis",
    students: 24,
    completion: 41,
    newEnroll: 1,
    pendingReview: 1,
    unreadDiscussion: 0
  }
];

const UPCOMING_LIVE = [
  {
    id: "tl1",
    title: "Q&A Mingguan Foundations",
    date: "Kamis, 18 April · 19.00 WIB",
    participants: 42,
    status: "ready"
  },
  {
    id: "tl2",
    title: "Workshop Prompt Engineering",
    date: "Sabtu, 27 April · 10.00 WIB",
    participants: 68,
    status: "draft"
  }
];

const DISCUSSION_ALERTS = [
  {
    id: "d1",
    student: "Alya Pertiwi",
    title: "Sesi 02 — bingung bedanya supervised vs unsupervised",
    moduleTitle: "Introduction to AI",
    time: "15 menit lalu"
  },
  {
    id: "d2",
    student: "Bima Saputra",
    title: "Error pas coba prompt chain-of-thought",
    moduleTitle: "AI Prompts 101",
    time: "1 jam lalu"
  },
  {
    id: "d3",
    student: "Chandra Wijaya",
    title: "Rekomendasi referensi untuk topik bias",
    moduleTitle: "Introduction to AI",
    time: "3 jam lalu"
  }
];

const RECENT_ENROLLMENTS = [
  { name: "Nadia Putri", module: "AI Prompts 101", time: "1 jam lalu" },
  { name: "Rendy Kusuma", module: "Introduction to AI", time: "3 jam lalu" },
  { name: "Sari Dewi", module: "AI untuk Menulis", time: "Kemarin" },
  { name: "Tegar Ramadhan", module: "AI Prompts 101", time: "Kemarin" }
];

export function TutorDashboard() {
  const totalStudents = OWNED_MODULES.reduce((sum, m) => sum + m.students, 0);
  const totalPending = OWNED_MODULES.reduce((sum, m) => sum + m.pendingReview, 0);
  const totalUnread = OWNED_MODULES.reduce((sum, m) => sum + m.unreadDiscussion, 0);
  const totalNew = OWNED_MODULES.reduce((sum, m) => sum + m.newEnroll, 0);

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
                {totalPending} tugas menunggu review, {totalUnread} pertanyaan diskusi baru, dan{" "}
                {UPCOMING_LIVE.length} live session dalam 2 minggu ini.
              </p>
              <div className="tutor-hero__actions">
                <Link className="button button--primary" href="/tutor/review">
                  Review {totalPending} Tugas
                  <ArrowRightIcon size={16} />
                </Link>
                <Link className="button button--secondary" href="/tutor/modul">
                  Buka Modul Saya
                </Link>
              </div>
            </div>
            <div className="tutor-stats">
              <div className="tutor-stat">
                <span className="tutor-stat__icon tutor-stat__icon--brand">
                  <UsersIcon size={18} />
                </span>
                <strong>{totalStudents}</strong>
                <span>Siswa aktif</span>
              </div>
              <div className="tutor-stat">
                <span className="tutor-stat__icon tutor-stat__icon--accent">
                  <BookIcon size={18} />
                </span>
                <strong>{OWNED_MODULES.length}</strong>
                <span>Modul diampu</span>
              </div>
              <div className="tutor-stat">
                <span className="tutor-stat__icon tutor-stat__icon--indigo">
                  <CheckIcon size={18} />
                </span>
                <strong>{totalPending}</strong>
                <span>Review pending</span>
              </div>
              <div className="tutor-stat">
                <span className="tutor-stat__icon tutor-stat__icon--pink">
                  <SparklesIcon size={18} />
                </span>
                <strong>{totalNew}</strong>
                <span>Siswa baru</span>
              </div>
            </div>
          </div>

          <div className="tutor-columns">
            <div className="dashboard-section">
              <header className="dashboard-section__head">
                <h2>Antrean Review</h2>
                <Link className="dashboard-section__link" href="/tutor/review">
                  Semua · {totalPending} <ArrowRightIcon size={14} />
                </Link>
              </header>
              <ul className="tutor-queue">
                {REVIEW_QUEUE.map((item) => (
                  <li
                    className={`tutor-queue__item${item.urgent ? " tutor-queue__item--urgent" : ""}`}
                    key={item.id}
                  >
                    <span className="tutor-queue__avatar" aria-hidden="true">
                      {item.student.charAt(0)}
                    </span>
                    <div className="tutor-queue__body">
                      <strong>{item.student}</strong>
                      <span>
                        {item.moduleTitle} · {item.session}
                      </span>
                      <small>Dikirim {item.submittedAt}</small>
                    </div>
                    <div className="tutor-queue__actions">
                      {item.urgent ? (
                        <span className="tutor-queue__tag">Urgent</span>
                      ) : null}
                      <Link
                        className="button button--primary button--sm"
                        href={`/tutor/review/${item.id}`}
                      >
                        Review
                        <ArrowRightIcon size={14} />
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="dashboard-section">
              <header className="dashboard-section__head">
                <h2>Live Session yang Kamu Host</h2>
                <Link className="dashboard-section__link" href="/tutor/live">
                  Kelola Jadwal <ArrowRightIcon size={14} />
                </Link>
              </header>
              <div className="tutor-live">
                {UPCOMING_LIVE.map((ev) => (
                  <article className="tutor-live__item" key={ev.id}>
                    <span className="tutor-live__icon">
                      <PlayIcon size={16} />
                    </span>
                    <div>
                      <strong>{ev.title}</strong>
                      <span>{ev.date}</span>
                      <small>
                        {ev.participants} peserta terdaftar ·{" "}
                        <em className={`tutor-live__status tutor-live__status--${ev.status}`}>
                          {ev.status === "ready" ? "Siap Host" : "Draft materi"}
                        </em>
                      </small>
                    </div>
                    <div className="tutor-live__actions">
                      <Link className="button button--primary button--sm" href={`#${ev.id}`}>
                        {ev.status === "ready" ? "Mulai Host" : "Lengkapi"}
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Modul yang Kamu Ampu</h2>
              <Link className="dashboard-section__link" href="/tutor/modul">
                Kelola Modul <ArrowRightIcon size={14} />
              </Link>
            </header>
            <div className="tutor-modul-grid">
              {OWNED_MODULES.map((mod) => (
                <article className="tutor-modul-card" key={mod.slug}>
                  <header>
                    <h3>{mod.title}</h3>
                    <Link href={`/tutor/modul/${mod.slug}`} className="tutor-modul-card__edit">
                      Edit konten
                      <ArrowRightIcon size={12} />
                    </Link>
                  </header>
                  <div className="tutor-modul-card__stats">
                    <div>
                      <strong>{mod.students}</strong>
                      <span>siswa</span>
                    </div>
                    <div>
                      <strong>{mod.completion}%</strong>
                      <span>selesai</span>
                    </div>
                    <div>
                      <strong>+{mod.newEnroll}</strong>
                      <span>minggu ini</span>
                    </div>
                  </div>
                  <div className="active-progress-bar" aria-hidden="true">
                    <span style={{ width: `${mod.completion}%` }} />
                  </div>
                  <footer>
                    <span className="tutor-modul-card__badge tutor-modul-card__badge--review">
                      <CheckIcon size={12} /> {mod.pendingReview} review
                    </span>
                    <span className="tutor-modul-card__badge tutor-modul-card__badge--discuss">
                      <MessageIcon size={12} /> {mod.unreadDiscussion} diskusi
                    </span>
                  </footer>
                </article>
              ))}
            </div>
          </div>

          <div className="tutor-columns">
            <div className="dashboard-section">
              <header className="dashboard-section__head">
                <h2>Diskusi Butuh Balasan</h2>
                <Link className="dashboard-section__link" href="/tutor/siswa">
                  Semua Diskusi <ArrowRightIcon size={14} />
                </Link>
              </header>
              <ul className="tutor-thread-list">
                {DISCUSSION_ALERTS.map((item) => (
                  <li key={item.id}>
                    <span className="tutor-thread-list__dot" aria-hidden="true" />
                    <div>
                      <strong>{item.title}</strong>
                      <span>
                        {item.student} · {item.moduleTitle} · {item.time}
                      </span>
                    </div>
                    <Link
                      className="button button--secondary button--sm"
                      href={`#${item.id}`}
                    >
                      Balas
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="dashboard-section">
              <header className="dashboard-section__head">
                <h2>Enrollment Terbaru</h2>
                <Link className="dashboard-section__link" href="/tutor/siswa">
                  Daftar Siswa <ArrowRightIcon size={14} />
                </Link>
              </header>
              <ul className="tutor-enroll-list">
                {RECENT_ENROLLMENTS.map((e, idx) => (
                  <li key={idx}>
                    <span className="tutor-enroll-list__avatar" aria-hidden="true">
                      {e.name.charAt(0)}
                    </span>
                    <div>
                      <strong>{e.name}</strong>
                      <span>{e.module}</span>
                    </div>
                    <small>{e.time}</small>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="tutor-cta">
              <div>
                <p className="eyebrow eyebrow--brand">Untuk Kamu</p>
                <h2>Materi & soal siap bantu kamu nge-grade lebih cepat.</h2>
                <p>
                  Buka library rubric, template feedback, dan soal bank dari Senopati Strategic
                  Institute. Copy-paste, adjust, kirim.
                </p>
              </div>
              <div className="tutor-cta__actions">
                <Link className="button button--accent" href="/tutor/materi">
                  Buka Materi Tutor
                  <ArrowRightIcon size={16} />
                </Link>
                <Link className="button button--ghost" href="/tutor/analitik">
                  <ClockIcon size={14} />
                  Lihat Analitik
                </Link>
              </div>
            </div>
          </div>
        </section>

        <DashboardRightBar
          reminders={[
            {
              title: "Deadline review tugas Intro to AI",
              date: "Hari ini · 23.59 WIB",
              tone: "accent"
            },
            {
              title: "Prep Q&A Kamis 19.00",
              date: "Besok sore",
              tone: "brand"
            },
            {
              title: "Meeting koordinasi kurikulum",
              date: "Jumat 14.00 WIB",
              tone: "indigo"
            }
          ]}
        />
      </div>
    </main>
  );
}
