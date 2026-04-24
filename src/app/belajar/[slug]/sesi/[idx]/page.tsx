import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRightIcon,
  ClockIcon,
  LevelIcon,
  MessageIcon,
  PenIcon
} from "../../../../_components/Icon";
import { LearningTabs } from "../../../../_components/LearningTabs";
import {
  buildSessions,
  findMentor,
  findModule
} from "../../../../../lib/content";
import { resolveModuleProgress } from "../../../../../lib/progress-server";
import { MarkSessionComplete } from "../../../../_components/MarkSessionComplete";
import { SlideViewer } from "../../../../_components/SlideViewer";
import { prisma } from "../../../../../lib/prisma";
import { getCurrentUser } from "../../../../../lib/session";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string; idx: string }>;
}): Promise<Metadata> {
  const { slug, idx } = await params;
  const mod = findModule(slug);
  if (!mod) return { title: "Sesi tidak ditemukan" };
  const sessionIdx = Number.parseInt(idx, 10);
  const session = mod.syllabus[sessionIdx];
  return {
    title: `${session?.title ?? "Sesi"} · ${mod.title}`,
    robots: { index: false, follow: false },
    alternates: { canonical: `/belajar/${slug}/sesi/${idx}` }
  };
}

const REFERENCES = [
  {
    title: "Panduan singkat prompt engineering (Senopati Strategic Institute)",
    desc: "PDF 12 halaman — rangkuman CTCF framework.",
    url: "#"
  },
  {
    title: "Video pendukung — wawancara mentor",
    desc: "Rekaman 8 menit di YouTube Senopati Academy.",
    url: "#"
  },
  {
    title: "Artikel blog: Bias AI & konteks Indonesia",
    desc: "Bacaan 6 menit di blog Senopati Academy.",
    url: "/blog/bias-ai-dan-kenapa-penting-di-konteks-indonesia"
  }
];

