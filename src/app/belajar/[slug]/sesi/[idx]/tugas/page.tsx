import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AssignmentForm } from "../../../../../_components/AssignmentForm";
import { CheckIcon } from "../../../../../_components/Icon";
import { LearningTabs } from "../../../../../_components/LearningTabs";
import { findModule } from "../../../../../../lib/content";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string; idx: string }>;
}): Promise<Metadata> {
  const { slug, idx } = await params;
  const mod = findModule(slug);
  return {
    title: `Tugas Sesi ${Number.parseInt(idx, 10) + 1} · ${mod?.title ?? "Modul"}`,
    robots: { index: false, follow: false },
    alternates: { canonical: `/belajar/${slug}/sesi/${idx}/tugas` }
  };
}

const RUBRIC = [
  { title: "Relevansi", desc: "Jawaban fokus pada pertanyaan tugas, bukan pembahasan umum." },
  { title: "Kedalaman", desc: "Ada contoh konkret atau penerapan nyata, bukan hanya definisi." },
  { title: "Kejelasan", desc: "Ditulis rapi, paragrafnya terstruktur, mudah dibaca oleh mentor." },
  { title: "Keaslian", desc: "Output memuat insight personal, bukan copy-paste dari AI." }
];

export default async function AssignmentPage({
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
  const briefTitle = `Tugas Sesi ${String(sessionIdx + 1).padStart(2, "0")} — ${session.title}`;

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
          <span>Tugas</span>
        </nav>

        <LearningTabs moduleSlug={mod.slug} />

        <section className="assignment-header" aria-label="Detail tugas">
          <div>
            <p className="eyebrow eyebrow--brand">Tugas Praktik</p>
            <h1>{briefTitle}</h1>
            <p className="lede">
              Setiap sesi punya satu tugas untuk dipraktikkan. Fokus pada kualitas, bukan panjang.
              Mentor akan memberi feedback dalam 2 x 24 jam.
            </p>
          </div>
          <aside className="assignment-deadline">
            <p className="eyebrow">Deadline</p>
            <strong>7 hari dari sekarang</strong>
            <span>Bisa di-extend dari dashboard tugas.</span>
          </aside>
        </section>

        <section aria-label="Brief">
          <div className="assignment-brief">
            <h2>Brief Tugas</h2>
            <p>
              [Brief tugas lengkap akan diisi oleh tim kurikulum. Intinya: peserta diminta
              menerapkan teknik dari sesi ini ke satu skenario nyata. Misal — tulis prompt untuk
              membantu adik kelas kamu merangkum materi biologi dalam format yang mudah diingat.]
            </p>
            <p>
              <strong>Langkah minimum:</strong>
            </p>
            <ol>
              <li>Jelaskan konteks kasus (1-2 kalimat).</li>
              <li>Tulis prompt yang kamu pakai.</li>
              <li>Share hasil yang keluar dari AI.</li>
              <li>Refleksi: apa yang bisa lebih baik kalau diulang?</li>
            </ol>
          </div>
        </section>

        <section aria-label="Rubrik penilaian">
          <div className="section-heading">
            <p className="eyebrow">Rubrik Penilaian</p>
            <h2>4 kriteria yang digunakan mentor untuk review</h2>
          </div>
          <div className="lp-benefit-grid">
            {RUBRIC.map((item) => (
              <article className="lp-benefit-card" key={item.title}>
                <span className="lp-benefit-card__icon">
                  <CheckIcon size={22} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-label="Submission form">
          <div className="section-heading">
            <p className="eyebrow eyebrow--brand">Kirim Tugas</p>
            <h2>Submit jawabanmu di form ini</h2>
          </div>
          <AssignmentForm briefTitle={briefTitle} moduleSlug={mod.slug} sessionIndex={sessionIdx} />
        </section>
      </div>
    </main>
  );
}
