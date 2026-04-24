import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DiscussionBoard } from "../../../_components/DiscussionBoard";
import { LearningTabs } from "../../../_components/LearningTabs";
import { findModule, threadsForModule } from "../../../../lib/content";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const mod = findModule(slug);
  return {
    title: `Diskusi · ${mod?.title ?? "Modul"}`,
    robots: { index: false, follow: false },
    alternates: { canonical: `/belajar/${slug}/diskusi` }
  };
}

export default async function DiscussionPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mod = findModule(slug);
  if (!mod) notFound();
  const threads = threadsForModule(mod.slug);

  return (
    <main className="academy-shell learning-shell">
      <div className="container">
        <nav className="detail-breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span>/</span>
          <Link href={`/belajar/${mod.slug}`}>{mod.title}</Link>
          <span>/</span>
          <span>Diskusi</span>
        </nav>

        <LearningTabs moduleSlug={mod.slug} />

        <section className="discussion-header" aria-label="Diskusi modul">
          <p className="eyebrow eyebrow--brand">Diskusi Modul</p>
          <h1>Belajar bareng, tanya jawab bareng</h1>
          <p className="lede">
            Ruang diskusi khusus modul <strong>{mod.title}</strong>. Tanya ke peserta lain atau
            mentor — biasanya pertanyaan satu orang juga pertanyaan banyak orang.
          </p>
        </section>

        <section aria-label="Board diskusi">
          <DiscussionBoard moduleSlug={mod.slug} initialThreads={threads} />
        </section>
      </div>
    </main>
  );
}
