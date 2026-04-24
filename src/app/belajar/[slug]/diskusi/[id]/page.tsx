import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LearningTabs } from "../../../../_components/LearningTabs";
import { ThreadDetail } from "../../../../_components/ThreadDetail";
import { findModule } from "../../../../../lib/content";
import { prisma } from "../../../../../lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}): Promise<Metadata> {
  const { slug, id } = await params;
  const thread = await prisma.discussionThread.findUnique({
    where: { id },
    select: { title: true, moduleSlug: true },
  });
  const mod = findModule(slug);
  return {
    title: thread ? `${thread.title} · Diskusi ${mod?.title ?? ""}` : "Thread diskusi",
    robots: { index: false, follow: false },
    alternates: { canonical: `/belajar/${slug}/diskusi/${id}` },
  };
}

export default async function ThreadDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const mod = findModule(slug);
  if (!mod) notFound();

  // Validasi thread ada & memang milik modul ini — kalau tidak, 404 lebih informatif.
  const thread = await prisma.discussionThread.findUnique({
    where: { id },
    select: { id: true, moduleSlug: true },
  });
  if (!thread || thread.moduleSlug !== slug) notFound();

  return (
    <main className="academy-shell learning-shell">
      <div className="container">
        <nav className="detail-breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span>/</span>
          <Link href={`/belajar/${mod.slug}`}>{mod.title}</Link>
          <span>/</span>
          <Link href={`/belajar/${mod.slug}/diskusi`}>Diskusi</Link>
          <span>/</span>
          <span>Thread</span>
        </nav>

        <LearningTabs moduleSlug={mod.slug} />

        <section aria-label="Thread diskusi">
          <ThreadDetail threadId={id} />
        </section>
      </div>
    </main>
  );
}
