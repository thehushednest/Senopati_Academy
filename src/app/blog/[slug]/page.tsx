import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon } from "../../_components/Icon";
import { ARTICLES, findArticle } from "../../../lib/content";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) return { title: "Artikel tidak ditemukan" };
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt
    }
  };
}

function formatDate(iso: string) {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

export default async function ArticleDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = findArticle(slug);

  if (!article) notFound();

  const others = ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <main className="academy-shell academy-shell--detail">
      <div className="container">
        <article className="article" aria-label={article.title}>
          <nav className="detail-breadcrumb" aria-label="Breadcrumb">
            <Link href="/home">Academy</Link>
            <span>/</span>
            <Link href="/blog">Blog</Link>
            <span>/</span>
            <span>{article.tag}</span>
          </nav>

          <header className="article__header">
            <p className="eyebrow eyebrow--brand">{article.tag}</p>
            <h1>{article.title}</h1>
            <p className="lede">{article.excerpt}</p>
            <div className="article__meta">
              <span className="article__author-avatar">
                {article.author.charAt(1)}
              </span>
              <div>
                <strong>{article.author}</strong>
                <span>
                  {formatDate(article.publishedAt)} · {article.readingMinutes} menit baca
                </span>
              </div>
            </div>
          </header>

          <div className="article__body">
            {article.body.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          <footer className="article__footer">
            <p>Kalau tulisan ini bermanfaat, bagikan ke teman yang juga sedang belajar AI.</p>
            <div className="article__footer-actions">
              <Link className="button button--secondary button--sm" href="/blog">
                Kembali ke blog
              </Link>
              <Link className="button button--primary button--sm" href="/mulai">
                Lihat Modul Senopati
                <ArrowRightIcon size={14} />
              </Link>
            </div>
          </footer>
        </article>

        <section aria-label="Artikel lainnya" style={{ marginTop: 56 }}>
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Artikel Lainnya</p>
            <h2>Bacaan berikutnya</h2>
          </div>
          <div className="blog-grid">
            {others.map((other) => (
              <Link key={other.slug} href={`/blog/${other.slug}`} className="blog-card">
                <span className="blog-card__tag">{other.tag}</span>
                <h3>{other.title}</h3>
                <p>{other.excerpt}</p>
                <div className="blog-card__meta">
                  <span>{other.author}</span>
                  <span>·</span>
                  <span>{formatDate(other.publishedAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