export default async function PlayerPage({
  params
}: {
  params: Promise<{ slug: string; idx: string }>;
}) {
  const { slug, idx } = await params;
  const mod = findModule(slug);
  if (!mod) notFound();

  const sessionIdx = Number.parseInt(idx, 10);
  if (Number.isNaN(sessionIdx) || sessionIdx < 0 || sessionIdx >= mod.syllabus.length) {
    notFound();
  }

  const progress = await resolveModuleProgress(mod.slug);
  const sessions = buildSessions(mod, progress?.completed ?? 0);
  const session = sessions[sessionIdx];
  const mentor = findMentor(mod.mentorSlug);
  const prevIdx = sessionIdx > 0 ? sessionIdx - 1 : null;
  const nextIdx = sessionIdx < sessions.length - 1 ? sessionIdx + 1 : null;
  const totalSessions = mod.syllabus.length;

  // Materi slide untuk sesi ini. Kalau null → tampilkan empty state.
  const material = await prisma.sessionMaterial.findUnique({
    where: { moduleSlug_sessionIndex: { moduleSlug: mod.slug, sessionIndex: sessionIdx } },
  });

  // Load slide progress existing user untuk initial state viewer
  const viewer = await getCurrentUser();
  const slideProgress =
    viewer && material
      ? await prisma.slideProgress.findUnique({
          where: {
            studentId_materialId: { studentId: viewer.id, materialId: material.id },
          },
        })
      : null;

  // Tombol "Tandai Selesai & Lanjut" di-lock sampai user lihat slide terakhir
  // (kalau ada material + totalPages tercatat). Kalau tidak ada material atau
  // totalPages belum tercatat, biarkan enable seperti biasa.
  const viewerIsStudent = viewer?.role === "student";
  const lockComplete = Boolean(
    viewerIsStudent &&
      material &&
      material.totalPages &&
      material.totalPages > 1 &&
      (slideProgress?.maxSlideIndex ?? -1) < material.totalPages - 1,
  );
  const lockReason = lockComplete
    ? `Buka semua ${material?.totalPages} slide untuk menandai sesi selesai`
    : undefined;

  return (
    <main className="academy-shell learning-shell">
      <div className="container">
        <nav className="detail-breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span>/</span>
          <Link href={`/belajar/${mod.slug}`}>{mod.title}</Link>
          <span>/</span>
          <span>Sesi {String(sessionIdx + 1).padStart(2, "0")}</span>
        </nav>

        <LearningTabs moduleSlug={mod.slug} />

        <section className="player-section" aria-label="Materi slide">
          <div className="player">
            {material ? (
              <>
                <SlideViewer
                  materialId={material.id}
                  pdfUrl={material.pdfUrl}
                  filename={material.pdfFilename}
                  initialLastSlide={slideProgress?.lastSlideIndex ?? 0}
                  initialMaxSlide={slideProgress?.maxSlideIndex ?? 0}
                  readOnly={!viewerIsStudent}
                />
                <div className="player__chapters">
                  <span>Sesi</span>
                  <div>
                    {sessions.map((_, i) => (
                      <Link
                        key={i}
                        href={`/belajar/${mod.slug}/sesi/${i}`}
                        className={`player__chapter${i === sessionIdx ? " player__chapter--active" : ""}`}
                        style={{ textDecoration: "none" }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 48,
                  minHeight: 360,
                  textAlign: "center",
                  borderRadius: 16,
                  background: "linear-gradient(180deg, rgba(24, 194, 156, 0.04), rgba(125, 103, 255, 0.04))",
                  border: "1px dashed rgba(15, 23, 42, 0.12)",
                }}
              >
                <p className="eyebrow" style={{ marginBottom: 8 }}>Materi Slide Belum Siap</p>
                <strong style={{ fontSize: "1.1rem", marginBottom: 6 }}>
                  Mentor belum mengunggah slide untuk sesi ini
                </strong>
                <p style={{ color: "var(--muted)", maxWidth: 420, margin: "0 auto" }}>
                  Saat materi tersedia, slide akan ditampilkan di sini — kamu bisa geser halaman,
                  zoom, dan download PDF langsung dari viewer.
                </p>
              </div>
            )}
          </div>

          <aside className="player-side">
            <p className="eyebrow">Sesi {String(sessionIdx + 1).padStart(2, "0")}</p>
            <h1>{session.title}</h1>
            <p>{session.summary}</p>
            <div className="player-side__meta">
              <span>
                <ClockIcon size={14} /> {session.durationMinutes} menit
              </span>
              <span>
                <LevelIcon size={14} /> {mod.level}
              </span>
              {mentor ? <span>{mentor.name}</span> : null}
            </div>
            {material ? (
              <p style={{ marginTop: 12, fontSize: "0.82rem", color: "var(--muted)" }}>
                <strong>{material.title ?? material.pdfFilename}</strong>
                {material.totalPages ? ` · ${material.totalPages} slide` : ""}
                {" · "}
                <a href={material.pdfUrl} target="_blank" rel="noopener noreferrer">
                  Download PDF
                </a>
              </p>
            ) : null}
            <div className="player-side__actions">
              <Link
                className="button button--primary"
                href={`/belajar/${mod.slug}/sesi/${sessionIdx}/kuis`}
              >
                Kerjakan Kuis
                <ArrowRightIcon size={16} />
              </Link>
              <Link
                className="button button--secondary button--sm"
                href={`/belajar/${mod.slug}/sesi/${sessionIdx}/tugas`}
              >
                Tugas Praktik
              </Link>
            </div>
          </aside>
        </section>

        <section aria-label="Materi tambahan">
          <div className="player-tabs">
            <article className="player-panel">
              <h2>Materi Teks</h2>
              <p>
                <strong>Inti sesi.</strong> Sesi ini membahas konsep utama dengan alur: pengenalan
                → contoh → latihan. Catat poin penting di halaman Catatan untuk akses cepat nanti.
              </p>
              <p>
                <strong>Aktivitas.</strong> Setelah menonton video, jawab kuis untuk cek
                pemahaman, lalu kerjakan tugas praktik. Tugas kami review dalam 48 jam.
              </p>
              <p>
                <strong>Tips belajar.</strong> Kalau ada konsep yang belum nangkap, coba tanyakan di
                halaman Diskusi. Biasanya peserta lain punya pertanyaan yang mirip.
              </p>
            </article>
            <article className="player-panel">
              <h2>Referensi</h2>
              <ul className="references-list">
                {REFERENCES.map((ref) => (
                  <li key={ref.title}>
                    <a href={ref.url}>
                      <strong>{ref.title}</strong>
                      <span>{ref.desc}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </article>
            <article className="player-panel">
              <h2>Shortcut</h2>
              <div className="learn-shortcuts learn-shortcuts--compact">
                <Link href={`/belajar/${mod.slug}/diskusi`} className="learn-shortcut">
                  <MessageIcon size={16} />
                  <div>
                    <strong>Diskusi</strong>
                    <span>Tanya peserta & mentor.</span>
                  </div>
                </Link>
                <Link href={`/belajar/${mod.slug}/catatan`} className="learn-shortcut">
                  <PenIcon size={16} />
                  <div>
                    <strong>Catatan Pribadi</strong>
                    <span>Tulis insight sesi ini.</span>
                  </div>
                </Link>
              </div>
            </article>
          </div>
        </section>

        <section className="player-controls" aria-label="Navigasi sesi">
          {prevIdx !== null ? (
            <Link className="button button--ghost" href={`/belajar/${mod.slug}/sesi/${prevIdx}`}>
              ← Sesi Sebelumnya
            </Link>
          ) : (
            <span />
          )}
          <span className="player-controls__progress">
            Sesi {sessionIdx + 1} dari {sessions.length}
          </span>
          {nextIdx !== null ? (
            <MarkSessionComplete
              moduleSlug={mod.slug}
              sessionIndex={sessionIdx}
              totalSessions={totalSessions}
              nextHref={`/belajar/${mod.slug}/sesi/${nextIdx}`}
              disabled={lockComplete}
              disabledReason={lockReason}
            />
          ) : (
            <MarkSessionComplete
              moduleSlug={mod.slug}
              sessionIndex={sessionIdx}
              totalSessions={totalSessions}
              nextHref={`/belajar/${mod.slug}/ujian`}
              label="Selesai Sesi · Lanjut ke Ujian"
              disabled={lockComplete}
              disabledReason={lockReason}
            />
          )}
        </section>
      </div>
    </main>
  );
}
