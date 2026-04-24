import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LearningTabs } from "../../../_components/LearningTabs";
import { NotesEditor } from "../../../_components/NotesEditor";
import { findModule } from "../../../../lib/content";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const mod = findModule(slug);
  return {
    title: `Catatan · ${mod?.title ?? "Modul"}`,
    robots: { index: false, follow: false },
    alternates: { canonical: `/belajar/${slug}/catatan` }
  };
}

const TIPS = [
  "Catat di kata kunci, bukan kalimat lengkap — biar cepat dibaca ulang.",
  "Kasih bullet atau garis pemisah untuk memisah topik.",
  "Tulis pertanyaan yang muncul di sini, lalu tanyakan ke halaman Diskusi.",
  "Tiap akhir sesi, summarize dalam 2-3 baris untuk bantu recall di masa depan."
];

export default async function NotesPage({
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
          <span>Catatan</span>
        </nav>

        <LearningTabs moduleSlug={mod.slug} />

        <section className="notes-header" aria-label="Catatan pribadi">
          <p className="eyebrow eyebrow--brand">Catatan Pribadi</p>
          <h1>Ruang pribadi buat nyatet apa saja</h1>
          <p className="lede">
            Catatan disimpan otomatis di perangkat kamu. Nggak kelihatan oleh peserta lain maupun
            mentor — hanya kamu yang baca.
          </p>
        </section>

        <section className="notes-layout">
          <div>
            <NotesEditor
              moduleSlug={mod.slug}
              placeholder={`Tulis catatan untuk modul "${mod.title}" di sini. Semua otomatis tersimpan.`}
            />
          </div>
          <aside className="notes-aside">
            <h2>Tips singkat</h2>
            <ul>
              {TIPS.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
            <div className="notes-aside__box">
              <strong>Butuh lebih?</strong>
              <p>
                Mau catatan lintas modul? Export semua modul dari halaman Progress nanti saat kita
                tambahkan fitur export di fase berikutnya.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
