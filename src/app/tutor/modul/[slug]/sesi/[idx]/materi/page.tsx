import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardRightBar } from "../../../../../../_components/DashboardRightBar";
import { DashboardSidebar } from "../../../../../../_components/DashboardSidebar";
import { DashboardTopbar } from "../../../../../../_components/DashboardTopbar";
import { SlideUploader } from "../../../../../../_components/SlideUploader";
import { ArrowRightIcon, ClockIcon } from "../../../../../../_components/Icon";
import { prisma } from "../../../../../../../lib/prisma";
import { findModule, modulesByMentor } from "../../../../../../../lib/content";
import { getCurrentUser } from "../../../../../../../lib/session";

export const metadata: Metadata = {
  title: "Upload Materi Slide — Tutor",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function TutorMateriUploadPage({
  params,
}: {
  params: Promise<{ slug: string; idx: string }>;
}) {
  const { slug, idx } = await params;
  const sessionIndex = Number.parseInt(idx, 10);
  if (Number.isNaN(sessionIndex)) notFound();

  const mod = findModule(slug);
  if (!mod) notFound();
  if (sessionIndex < 0 || sessionIndex >= mod.syllabus.length) notFound();

  const viewer = await getCurrentUser();
  if (!viewer) notFound();

  // Authorization check — tutor harus ampu modul ini (atau admin).
  if (viewer.role === "tutor") {
    const record = await prisma.user.findUnique({
      where: { id: viewer.id },
      select: { mentorSlug: true },
    });
    if (!record?.mentorSlug) notFound();
    const owned = modulesByMentor(record.mentorSlug).map((m) => m.slug);
    if (!owned.includes(slug)) notFound();
  } else if (viewer.role !== "admin") {
    notFound();
  }

  const [material, sessionsProgress] = await Promise.all([
    prisma.sessionMaterial.findUnique({
      where: { moduleSlug_sessionIndex: { moduleSlug: slug, sessionIndex } },
      include: {
        uploadedBy: { select: { id: true, name: true } },
        versions: {
          orderBy: { uploadedAt: "desc" },
          take: 10,
          include: { uploadedBy: { select: { id: true, name: true } } },
        },
      },
    }),
    prisma.sessionMaterial.findMany({
      where: { moduleSlug: slug },
      select: { sessionIndex: true, pdfFilename: true, uploadedAt: true },
      orderBy: { sessionIndex: "asc" },
    }),
  ]);

  const sessionMaterialMap = new Map(sessionsProgress.map((m) => [m.sessionIndex, m]));

  const prevIdx = sessionIndex > 0 ? sessionIndex - 1 : null;
  const nextIdx = sessionIndex < mod.syllabus.length - 1 ? sessionIndex + 1 : null;

  return (
    <main className="academy-shell dashboard-shell">
      <div className="container dashboard-app">
        <DashboardSidebar />

        <section className="dashboard-app__main" aria-label="Upload materi">
          <DashboardTopbar placeholder="Cari modul / sesi" />

          <nav className="detail-breadcrumb" aria-label="Breadcrumb">
            <Link href="/dashboard">Dashboard</Link>
            <span>/</span>
            <Link href="/tutor/modul">Modul Saya</Link>
            <span>/</span>
            <span>{mod.title}</span>
            <span>/</span>
            <span>Sesi {String(sessionIndex + 1).padStart(2, "0")}</span>
          </nav>

          <header className="dashboard-page-header">
            <div>
              <p className="eyebrow eyebrow--brand">Materi Slide</p>
              <h1>
                Sesi {String(sessionIndex + 1).padStart(2, "0")} · {mod.syllabus[sessionIndex]?.title ?? "Sesi"}
              </h1>
              <p>
                Modul <strong>{mod.title}</strong>. Upload slide PDF/PPT/PPTX — akan ditampilkan ke
                murid di halaman sesi mereka. Versi sebelumnya tetap tersimpan sebagai riwayat.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {prevIdx !== null ? (
                <Link
                  className="button button--ghost button--sm"
                  href={`/tutor/modul/${slug}/sesi/${prevIdx}/materi`}
                >
                  ← Sesi sebelumnya
                </Link>
              ) : null}
              {nextIdx !== null ? (
                <Link
                  className="button button--secondary button--sm"
                  href={`/tutor/modul/${slug}/sesi/${nextIdx}/materi`}
                >
                  Sesi berikutnya →
                </Link>
              ) : null}
              <Link
                className="button button--secondary button--sm"
                href={`/belajar/${slug}/sesi/${sessionIndex}`}
              >
                Preview sesi murid
                <ArrowRightIcon size={12} />
              </Link>
            </div>
          </header>

          <div className="dashboard-section">
            <SlideUploader
              moduleSlug={slug}
              sessionIndex={sessionIndex}
              existing={
                material
                  ? {
                      id: material.id,
                      pdfUrl: material.pdfUrl,
                      pdfFilename: material.pdfFilename,
                      pdfSizeBytes: material.pdfSizeBytes,
                      sourceFormat: material.sourceFormat,
                      uploadedAt: material.uploadedAt.toISOString(),
                      title: material.title,
                      totalPages: material.totalPages,
                    }
                  : null
              }
            />
          </div>

          {material && material.versions.length > 1 ? (
            <div className="dashboard-section">
              <header className="dashboard-section__head">
                <h2>Riwayat Versi</h2>
                <span className="dashboard-section__count">{material.versions.length} versi</span>
              </header>
              <div className="review-table">
                <div className="review-table__head" role="row">
                  <span>Tanggal</span>
                  <span>Upload oleh</span>
                  <span>File</span>
                  <span>Size</span>
                  <span>Catatan</span>
                </div>
                {material.versions.map((v, idx) => (
                  <div className="review-table__row" role="row" key={v.id}>
                    <span>
                      <strong>
                        {idx === 0 ? "Aktif" : `v${material.versions.length - idx}`}
                      </strong>
                      <br />
                      <small style={{ color: "var(--muted)" }}>
                        <ClockIcon size={10} />{" "}
                        {new Date(v.uploadedAt).toLocaleDateString("id-ID")}
                      </small>
                    </span>
                    <span>
                      <strong>{v.uploadedBy.name}</strong>
                    </span>
                    <span>
                      <a href={v.pdfUrl} target="_blank" rel="noopener noreferrer">
                        {v.pdfFilename}
                      </a>
                    </span>
                    <span>{humanSize(v.pdfSizeBytes)}</span>
                    <span>
                      <small style={{ color: "var(--muted)" }}>{v.changeNote ?? "—"}</small>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Checklist Materi Per Sesi</h2>
              <span className="dashboard-section__count">
                {sessionsProgress.length}/{mod.syllabus.length} terisi
              </span>
            </header>
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "grid",
                gap: 8,
              }}
            >
              {mod.syllabus.map((_, i) => {
                const m = sessionMaterialMap.get(i);
                const isActive = i === sessionIndex;
                return (
                  <li
                    key={i}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      background: isActive
                        ? "rgba(24, 194, 156, 0.08)"
                        : m
                        ? "#ffffff"
                        : "rgba(239, 68, 68, 0.04)",
                      border: `1px solid ${
                        isActive
                          ? "rgba(24, 194, 156, 0.28)"
                          : m
                          ? "rgba(15, 23, 42, 0.06)"
                          : "rgba(239, 68, 68, 0.18)"
                      }`,
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <strong style={{ flex: "0 0 auto", minWidth: 80 }}>
                      Sesi {String(i + 1).padStart(2, "0")}
                    </strong>
                    <span style={{ flex: "1 1 200px", minWidth: 0, color: "var(--muted)", fontSize: "0.88rem" }}>
                      {m
                        ? `${m.pdfFilename} · upload ${new Date(m.uploadedAt).toLocaleDateString("id-ID")}`
                        : "Belum ada materi"}
                    </span>
                    <Link
                      href={`/tutor/modul/${slug}/sesi/${i}/materi`}
                      className="button button--ghost button--sm"
                    >
                      {isActive ? "Sedang edit" : m ? "Edit" : "Upload"}
                      <ArrowRightIcon size={12} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <DashboardRightBar />
      </div>
    </main>
  );
}
