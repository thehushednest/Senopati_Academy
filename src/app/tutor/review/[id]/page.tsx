import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardRightBar } from "../../../_components/DashboardRightBar";
import { DashboardSidebar } from "../../../_components/DashboardSidebar";
import { DashboardTopbar } from "../../../_components/DashboardTopbar";
import { ArrowRightIcon, ClockIcon } from "../../../_components/Icon";
import { ReviewSubmissionForm } from "../../../_components/ReviewSubmissionForm";
import { prisma } from "../../../../lib/prisma";
import { findModule } from "../../../../lib/content";

export const metadata: Metadata = {
  title: "Detail Review Tugas — Tutor",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatDateTime(d: Date) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export default async function TutorReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const submission = await prisma.assignmentSubmission.findUnique({
    where: { id },
    include: {
      student: {
        select: { id: true, name: true, email: true, avatarUrl: true, school: true, grade: true },
      },
      reviewer: { select: { id: true, name: true } },
    },
  });

  if (!submission) notFound();

  const mod = findModule(submission.moduleSlug);
  const sessionTitle = mod?.syllabus[submission.sessionIndex]?.title ?? `Sesi ${submission.sessionIndex + 1}`;

  return (
    <main className="academy-shell dashboard-shell">
      <div className="container dashboard-app">
        <DashboardSidebar />

        <section className="dashboard-app__main" aria-label="Detail review">
          <DashboardTopbar placeholder="Cari submission lain" />

          <nav className="detail-breadcrumb" aria-label="Breadcrumb">
            <Link href="/dashboard">Dashboard</Link>
            <span>/</span>
            <Link href="/tutor/review">Review Tugas</Link>
            <span>/</span>
            <span>{submission.student.name}</span>
          </nav>

          <header className="dashboard-page-header">
            <div>
              <p className="eyebrow eyebrow--brand">
                {mod?.title ?? submission.moduleSlug} · Sesi {String(submission.sessionIndex + 1).padStart(2, "0")}
              </p>
              <h1>Tugas dari {submission.student.name}</h1>
              <p>
                Dikirim {formatDateTime(submission.submittedAt)}
                {submission.reviewedAt ? ` · Direview ${formatDateTime(submission.reviewedAt)}` : ""}
                {submission.reviewer ? ` oleh ${submission.reviewer.name}` : ""}
              </p>
            </div>
            <span className={`review-status review-status--${submission.status}`}>
              {submission.status === "submitted"
                ? "Menunggu review"
                : submission.status === "reviewing"
                ? "Sedang review"
                : submission.status === "approved"
                ? "Disetujui"
                : "Perlu revisi"}
            </span>
          </header>

          <div className="tutor-columns">
            <div className="dashboard-section">
              <header className="dashboard-section__head">
                <h2>Informasi Siswa</h2>
              </header>
              <div className="student-card" style={{ background: "transparent", border: "none", padding: 0 }}>
                <div className="student-card__head">
                  <span className="student-card__avatar student-card__avatar--brand">
                    {initialsOf(submission.student.name)}
                  </span>
                  <div>
                    <strong>{submission.student.name}</strong>
                    <span>{submission.student.email}</span>
                  </div>
                </div>
                <div style={{ marginTop: 14, display: "grid", gap: 8, color: "var(--muted)", fontSize: "0.9rem" }}>
                  {submission.student.school ? <div>Sekolah: {submission.student.school}</div> : null}
                  {submission.student.grade ? <div>Kelas: {submission.student.grade}</div> : null}
                </div>
              </div>
            </div>

            <div className="dashboard-section">
              <header className="dashboard-section__head">
                <h2>Konteks Tugas</h2>
              </header>
              <div style={{ display: "grid", gap: 10 }}>
                <div>
                  <strong>Sesi</strong>
                  <p style={{ color: "var(--muted)" }}>{sessionTitle}</p>
                </div>
                <div>
                  <strong>Deadline submit</strong>
                  <p style={{ color: "var(--muted)" }}>
                    <ClockIcon size={12} /> 7 hari dari tanggal sesi dibuka
                  </p>
                </div>
                <Link
                  href={`/belajar/${submission.moduleSlug}/sesi/${submission.sessionIndex}/tugas`}
                  className="button button--ghost button--sm"
                  style={{ marginTop: 4, width: "fit-content" }}
                >
                  Lihat brief tugas
                  <ArrowRightIcon size={14} />
                </Link>
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Jawaban Siswa</h2>
              <span className="dashboard-section__count">{submission.text.length} karakter</span>
            </header>
            <div className="assignment-brief" style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
              {submission.text}
            </div>
            {submission.attachmentUrl ? (
              <div style={{ marginTop: 14 }}>
                <a
                  className="button button--secondary button--sm"
                  href={submission.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buka lampiran
                  <ArrowRightIcon size={12} />
                </a>
              </div>
            ) : null}
          </div>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Tulis Feedback & Putuskan</h2>
            </header>
            <ReviewSubmissionForm
              submissionId={submission.id}
              initialStatus={submission.status}
              initialFeedback={submission.feedback}
              initialGrade={submission.grade}
            />
          </div>
        </section>

        <DashboardRightBar />
      </div>
    </main>
  );
}
