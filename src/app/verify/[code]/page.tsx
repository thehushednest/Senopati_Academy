import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { findCategory, findModule } from "../../../lib/content";
import { CheckIcon } from "../../_components/Icon";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Verifikasi Sertifikat · ${code}`,
    description: "Verifikasi keaslian sertifikat Senopati Academy.",
    robots: { index: false, follow: false },
  };
}

function formatIndoDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const cert = await prisma.moduleCertificate.findUnique({
    where: { certCode: code },
    include: { student: { select: { name: true } } },
  });

  const mod = cert ? findModule(cert.moduleSlug) : null;
  const category = mod ? findCategory(mod.categorySlug) : null;

  return (
    <main className="academy-shell learning-shell">
      <div className="container">
        <section className="certificate-hero" aria-label="Verifikasi sertifikat">
          <div>
            <p className="eyebrow eyebrow--brand">Verifikasi Sertifikat</p>
            {cert ? (
              <>
                <h1>
                  Sertifikat <span className="highlight-text">terverifikasi</span>
                </h1>
                <p className="lede">
                  Kode <strong>{cert.certCode}</strong> adalah sertifikat resmi yang diterbitkan
                  oleh Senopati Academy.
                </p>
                <ul style={{ marginTop: 20, display: "grid", gap: 10 }}>
                  <li>
                    <CheckIcon size={16} /> Atas nama: <strong>{cert.student.name}</strong>
                  </li>
                  <li>
                    <CheckIcon size={16} /> Modul: <strong>{mod?.title ?? cert.moduleSlug}</strong>
                  </li>
                  {category ? (
                    <li>
                      <CheckIcon size={16} /> Jalur: <strong>{category.name}</strong>
                    </li>
                  ) : null}
                  <li>
                    <CheckIcon size={16} /> Diterbitkan: <strong>{formatIndoDate(cert.issuedAt)}</strong>
                  </li>
                  {cert.score !== null ? (
                    <li>
                      <CheckIcon size={16} /> Skor ujian akhir: <strong>{cert.score}</strong>
                    </li>
                  ) : null}
                </ul>
                <div style={{ marginTop: 24 }}>
                  <Link className="button button--primary" href="/modul">
                    Jelajahi Modul Lain
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h1>Sertifikat tidak ditemukan</h1>
                <p className="lede">
                  Kode <strong>{code}</strong> tidak cocok dengan sertifikat manapun di sistem kami.
                  Pastikan kamu mengetik kode dengan benar.
                </p>
                <div style={{ marginTop: 24 }}>
                  <Link className="button button--secondary" href="/">
                    Kembali ke Beranda
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
