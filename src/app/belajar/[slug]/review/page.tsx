import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon } from "../../../_components/Icon";
import { ReviewForm } from "../../../_components/ReviewForm";
import { findMentor, findModule } from "../../../../lib/content";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const mod = findModule(slug);
  return {
    title: `Review · ${mod?.title ?? "Modul"}`,
    robots: { index: false, follow: false },
    alternates: { canonical: `/belajar/${slug}/review` }
  };
}

const EXISTING_REVIEWS = [
  {
    initials: "R",
    name: "[NAMA_PELAJAR_1]",
    rating: 5,
    quote:
      "Sesi 03 ngebuka banget. Saya sekarang nggak asal paste ke ChatGPT — pakai framework yang diajarkan, outputnya lebih fokus.",
    role: "SMA · Jakarta"
  },
  {
    initials: "M",
    name: "[NAMA_PELAJAR_2]",
    rating: 4,
    quote:
      "Mentor-nya sabar banget jawab pertanyaan di diskusi. Materi realistis untuk konteks Indonesia, nggak cuma nyomot kasus luar.",
    role: "Mahasiswa · Surabaya"
  },
  {
    initials: "C",
    name: "[NAMA_PELAJAR_3]",
    rating: 5,
    quote:
      "Saya pake ini untuk bawakan workshop ke adik-adik SMP. Modulnya rapi, jadi mudah diadaptasi ke komunitas.",
    role: "Guru · Bandung"
  }
];

export default async function ReviewPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mod = findModule(slug);
  if (!mod) notFound();
  const mentor = findMentor(mod.mentorSlug);

  return (
    <main className="academy-shell learning-shell">
      <div className="container">
        <nav className="detail-breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span>/</span>
          <Link href={`/belajar/${mod.slug}`}>{mod.title}</Link>
          <span>/</span>
          <span>Review</span>
        </nav>

        <section className="review-hero" aria-label="Review modul">
          <p className="eyebrow eyebrow--brand">Review Modul</p>
          <h1>
            Gimana pengalaman kamu di{" "}
            <span className="highlight-text">{mod.title}</span>?
          </h1>
          <p className="lede">
            Review jujur kamu jadi bahan bakar tim kurikulum untuk bikin modul lebih baik. Juga
            bantu peserta lain milih modul yang pas buat mereka.
          </p>
          {mentor ? (
            <div className="review-hero__mentor">
              <span>{mentor.initials}</span>
              <div>
                <strong>Mentor modul: {mentor.name}</strong>
                <span>{mentor.role}</span>
              </div>
            </div>
          ) : null}
        </section>

        <section aria-label="Form review">
          <ReviewForm moduleTitle={mod.title} moduleSlug={mod.slug} />
        </section>

        <section aria-label="Review peserta lain">
          <div className="section-heading">
            <p className="eyebrow">Apa Kata Peserta Lain</p>
            <h2>Review yang sudah masuk untuk modul ini</h2>
          </div>
          <div className="review-list">
            {EXISTING_REVIEWS.map((review) => (
              <article className="review-entry" key={review.name}>
                <span className="review-entry__avatar">{review.initials}</span>
                <div>
                  <div className="review-entry__top">
                    <strong>{review.name}</strong>
                    <span>
                      {Array.from({ length: review.rating })
                        .map(() => "★")
                        .join("")}
                      {Array.from({ length: 5 - review.rating })
                        .map(() => "☆")
                        .join("")}
                    </span>
                  </div>
                  <p>"{review.quote}"</p>
                  <small>{review.role}</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-label="Call to action">
          <div className="cta-banner">
            <div>
              <p className="eyebrow">Next Step</p>
              <h2>Selesai review? Saatnya pilih modul berikutnya.</h2>
              <p className="lede" style={{ marginTop: 12 }}>
                Kamu sudah kerja keras menyelesaikan modul ini. Jangan berhenti di satu — konsistensi
                adalah kunci biar benar-benar menguasai AI.
              </p>
            </div>
            <div className="cta-banner__actions">
              <Link className="button button--accent" href={`/belajar/${mod.slug}/selesai`}>
                Lihat Rekomendasi
                <ArrowRightIcon size={16} />
              </Link>
              <Link className="button button--ghost" href={`/belajar/${mod.slug}/sertifikat`}>
                Unduh Sertifikat
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
