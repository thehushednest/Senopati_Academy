import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRightIcon,
  BookIcon,
  CheckIcon,
  ClockIcon,
  LevelIcon,
  PenIcon,
  PresentIcon,
  SparklesIcon
} from "../../_components/Icon";
import { CATEGORIES, findCategory, modulesByCategory } from "../../../lib/content";

const ICON_MAP = {
  book: BookIcon,
  check: CheckIcon,
  sparkles: SparklesIcon,
  pen: PenIcon,
  present: PresentIcon
} as const;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = findCategory(slug);
  if (!cat) return { title: "Kategori tidak ditemukan" };
  return {
    title: `Kategori ${cat.name}`,
    description: cat.description,
    alternates: { canonical: `/kategori/${cat.slug}` }
  };
}

export default async function CategoryPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = findCategory(slug);

  if (!category) notFound();

  const modules = modulesByCategory(category.slug);
  const Icon = ICON_MAP[category.icon];

  return (
    <main className="academy-shell">
      <div className="container">
        <section
          className={`category-hero category-hero--${category.accent}`}
          aria-label={`Kategori ${category.name}`}
        >
          <nav className="detail-breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: 18 }}>
            <Link href="/home">Academy</Link>
            <span>/</span>
            <Link href="/modul">Modul</Link>
            <span>/</span>
            <span>{category.name}</span>
          </nav>
          <span className={`category-hero__icon category-hero__icon--${category.accent}`}>
            <Icon size={28} />
          </span>
          <p className="eyebrow">Kategori</p>
          <h1>{category.name}</h1>
          <p className="category-hero__tagline">{category.tagline}</p>
          <p className="lede category-hero__desc">{category.description}</p>
          <div className="category-hero__stats">
            <div>
              <strong>{modules.length}</strong>
              <span>Modul</span>
            </div>
            <div>
              <strong>{modules[0]?.level ?? "Pemula"}</strong>
              <span>Level awal</span>
            </div>
            <div>
              <strong>[DURASI_TOTAL]</strong>
              <span>Estimasi total</span>
            </div>
          </div>
        </section>

        <section aria-label={`Modul di kategori ${category.name}`}>
          <div className="section-heading">
            <p className="eyebrow">Isi Kategori</p>
            <h2>
              {modules.length} modul dalam jalur {category.name}
            </h2>
            <p>
              Urutan modul di bawah ini disusun supaya kamu bisa ikuti dari atas ke bawah — tapi
              bebas juga kalau kamu ingin loncat ke topik yang paling menarik.
            </p>
          </div>
          <ol className="module-track">
            {modules.map((mod, idx) => (
              <li className="module-track__item" key={mod.slug}>
                <span className="module-track__number">{String(idx + 1).padStart(2, "0")}</span>
                <div className="module-track__body">
                  <h3>{mod.title}</h3>
                  <p>{mod.excerpt}</p>
                  <div className="module-track__meta">
                    <span>
                      <LevelIcon size={14} />
                      {mod.level}
                    </span>
                    <span>
                      <ClockIcon size={14} />
                      {mod.duration}
                    </span>
                    <span>{mod.topics} Topik</span>
                  </div>
                </div>
                <Link
                  href={`/modul/${mod.slug}`}
                  className="button button--secondary button--sm module-track__cta"
                >
                  Detail
                  <ArrowRightIcon size={14} />
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section aria-label="Kategori lain">
          <div className="section-heading section-heading--center">
            <p className="eyebrow eyebrow--brand">Kategori Lainnya</p>
            <h2>Jalur belajar lain yang bisa kamu ambil setelah ini</h2>
          </div>
          <div className="category-grid category-grid--five">
            {CATEGORIES.filter((c) => c.slug !== category.slug).map((c) => {
              const CatIcon = ICON_MAP[c.icon];
              const count = modulesByCategory(c.slug).length;
              return (
                <Link key={c.slug} href={`/kategori/${c.slug}`} className="category-card">
                  <span className="category-card__icon">
                    <CatIcon size={22} />
                  </span>
                  <h3>{c.name}</h3>
                  <p className="category-card__subtitle">{c.tagline}</p>
                  <p className="category-card__count">{count} Modul</p>
                </Link>
              );
            })}
          </div>
        </section>

        <section aria-label="Call to action">
          <div className="cta-banner">
            <div>
              <p className="eyebrow">Mulai Sekarang</p>
              <h2>Siap mulai jalur {category.name}?</h2>
              <p className="lede" style={{ marginTop: 12 }}>
                Daftar sekarang untuk dapat akses semua modul di kategori ini plus update modul baru
                seumur hidup.
              </p>
            </div>
            <div className="cta-banner__actions">
              <Link className="button button--accent" href="/mulai">
                Daftar Sekarang
                <ArrowRightIcon size={16} />
              </Link>
              {modules[0] ? (
                <Link className="button button--ghost" href={`/modul/${modules[0].slug}`}>
                  Mulai Modul Pertama
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
