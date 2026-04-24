import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon } from "../../../_components/Icon";
import { CertificateActions } from "../../../_components/CertificateActions";
import { UserName } from "../../../_components/UserName";
import { findCategory, findMentor, findModule } from "../../../../lib/content";
import {
  getExistingCertificate,
  hasPassedFinalExam,
  getLatestFinalExamResult,
} from "../../../../lib/progress-server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/session";
import { notify } from "../../../../lib/notify";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const mod = findModule(slug);
  return {
    title: `Sertifikat · ${mod?.title ?? "Modul"}`,
    robots: { index: false, follow: false },
    alternates: { canonical: `/belajar/${slug}/sertifikat` }
  };
}

function formatIndoDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function generateCertCode(moduleSlug: string) {
  const prefix = moduleSlug.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SENACAD-${prefix}-${rand}`;
}

export default async function CertificatePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mod = findModule(slug);
  if (!mod) notFound();

  const category = findCategory(mod.categorySlug);
  const mentor = findMentor(mod.mentorSlug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://asksenopati.com";

  // Cek apakah user berhak dapat sertifikat. Kalau belum ada tapi sudah lulus final exam → auto-issue.
  const user = await getCurrentUser();
  const existing = await getExistingCertificate(slug);
  const passed = await hasPassedFinalExam(slug);
  const latestAttempt = await getLatestFinalExamResult(slug);

  let certificate = existing;
  if (!certificate && user && passed && latestAttempt) {
    let code = generateCertCode(slug);
    for (let attempt = 0; attempt < 5; attempt++) {
      const dup = await prisma.moduleCertificate.findUnique({ where: { certCode: code } });
      if (!dup) break;
      code = generateCertCode(slug);
    }
    certificate = await prisma.moduleCertificate.create({
      data: {
        studentId: user.id,
        moduleSlug: slug,
        certCode: code,
        score: latestAttempt.score,
      },
    });
    await notify({
      userId: user.id,
      title: "Sertifikat modul baru siap",
      body: `Kamu lulus "${mod.title}" dengan skor ${latestAttempt.score}. Kode sertifikat: ${certificate.certCode}.`,
      href: `/belajar/${slug}/sertifikat`,
    });
  }

  const certificateId = certificate?.certCode ?? `SENACAD-${mod.slug.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)}-PREVIEW`;
  const issueDate = formatIndoDate(certificate?.issuedAt ?? new Date());
  const certificateUrl = `${siteUrl}/verify/${certificateId}`;
  const isPreview = !certificate;

  return (
    <main className="academy-shell learning-shell">
      <div className="container">
        <nav className="detail-breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span>/</span>
          <Link href={`/belajar/${mod.slug}`}>{mod.title}</Link>
          <span>/</span>
          <span>Sertifikat</span>
        </nav>

        <section className="certificate-hero" aria-label="Sertifikat">
          <div>
            <p className="eyebrow eyebrow--brand">
              {isPreview ? "Pratinjau Sertifikat" : "Sertifikat Resmi"}
            </p>
            <h1>
              {isPreview ? (
                <>
                  Preview sertifikat — <span className="highlight-text">belum aktif</span>
                </>
              ) : (
                <>
                  Selamat <UserName /> — kamu resmi <span className="highlight-text">lulus modul ini</span>.
                </>
              )}
            </h1>
            <p className="lede">
              {isPreview
                ? "Sertifikat akan otomatis aktif setelah kamu lulus ujian akhir modul. Ini baru preview desain."
                : "Sertifikat ini bisa diunduh sebagai PDF/PNG, dibagikan ke LinkedIn, atau ditambahkan ke CV & portofolio belajar kamu."}
            </p>
            {!isPreview ? (
              <CertificateActions
                certificateId={certificateId}
                certificateUrl={certificateUrl}
                moduleTitle={mod.title}
              />
            ) : (
              <div style={{ marginTop: 16 }}>
                <Link className="button button--primary" href={`/belajar/${mod.slug}/ujian`}>
                  Kerjakan Ujian Akhir
                  <ArrowRightIcon size={16} />
                </Link>
              </div>
            )}
          </div>

          <article
            className="certificate-card"
            aria-label="Sertifikat Senopati Academy"
            id="certificate"
          >
            <header className="certificate-card__header">
              <span className="certificate-card__brand">
                <span className="certificate-card__brand-mark">S</span>
                <span>
                  <strong>Senopati Academy</strong>
                  <small>AI Literacy Certificate Program</small>
                </span>
              </span>
              <span className="certificate-card__id">
                No. {certificateId}
              </span>
            </header>

            <div className="certificate-card__body">
              <p className="certificate-card__subtitle">Certificate of Completion</p>
              <p className="certificate-card__preamble">Diberikan kepada</p>
              <h2 className="certificate-card__name"><UserName /></h2>
              <p className="certificate-card__for">atas penyelesaian modul</p>
              <h3 className="certificate-card__module">{mod.title}</h3>
              <p className="certificate-card__category">
                Jalur {category?.name ?? "Senopati Academy"} · Level {mod.level}
              </p>
              <p className="certificate-card__description">
                Telah menyelesaikan seluruh sesi, lulus ujian akhir, dan memenuhi standar literasi
                AI yang dirancang oleh Senopati Strategic Institute.
              </p>
            </div>

            <footer className="certificate-card__footer">
              <div className="certificate-card__signature">
                <span className="certificate-card__sig-line" />
                <strong>{mentor?.name ?? "[NAMA_MENTOR]"}</strong>
                <span>{mentor?.role ?? "Mentor Senopati Academy"}</span>
              </div>
              <div className="certificate-card__signature">
                <span className="certificate-card__sig-line" />
                <strong>Senopati Strategic Institute</strong>
                <span>Program Director</span>
              </div>
              <div className="certificate-card__stamp" aria-hidden="true">
                <div>
                  <strong>Issued</strong>
                  <span>{issueDate}</span>
                </div>
              </div>
            </footer>
          </article>
        </section>

        <section aria-label="Cara mengklaim">
          <div className="section-heading">
            <p className="eyebrow">Bagaimana Selanjutnya</p>
            <h2>3 cara memanfaatkan sertifikat ini</h2>
          </div>
          <div className="lp-benefit-grid">
            <article className="lp-benefit-card">
              <span className="lp-benefit-card__icon">1</span>
              <h3>Tambahkan ke LinkedIn</h3>
              <p>
                Klik tombol <strong>LinkedIn</strong> di atas untuk langsung share. Sertifikat bisa
                dimasukkan ke bagian Licenses & Certifications di profilmu.
              </p>
            </article>
            <article className="lp-benefit-card">
              <span className="lp-benefit-card__icon">2</span>
              <h3>Sisipkan ke CV</h3>
              <p>
                Unduh versi PDF, lalu tambahkan ke bagian Pendidikan/Sertifikat di CV kamu.
                Referensikan verifikasi lewat URL yang tersedia di pojok sertifikat.
              </p>
            </article>
            <article className="lp-benefit-card">
              <span className="lp-benefit-card__icon">3</span>
              <h3>Pamerin di portofolio</h3>
              <p>
                Buat halaman portofolio pribadi? Embed gambar PNG atau link verifikasi untuk
                menunjukkan progres belajar AI kamu kepada rekrut atau kolaborator.
              </p>
            </article>
          </div>
        </section>

        <section aria-label="Next step">
          <div className="cta-banner">
            <div>
              <p className="eyebrow">Next Step</p>
              <h2>Modul selesai — yuk pilih jalur berikutnya.</h2>
              <p className="lede" style={{ marginTop: 12 }}>
                Sebelum itu, kalau sempat, beri review singkat untuk bantu peserta lain di masa
                depan. Feedback kamu jadi bahan evaluasi mentor dan tim kurikulum.
              </p>
            </div>
            <div className="cta-banner__actions">
              <Link className="button button--accent" href={`/belajar/${mod.slug}/review`}>
                Beri Review
                <ArrowRightIcon size={16} />
              </Link>
              <Link className="button button--ghost" href={`/belajar/${mod.slug}/selesai`}>
                Lihat Rekomendasi Berikutnya
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
