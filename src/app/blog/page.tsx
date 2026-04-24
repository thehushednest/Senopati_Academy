import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "../_components/Icon";
import { ARTICLES } from "../../lib/content";

export const metadata: Metadata = {
  title: "Blog — Literasi AI untuk Pelajar Indonesia",
  description:
    "Artikel ringan, praktis, dan jujur tentang AI. Dari panduan prompt sampai diskusi etika — dirancang untuk pelajar Indonesia.",
  alternates: { canonical: "/blog" }
};

function formatDate(iso: string) {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

export default function BlogPage() {
  const [featured, ...rest] = ARTICLES;

  return (
    <main className="academy-shell">
      <div className="container">
        <section className="lp-hero" aria-label="Blog Senopati Academy">
          <p className="eyebrow eyebrow--brand">Blog</p>
          <h1 className="lp-hero__title">
            Literasi AI untuk <span className="highlight-text">pelajar Indonesia</span> — ringan,
            praktis, jujur.
          </h1>
          <p className="lede lp-hero__lede">
            Artikel pendek yang bisa dibaca di sela kegiatan. Dari panduan cara pakai AI,
            pembahasan etika, sampai refleksi soal kerja di era AI.
          </p>
        </section>

        {featured ? (
          <section aria-label="Artikel unggulan">
            <Link className="blog-feature" href={`/blog/${featured.slug}`}>
              <div className="blog-feature__tag">{featured.tag}</div>
              <h2>{featured.title}</h2>
              <p>{featured.excerpt}</p>
              <div className="blog-feature__meta">
                <span>{featured.author}</span>
                <span>·</span>
                <span>{formatDate(featured.publishedAt)}</span>
                <span>·</span>
                <span>{featured.readingMinutes} menit baca</span>
              </div>
              <span className="blog-feature__cta">
                Baca artikel
                <ArrowRightIcon size={16} />
              </span>
            </Link>
          </section>
        ) : null}

        <section aria-label="Semua artikel">
          <div className="section-heading">
            <p className="eyebrow">Artikel Lainnya</p>
            <h2>Semua tulisan terbaru</h2>
          </div>
          <div className="blog-grid">
            {rest.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="blog-card"
              >
                <span className="blog-card__tag">{article.tag}</span>
                <h3>{article.title}</h3>
                <p>{article.excerpt}</p>
                <div className="blog-card__meta">
                  <span>{article.author}</span>
                  <span>·</span>
                  <span>{formatDate(article.publishedAt)}</span>
                  <span>·</span>
                  <span>{article.readingMinutes} menit</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section aria-label="Call to action">
          <div className="cta-banner">
            <div>
              <p className="eyebrow">Subscribe</p>
              <h2>Dapat artikel baru langsung ke email kamu.</h2>
              <p className="lede" style={{ marginTop: 12 }}>
                Satu newsletter ringan per minggu. Berisi artikel, tips AI, dan modul terbaru
                Senopati Academy. Gratis.
              </p>
            </div>
            <div className="cta-banner__actions">
              <Link className="button button--accent" href="/mulai">
                Mulai Belajar
                <ArrowRightIcon size={16} />
              </Link>
              <Link className="button button--ghost" href="/modul">
                Lihat Modul
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
