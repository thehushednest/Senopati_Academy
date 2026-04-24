import type { Metadata } from "next";
import Link from "next/link";
import { DashboardRightBar } from "../../_components/DashboardRightBar";
import { DashboardSidebar } from "../../_components/DashboardSidebar";
import { DashboardTopbar } from "../../_components/DashboardTopbar";
import { ArrowRightIcon, CheckIcon, ClockIcon } from "../../_components/Icon";

export const metadata: Metadata = {
  title: "Review Tugas — Tutor",
  robots: { index: false, follow: false },
  alternates: { canonical: "/tutor/review" }
};

type Submission = {
  id: string;
  student: string;
  initials: string;
  moduleTitle: string;
  session: string;
  submittedAt: string;
  deadlineLeft: string;
  wordCount: number;
  urgency: "high" | "medium" | "low";
  status: "pending" | "reviewed" | "revision";
};

const SUBMISSIONS: Submission[] = [
  {
    id: "s1",
    student: "Alya Pertiwi",
    initials: "A",
    moduleTitle: "Introduction to AI",
    session: "Sesi 03 — Challenge prompt pertama",
    submittedAt: "2 jam lalu",
    deadlineLeft: "Deadline review hari ini 23.59",
    wordCount: 284,
    urgency: "high",
    status: "pending"
  },
  {
    id: "s2",
    student: "Fariz Maulana",
    initials: "F",
    moduleTitle: "AI Prompts 101",
    session: "Sesi 02 — Zero-shot vs Few-shot",
    submittedAt: "4 jam lalu",
    deadlineLeft: "Sisa 22 jam untuk review",
    wordCount: 341,
    urgency: "medium",
    status: "pending"
  },
  {
    id: "s3",
    student: "Intan Rahma",
    initials: "I",
    moduleTitle: "Introduction to AI",
    session: "Sesi 02 — Memahami training data",
    submittedAt: "1 hari lalu",
    deadlineLeft: "Sisa 18 jam",
    wordCount: 210,
    urgency: "medium",
    status: "pending"
  },
  {
    id: "s4",
    student: "Rizky Pramudita",
    initials: "R",
    moduleTitle: "AI Prompts 101",
    session: "Sesi 04 — Chain-of-thought",
    submittedAt: "2 hari lalu",
    deadlineLeft: "Revisi dikirim balik",
    wordCount: 412,
    urgency: "low",
    status: "revision"
  },
  {
    id: "s5",
    student: "Nadia Putri",
    initials: "N",
    moduleTitle: "AI untuk Menulis",
    session: "Sesi 01 — Prompt untuk draft esai",
    submittedAt: "3 hari lalu",
    deadlineLeft: "Sudah selesai direview",
    wordCount: 298,
    urgency: "low",
    status: "reviewed"
  }
];

const RUBRIC_QUICK = [
  { label: "Relevansi", max: 25 },
  { label: "Kedalaman", max: 25 },
  { label: "Kejelasan", max: 25 },
  { label: "Keaslian", max: 25 }
];

