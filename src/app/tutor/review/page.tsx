import type { Metadata } from "next";
import Link from "next/link";
import { DashboardRightBar } from "../../_components/DashboardRightBar";
import { DashboardSidebar } from "../../_components/DashboardSidebar";
import { DashboardTopbar } from "../../_components/DashboardTopbar";
import { ArrowRightIcon, CheckIcon, ClockIcon } from "../../_components/Icon";
import { prisma } from "../../../lib/prisma";
import { findModule } from "../../../lib/content";
import { getCurrentUser } from "../../../lib/session";
import { getMyTaughtSlugs } from "../../../lib/tutor-scope";

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
  const scope = typeof sp.scope === "string" ? sp.scope : "mine"; // default: "modul saya"
  const moduleSlugFilter = typeof sp.moduleSlug === "string" ? sp.moduleSlug : null;

  const viewer = await getCurrentUser();
  const taughtSlugs = await getMyTaughtSlugs(); // null = admin (all)
  const hasMentorMapping = Array.isArray(taughtSlugs) && taughtSlugs.length > 0;

  const excludeOwn =
    viewer && viewer.role === "tutor" ? { NOT: { studentId: viewer.id } } : {};

  // Scope: "mine" = hanya modul yang tutor ampu. "all" = semua. Admin selalu
  // efektif "all" karena taughtSlugs null. Kalau tutor belum di-map → tampilkan
  // empty + notice.
  const effectiveScope = scope === "all" ? "all" : "mine";
  const slugScope =
    effectiveScope === "mine" && taughtSlugs ? { moduleSlug: { in: taughtSlugs } } : {};

  const moduleSlugWhere = moduleSlugFilter ? { moduleSlug: moduleSlugFilter } : {};

  const baseFilter = {
    ...excludeOwn,
    ...slugScope,
    ...moduleSlugWhere,
    ...(filter === "all" || !filter
      ? {}
      : {
          status: filter as "submitted" | "reviewing" | "approved" | "needs_revision",
        }),
  };

  const countWhere = { ...excludeOwn, ...slugScope, ...moduleSlugWhere };

  const [submissions, counts] = await Promise.all([
    prisma.assignmentSubmission.findMany({
      where: baseFilter,
      orderBy: { submittedAt: "desc" },
      take: 100,
      include: { student: { select: { id: true, name: true, avatarUrl: true } } },
    }),
    prisma.assignmentSubmission.groupBy({
      by: ["status"],
      where: countWhere,
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
              <h1>
                Antrean tugas yang menunggu feedback
                {effectiveScope === "mine" && hasMentorMapping ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "4px 10px",
                      marginLeft: 10,
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      borderRadius: 999,
                      background: "rgba(24, 194, 156, 0.12)",
                      color: "var(--brand-strong)",
                      verticalAlign: "middle",
                    }}
                  >
                    Modul saya saja
                  </span>
                ) : null}
              </h1>
              <p>
                {pendingCount} pending · {byStatus.reviewing} sedang di-review · {byStatus.approved} disetujui · {byStatus.needs_revision} butuh revisi.
                SLA review: 48 jam sejak submit.
                {!hasMentorMapping && viewer?.role === "tutor" ? (
                  <>
                    {" "}
                    <strong style={{ color: "#b45309" }}>
                      Akunmu belum di-map ke mentor track — semua modul platform ditampilkan.
                    </strong>
                  </>
                ) : null}
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
            {hasMentorMapping ? (
              <div className="rekaman-filters" style={{ marginBottom: 12 }}>
                <Link
                  href={`/tutor/review${filter !== "all" ? `?status=${filter}&scope=mine` : "?scope=mine"}`}
                  className={"chip" + (effectiveScope === "mine" ? " chip--active" : "")}
                >
                  Modul saya ({taughtSlugs?.length ?? 0} modul)
                </Link>
                <Link
                  href={`/tutor/review${filter !== "all" ? `?status=${filter}&scope=all` : "?scope=all"}`}
                  className={"chip" + (effectiveScope === "all" ? " chip--active" : "")}
                >
                  Semua modul platform
                </Link>
              </div>
            ) : null}

            <div className="rekaman-filters">
              <Link
                href={`/tutor/review${effectiveScope === "all" ? "?scope=all" : ""}`}
                className={"chip" + (filter === "all" ? " chip--active" : "")}
              >
                Semua ({total})
              </Link>
              <Link
                href={`/tutor/review?status=submitted${effectiveScope === "all" ? "&scope=all" : ""}`}
                className={"chip" + (filter === "submitted" ? " chip--active" : "")}
              >
                Pending ({byStatus.submitted})
              </Link>
              <Link
                href={`/tutor/review?status=reviewing${effectiveScope === "all" ? "&scope=all" : ""}`}
                className={"chip" + (filter === "reviewing" ? " chip--active" : "")}
              >
                Sedang review ({byStatus.reviewing})
              </Link>
              <Link
                href={`/tutor/review?status=approved${effectiveScope === "all" ? "&scope=all" : ""}`}
                className={"chip" + (filter === "approved" ? " chip--active" : "")}
              >
                Disetujui ({byStatus.approved})
              </Link>
              <Link
                href={`/tutor/review?status=needs_revision${effectiveScope === "all" ? "&scope=all" : ""}`}
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
                  // SLA 48 jam. Hitung dari submittedAt.
                  const hoursSinceSubmit =
                    (Date.now() - new Date(s.submittedAt).getTime()) / (3600 * 1000);
                  const isPending = s.status === "submitted" || s.status === "reviewing";
                  const isOverdue = isPending && hoursSinceSubmit > 48;
                  const isUrgent = isPending && !isOverdue && hoursSinceSubmit > 24;
                  const slaLabel = isOverdue
                    ? `${Math.floor(hoursSinceSubmit - 48)} jam telat`
                    : isUrgent
                    ? `Sisa ${Math.ceil(48 - hoursSinceSubmit)} jam`
                    : `Sisa ${Math.ceil(48 - hoursSinceSubmit)} jam`;
                  const urgencyClass = isOverdue
                    ? "high"
                    : isUrgent
                    ? "high"
                    : s.status === "reviewing"
                    ? "medium"
                    : s.status === "submitted"
                    ? "medium"
                    : "low";
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
                        <ClockIcon size={12} />{" "}
                        {isPending ? slaLabel : relativeTime(s.submittedAt)}
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
                        {isOverdue ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "3px 8px",
                              marginLeft: 6,
                              fontSize: "0.68rem",
                              fontWeight: 800,
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                              borderRadius: 999,
                              background: "#fee2e2",
                              color: "#991b1b",
                              verticalAlign: "middle",
                            }}
                          >
                            Overdue
                          </span>
                        ) : isUrgent ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "3px 8px",
                              marginLeft: 6,
                              fontSize: "0.68rem",
                              fontWeight: 800,
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                              borderRadius: 999,
                              background: "#fef3c7",
                              color: "#b45309",
                              verticalAlign: "middle",
                            }}
                          >
                            Urgent
                          </span>
                        ) : null}
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
