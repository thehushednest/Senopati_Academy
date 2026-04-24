import type { Metadata } from "next";
import Link from "next/link";
import { DashboardRightBar } from "../../_components/DashboardRightBar";
import { DashboardSidebar } from "../../_components/DashboardSidebar";
import { DashboardTopbar } from "../../_components/DashboardTopbar";
import { ArrowRightIcon, BookIcon, ClockIcon, PenIcon } from "../../_components/Icon";

export const metadata: Metadata = {
  title: "Modul Saya — Tutor",
  robots: { index: false, follow: false },
  alternates: { canonical: "/tutor/modul" }
};

type Modul = {
  slug: string;
  title: string;
  category: string;
  status: "published" | "draft" | "review";
  students: number;
  completion: number;
  pendingReview: number;
  unreadDiscussion: number;
  lastUpdated: string;
};

const MODULS: Modul[] = [
  {
    slug: "introduction-to-ai",
    title: "Introduction to AI",
    category: "Foundations",
    status: "published",
    students: 42,
    completion: 68,
    pendingReview: 3,
    unreadDiscussion: 2,
    lastUpdated: "2 hari lalu"
  },
  {
    slug: "ai-prompts-101",
    title: "AI Prompts 101 — Cara Ngobrol yang Benar sama AI",
    category: "Praktis",
    status: "published",
    students: 68,
    completion: 52,
    pendingReview: 5,
    unreadDiscussion: 7,
    lastUpdated: "Kemarin"
  },
  {
    slug: "ai-for-writing",
    title: "AI untuk Menulis — Dari Blank Page ke Draft",
    category: "Praktis",
    status: "published",
    students: 24,
    completion: 41,
    pendingReview: 1,
    unreadDiscussion: 0,
    lastUpdated: "1 minggu lalu"
  },
  {
    slug: "ai-for-research-draft",
    title: "AI untuk Riset & Tugas Sekolah",
    category: "Praktis",
    status: "draft",
    students: 0,
    completion: 0,
    pendingReview: 0,
    unreadDiscussion: 0,
    lastUpdated: "3 hari lalu"
  },
  {
    slug: "chain-of-thought-advanced",
    title: "Chain-of-Thought Advanced Techniques",
    category: "Praktis",
    status: "review",
    students: 0,
    completion: 0,
    pendingReview: 0,
    unreadDiscussion: 0,
    lastUpdated: "5 jam lalu"
  }
];

const STATUS_META = {
  published: { label: "Published", tone: "brand" as const },
  draft: { label: "Draft", tone: "muted" as const },
  review: { label: "Review Kurikulum", tone: "accent" as const }
};

export default function TutorModulPage() {
  const published = MODULS.filter((m) => m.status === "published");
  const totalStudents = published.reduce((s, m) => s + m.students, 0);
  const avgCompletion = Math.round(
    published.reduce((s, m) => s + m.completion, 0) / Math.max(1, published.length)
  );

  return (
    <main className="academy-shell dashboard-shell">
      <div className="container dashboard-app">
        <DashboardSidebar />

        <section className="dashboard-app__main" aria-label="Modul saya">
          <DashboardTopbar placeholder="Cari modul" />

          <header className="dashboard-page-header">
            <div>
              <p className="eyebrow eyebrow--brand">Modul Saya</p>
              <h1>Modul yang kamu ampu</h1>
              <p>
                {MODULS.length} modul total · {published.length} published · {totalStudents} siswa
                aktif · rata-rata {avgCompletion}% selesai.
              </p>
            </div>
            <Link className="button button--primary" href="/tutor/modul/baru">
              <PenIcon size={14} /> Buat Modul Baru
            </Link>
          </header>

          <div className="dashboard-section">
            <div className="rekaman-filters">
              <button className="chip chip--active" type="button">Semua</button>
              <button className="chip" type="button">Published</button>
              <button className="chip" type="button">Draft</button>
              <button className="chip" type="button">Review</button>
            </div>

            <div className="tutor-modul-list">
              {MODULS.map((m) => {
                const status = STATUS_META[m.status];
                return (
                  <article className="tutor-modul-row" key={m.slug}>
                    <div className="tutor-modul-row__main">
                      <div className="tutor-modul-row__head">
                        <span className={`tutor-status tutor-status--${status.tone}`}>
                          <span className="tutor-status__dot" aria-hidden="true" />
                          {status.label}
                        </span>
                        <span className="tutor-modul-row__cat">{m.category}</span>
                        <span className="tutor-modul-row__updated">
                          <ClockIcon size={12} /> Update {m.lastUpdated}
                        </span>
                      </div>
                      <h3>{m.title}</h3>
                      {m.status === "published" ? (
                        <>
                          <div className="tutor-modul-row__stats">
                            <div>
                              <strong>{m.students}</strong>
                              <span>Siswa</span>
                            </div>
                            <div>
                              <strong>{m.completion}%</strong>
                              <span>Selesai</span>
                            </div>
                            <div>
                              <strong>{m.pendingReview}</strong>
                              <span>Review</span>
                            </div>
                            <div>
                              <strong>{m.unreadDiscussion}</strong>
                              <span>Diskusi baru</span>
                            </div>
                          </div>
                          <div className="active-progress-bar" aria-hidden="true">
                            <span style={{ width: `${m.completion}%` }} />
                          </div>
                        </>
                      ) : (
                        <p className="tutor-modul-row__note">
                          {m.status === "draft"
                            ? "Belum dipublikasikan. Lengkapi silabus & konten."
                            : "Menunggu review dari tim kurikulum Senopati Strategic Institute."}
                        </p>
                      )}
                    </div>
                    <div className="tutor-modul-row__actions">
                      <Link className="button button--primary button--sm" href={`/tutor/modul/${m.slug}`}>
                        <PenIcon size={14} /> Edit Konten
                      </Link>
                      {m.status === "published" ? (
                        <>
                          <Link className="button button--secondary button--sm" href={`/tutor/modul/${m.slug}/siswa`}>
                            <BookIcon size={14} /> Kelola
                          </Link>
                          <Link className="button button--ghost button--sm" href={`/tutor/analitik#${m.slug}`}>
                            Analitik
                          </Link>
                        </>
                      ) : (
                        <Link className="button button--secondary button--sm" href={`/tutor/modul/${m.slug}/preview`}>
                          Preview
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="dashboard-section">
            <div className="tutor-cta">
              <div>
                <p className="eyebrow eyebrow--brand">Panduan Kurikulum</p>
                <h2>Template modul Senopati siap dipakai untuk mulai dari nol.</h2>
                <p>
                  Ada template silabus, bank soal, dan rubric siap pakai di halaman Materi & Soal.
                  Hemat 3-4 jam setup modul baru.
                </p>
              </div>
              <div className="tutor-cta__actions">
                <Link className="button button--accent" href="/tutor/materi">
                  Buka Materi & Soal
                  <ArrowRightIcon size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <DashboardRightBar />
      </div>
    </main>
  );
}