export default function TutorReviewPage() {
  const pending = SUBMISSIONS.filter((s) => s.status === "pending");
  const reviewed = SUBMISSIONS.filter((s) => s.status === "reviewed").length;
  const highUrgency = SUBMISSIONS.filter((s) => s.urgency === "high").length;

  return (
    <main className="academy-shell dashboard-shell">
      <div className="container dashboard-app">
        <DashboardSidebar />

        <section className="dashboard-app__main" aria-label="Review tugas">
          <DashboardTopbar placeholder="Cari submission (nama siswa/modul)" />

          <header className="dashboard-page-header">
            <div>
              <p className="eyebrow eyebrow--brand">Review Tugas</p>
              <h1>Antrean tugas yang menunggu feedback</h1>
              <p>
                {pending.length} pending · {highUrgency} urgent · {reviewed} sudah direview
                minggu ini. SLA review: 48 jam sejak submit.
              </p>
            </div>
            <div className="review-quick-stats">
              <div>
                <strong>{pending.length}</strong>
                <span>Pending</span>
              </div>
              <div>
                <strong>91%</strong>
                <span>SLA 48 jam</span>
              </div>
              <div>
                <strong>4.7</strong>
                <span>Rating feedback</span>
              </div>
            </div>
          </header>

          <div className="dashboard-section">
            <div className="rekaman-filters">
              <button className="chip chip--active" type="button">Semua ({SUBMISSIONS.length})</button>
              <button className="chip" type="button">Pending ({pending.length})</button>
              <button className="chip" type="button">Revisi</button>
              <button className="chip" type="button">Selesai</button>
              <button className="chip" type="button">Urgent</button>
            </div>

            <div className="review-table">
              <div className="review-table__head" role="row">
                <span>Siswa</span>
                <span>Modul & Sesi</span>
                <span>Deadline</span>
                <span>Status</span>
                <span>Aksi</span>
              </div>
              {SUBMISSIONS.map((s) => (
                <div className="review-table__row" role="row" key={s.id}>
                  <span className="review-table__student">
                    <span className={`review-avatar review-avatar--${s.urgency}`}>
                      {s.initials}
                    </span>
                    <span>
                      <strong>{s.student}</strong>
                      <small>{s.submittedAt} · {s.wordCount} kata</small>
                    </span>
                  </span>
                  <span className="review-table__module">
                    <strong>{s.moduleTitle}</strong>
                    <small>{s.session}</small>
                  </span>
                  <span className={`review-table__deadline review-table__deadline--${s.urgency}`}>
                    <ClockIcon size={12} /> {s.deadlineLeft}
                  </span>
                  <span>
                    <span className={`review-status review-status--${s.status}`}>
                      {s.status === "pending" ? "Menunggu" : s.status === "revision" ? "Revisi" : "Selesai"}
                    </span>
                  </span>
                  <span className="review-table__actions">
                    {s.status === "reviewed" ? (
                      <Link className="button button--ghost button--sm" href={`/tutor/review/${s.id}`}>
                        Lihat
                      </Link>
                    ) : (
                      <Link className="button button--primary button--sm" href={`/tutor/review/${s.id}`}>
                        Review
                        <ArrowRightIcon size={12} />
                      </Link>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="tutor-columns">
            <div className="dashboard-section">
              <header className="dashboard-section__head">
                <h2>Quick Rubric</h2>
                <Link className="dashboard-section__link" href="/tutor/materi#rubric">
                  Kelola Rubric <ArrowRightIcon size={12} />
                </Link>
              </header>
              <div className="review-rubric">
                <p className="review-rubric__note">
                  Kriteria default Senopati untuk tugas praktik. 4 dimensi × 25 poin = total 100.
                </p>
                <ul>
                  {RUBRIC_QUICK.map((r) => (
                    <li key={r.label}>
                      <span className="review-rubric__tick">
                        <CheckIcon size={12} />
                      </span>
                      <strong>{r.label}</strong>
                      <span>Max {r.max}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="dashboard-section">
              <header className="dashboard-section__head">
                <h2>Template Feedback</h2>
                <Link className="dashboard-section__link" href="/tutor/materi#feedback">
                  Semua Template <ArrowRightIcon size={12} />
                </Link>
              </header>
              <div className="feedback-templates">
                <article>
                  <strong>Feedback untuk output bagus</strong>
                  <p>Validasi + dorong siswa untuk coba variasi yang lebih advanced.</p>
                  <Link className="button button--ghost button--sm" href="#">Pakai</Link>
                </article>
                <article>
                  <strong>Feedback butuh revisi</strong>
                  <p>Spesifik apa yang harus diulang, contoh konkret, nada encouraging.</p>
                  <Link className="button button--ghost button--sm" href="#">Pakai</Link>
                </article>
                <article>
                  <strong>Feedback setengah jalan</strong>
                  <p>Credit untuk yang sudah benar, arahan untuk yang perlu diperdalam.</p>
                  <Link className="button button--ghost button--sm" href="#">Pakai</Link>
                </article>
              </div>
            </div>
          </div>
        </section>

        <DashboardRightBar
          reminders={[
            {
              title: "Deadline review Alya Pertiwi",
              date: "Hari ini · 23.59 WIB",
              tone: "accent"
            },
            {
              title: "SLA rata-rata: 38 jam",
              date: "Target <48 jam",
              tone: "brand"
            },
            {
              title: "Rubric update minggu ini",
              date: "Tim kurikulum · Selasa",
              tone: "indigo"
            }
          ]}
        />
      </div>
    </main>
  );
}
