import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FinalExamRunner } from "../../../_components/FinalExamRunner";
import { findModule, FINAL_EXAM_SAMPLE } from "../../../../lib/content";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const mod = findModule(slug);
  return {
    title: `Ujian Akhir · ${mod?.title ?? "Modul"}`,
    robots: { index: false, follow: false },
    alternates: { canonical: `/belajar/${slug}/ujian` }
  };
}

export default async function FinalExamPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mod = findModule(slug);
  if (!mod) notFound();

  return (
    <main className="academy-shell learning-shell">
      <div className="container">
        <nav className="detail-breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span>/</span>
          <Link href={`/belajar/${mod.slug}`}>{mod.title}</Link>
          <span>/</span>
          <span>Ujian Akhir</span>
        </nav>

        <section className="exam-header" aria-label="Ujian akhir">
          <p className="eyebrow eyebrow--brand">Ujian Akhir Modul</p>
          <h1>Evaluasi penutup — tunjukkin yang sudah kamu pahami.</h1>
          <p className="lede">
            Sedikit formal: {FINAL_EXAM_SAMPLE.length} soal pilihan ganda, 45 menit, passing score
            70. Lulus → lanjut ke sertifikat. Belum lulus → ulang setelah 24 jam, tidak ada penalti.
          </p>
          <div className="exam-header__meta">
            <span>{FINAL_EXAM_SAMPLE.length} soal</span>
            <span>45 menit</span>
            <span>Passing 70%</span>
            <span>1 kali attempt per hari</span>
          </div>
        </section>

        <section aria-label="Ujian">
          <FinalExamRunner
            moduleSlug={mod.slug}
            questions={FINAL_EXAM_SAMPLE}
            durationMinutes={45}
            passingScore={70}
          />
        </section>
      </div>
    </main>
  );
}
