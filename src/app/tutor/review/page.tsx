import type { Metadata } from "next";
import Link from "next/link";
import { DashboardRightBar } from "../../_components/DashboardRightBar";
import { DashboardSidebar } from "../../_components/DashboardSidebar";
import { DashboardTopbar } from "../../_components/DashboardTopbar";
import { ArrowRightIcon, CheckIcon, ClockIcon } from "../../_components/Icon";
import { prisma } from "../../../lib/prisma";
import { findModule } from "../../../lib/content";

export const metadata: Metadata = {
  title: "Review Tugas — Tutor",
  robots: { index: false, follow: false },
  alternates: { canonical: "/tutor/review" },
};

export const dynamic = "force-dynamic";

const RUBRIC_QUICK = [
  { label: "Relevansi", max: 25 },
  { label: "Kedalaman", max: 25 },
  { label: "Kejelasan", max: 25 },
  { label: "Keaslian", max: 25 },
];

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

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function TutorReviewPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const filter = typeof sp.status === "string" ? sp.status : "all";

  const [submissions, counts] = await Promise.all([
    prisma.assignmentSubmission.findMany({
      where: filter === "all" || !filter ? {} : { status: filter as "submitted" | "reviewing" | "approved" | "needs_revision" },
      orderBy: { submittedAt: "desc" },
      take: 100,
      include: { student: { select: { id: true, name: true, avatarUrl: true } } },
    }),
    prisma.assignmentSubmission.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const byStatus: Record<string, number> = {
    submitted: 0,
    reviewing: 0,
    approved: 0,
    needs_revision: 0,
  };
  for (const c of counts) byStatus[c.status] = c._count._all;
  const total = Object.values(byStatus).reduce((a, b) => a + b, 0);

  const pendingCount = byStatus.submitted;

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
                {pendingCount} pending · {byStatus.reviewing} sedang di-review · {byStatus.approved} disetujui · {byStatus.needs_revision} butuh revisi. SLA review: 48 jam sejak submit.
              </p>
            </div>
            <div className="review-quick-stats">
              <div>
                <strong>{pendingCount}</strong>
                <span>Pending</span>
              </div>
              <div>
                <strong>{total}</strong>
                <span>Total submission</span>
              </div>
              <div>
                <strong>{byStatus.approved}</strong>
                <span>Disetujui</span>
              </div>
            </div>
          </header>

          <div className="dashboard-section">
            <div className="rekaman-filters">
              <Link
                href="/tutor/review"
                className={"chip" + (filter === "all" ? " chip--active" : "")}
              >
                Semua ({total})
              </Link>
              <Link
                href="/tutor/review?status=submitted"
                className={"chip" + (filter === "submitted" ? " chip--active" : "")}
              >
                Pending ({byStatus.submitted})
              </Link>
              <Link
                href="/tutor/review?status=reviewing"
                className={"chip" + (filter === "reviewing" ? " chip--active" : "")}
              >
                Sedang review ({byStatus.reviewing})
              </Link>
              <Link
                href="/tutor/review?status=approved"
                className={"chip" + (filter === "approved" ? " chip--active" : "")}
              >
                Disetujui ({byStatus.approved})
              </Link>
              <Link
                href="/tutor/review?status=needs_revision"
                className={"chip" + (filter === "needs_revision" ? " chip--active" : "")}
              >
                Perlu revisi ({byStatus.needs_revision})
              </Link>
            </div>

            {submissions.length === 0 ? (
              <div className="catalog-empty">
                <p>Tidak ada submission untuk filter ini.</p>
              </div>
            ) : (
              <div className="review-table">
                <div className="review-table__head" role="row">
                  <span>Siswa</span>
                  <span>Modul & Sesi</span>
                  <span>Waktu Submit</span>
                  <span>Status</span>
                  <span>Aksi</span>
                </div>
                {submissions.map((s) => {
                  const mod = findModule(s.moduleSlug);
                  const urgencyClass =
                    s.status === "submitted" ? "high" : s.status === "reviewing" ? "medium" : "low";
                  return (
                    <div className="review-table__row" role="row" key={s.id}>
                      <span className="review-table__student">
                        <span className={`review-avatar review-avatar--${urgencyClass}`}>
                          {initialsOf(s.student.name)}
                        </span>
                        <span>
                          <strong>{s.student.name}</strong>
                          <small>{s.text.length} karakter · {relativeTime(s.submittedAt)}</small>
                        </span>
                      </span>
                      <span className="review-table__module">
                        <strong>{mod?.title ?? s.moduleSlug}</strong>
                        <small>Sesi {String(s.sessionIndex + 1).padStart(2, "0")}</small>
                      </span>
                      <span className={`review-table__deadline review-table__deadline--${urgencyClass}`}>
                        <ClockIcon size={12} /> {relativeTime(s.submittedAt)}
                      </span>
                      <span>
                        <span className={`review-status review-status--${s.status}`}>
                          {s.status === "submitted"
                            ? "Menunggu"
                            : s.status === "reviewing"
                            ? "Sedang review"
                            : s.status === "approved"
                            ? "Disetujui"
                            : "Perlu revisi"}
                        </span>
                      </span>
                      <span className="review-table__actions">
                        <Link
                          className={
                            s.status === "submitted"
                              ? "button button--primary button--sm"
                              : "button button--ghost button--sm"
                          }
                          href={`/tutor/review/${s.id}`}
                        >
                          {s.status === "submitted" ? "Review" : "Lihat"}
                          <ArrowRightIcon size={12} />
                        </Link>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="tutor-columns">
            <div className="dashboard-section">
              <header className="dashboard-section__head">
                <h2>Quick Rubric</h2>
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
                <h2>Tips Memberi Feedback</h2>
              </header>
              <div className="feedback-templates">
                <article>
                  <strong>Specific, bukan generic</strong>
                  <p>
                    Rujuk bagian jawaban yang konkret. "Paragraf 2 sudah kuat karena…" lebih
                    berguna dari "Jawaban kamu bagus".
                  </p>
                </article>
                <article>
                  <strong>Actionable untuk revisi</strong>
                  <p>
                    Kalau needs_revision, beri 1-2 langkah konkret yang bisa dikerjakan ulang.
                    Hindari kritik tanpa arah.
                  </p>
                </article>
                <article>
                  <strong>Balance apresiasi & koreksi</strong>
                  <p>
                    Sebut apa yang sudah benar dulu sebelum arahan perbaikan. Ini bukan soft,
                    ini retensi belajar.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <DashboardRightBar />
      </div>
    </main>
  );
}
