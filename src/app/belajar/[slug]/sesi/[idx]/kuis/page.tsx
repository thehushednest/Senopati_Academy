import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LearningTabs } from "../../../../../_components/LearningTabs";
import { QuizRunner } from "../../../../../_components/QuizRunner";
import { findModule, QUIZ_SAMPLE } from "../../../../../../lib/content";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string; idx: string }>;
}): Promise<Metadata> {
  const { slug, idx } = await params;
  const mod = findModule(slug);
  return {
    title: `Kuis Sesi ${Number.parseInt(idx, 10) + 1} · ${mod?.title ?? "Modul"}`,
    robots: { index: false, follow: false },
    alternates: { canonical: `/belajar/${slug}/sesi/${idx}/kuis` }
  };
}

export default async function QuizPage({
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

  const session = mod.syllabus[sessionIdx];

  return (
    <main className="academy-shell learning-shell">
      <div className="container">
        <nav className="detail-breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span>/</span>
          <Link href={`/belajar/${mod.slug}`}>{mod.title}</Link>
          <span>/</span>
          <Link href={`/belajar/${mod.slug}/sesi/${sessionIdx}`}>
            Sesi {String(sessionIdx + 1).padStart(2, "0")}
          </Link>
          <span>/</span>
          <span>Kuis</span>
        </nav>

        <LearningTabs moduleSlug={mod.slug} />

        <section className="quiz-header" aria-label="Kuis header">
          <p className="eyebrow eyebrow--brand">Kuis Sesi {String(sessionIdx + 1).padStart(2, "0")}</p>
          <h1>{session.title}</h1>
          <p className="lede">
            {QUIZ_SAMPLE.length} soal pilihan ganda. Passing score 70%. Kamu bisa ulang kapan saja
            kalau belum lolos — tidak mempengaruhi kelulusan modul, hanya untuk cek pemahaman.
          </p>
          <div className="quiz-header__meta">
            <span>{QUIZ_SAMPLE.length} soal</span>
            <span>Passing 70%</span>
            <span>Waktu bebas</span>
            <span>Bisa diulang</span>
          </div>
        </section>

        <section aria-label="Kuis">
          <QuizRunner
            questions={QUIZ_SAMPLE}
            passingScore={70}
            moduleSlug={mod.slug}
            sessionIndex={sessionIdx}
          />
        </section>
      </div>
    </main>
  );
}
