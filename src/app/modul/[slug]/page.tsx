import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon, ClockIcon, LevelIcon } from "../../_components/Icon";
import {
  findCategory,
  findMentor,
  findModule,
  modulesByCategory,
  MODULES
} from "../../../lib/content";

export function generateStaticParams() {
  return MODULES.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const mod = findModule(slug);
  if (!mod) return { title: "Modul tidak ditemukan" };
  return {
    title: mod.title,
    description: mod.excerpt,
    alternates: { canonical: `/modul/${mod.slug}` },
    openGraph: { title: mod.title, description: mod.excerpt, type: "article" }
  };
}

export default async function ModuleDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mod = findModule(slug);

  if (!mod) notFound();

  const category = findCategory(mod.categorySlug);
  const mentor = findMentor(mod.mentorSlug);
  const related = modulesByCategory(mod.categorySlug)
    .filter((m) => m.slug !== mod.slug)
    .slice(0, 3);

  return (
    <main className="academy-shell academy-shell--detail">
      <div className="container">
        <section className="course-hero" style={{ marginTop: 24 }}>
          <div className="card detail-hero-card">
            <nav className="detail-breadcrumb" aria-label="Breadcrumb">
              <Link href="/home">Academy</Link>
              <span>/</span>
              <Link href="/modul">Modul</Link>
              {category ? (
                <>
                  <span>/</span>
                  <Link href={`/kategori/${category.slug}`}>{category.name}</Link>
                </>
              ) : null}
            </nav>
            <p className="eyebrow">{category?.name ?? "Modul"}</p>
            <h1>{mod.title}</h1>
            <p className="lede">{mod.description}</p>
            <div className="featured-course__meta" style={{ marginTop: 24 }}>
              <span>
                <LevelIcon size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
                {mod.level}
              </span>
              <span>
                <ClockIcon size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
                {mod.duration}
              </span>
              <span>{mod.topics} Topik</span>
              <span>{mod.price}</span>
            </div>
          </div>
          <aside className="course-sidecard">
            <div className="course-sidecard__row">
              <span>Level</span>
              <strong>{mod.level}</strong>
            </div>
            <div className="course-sidecard__row">
              <span>Durasi</span>
              <strong>{mod.duration}</strong>
            </div>
            <div className="course-sidecard__row">
              <span>Harga</span>
              <strong>{mod.price}</strong>
            </div>
            <div className="course-sidecard__row">
              <span>Kategori</span>
              <strong>{category?.name ?? "Modul"}</strong>
            </div>
            {mentor ? (
              <div className="course-sidecard__row">
                <span>Mentor</span>
                <strong>{mentor.name}</strong>
              </div>
            ) : null}
            <Link className="button button--primary" href="/mulai" style={{ marginTop: 8 }}>
              Daftar Modul Ini
              <ArrowRightIcon size={16} />
            </Link>
            <Link className="button button--secondary button--sm" href="/modul">
              Kembali ke katalog
            </Link>
          </aside>
        </section>

        <section className="detail-grid" style={{ marginTop: 28 }}>
          <article className="detail-panel">
            <p className="eyebrow eyebrow--brand">Tujuan Belajar</p>
            <h2>Apa yang akan kamu kuasai</h2>
            <ul className="benefit-list">
              {mod.objectives.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="detail-panel">
            <p className="eyebrow">Silabus</p>
            <h2>Alur modul dari sesi ke sesi</h2>
            <div className="curriculum-list">
              {mod.syllabus.map((item) => (
                <div className="curriculum-item" key={item.title}>
                  <div className="curriculum-item__body">
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="detail-panel">
            <p className="eyebrow eyebrow--brand">Yang Didapat</p>
            <h2>Semua yang termasuk dalam modul ini</h2>
            <ul className="benefit-list">
              {mod.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          {mentor ? (
            <article className="detail-panel mentor-feature">
              <p className="eyebrow">Mentor Modul</p>
              <div className="mentor-feature__inner">
                <span className="mentor-feature__avatar">{mentor.initials}</span>
                <div>
                  <h3>{mentor.name}</h3>
                  <p className="mentor-feature__role">{mentor.role}</p>
                  <p>{mentor.headline}</p>
                  <Link
                    className="button button--secondary button--sm"
                    href={`/mentor/${mentor.slug}`}
                    style={{ marginTop: 12 }}
                  >
                    Lihat Profil Mentor
                    <ArrowRightIcon size={14} />
                  </Link>
                </div>
              </div>
            </article>
          ) : null}

          <article className="detail-panel">
            <p className="eyebrow eyebrow--brand">Preview Materi</p>
            <h2>Cuplikan materi dari modul</h2>
            <div className="preview-box">
              <div className="preview-box__tag">Preview · 10 menit pertama</div>
              <p>
                [Preview video atau konten tekstual akan ditampilkan di sini. Bagian ini dirancang
                agar calon pelajar bisa merasakan gaya mentor dan kedalaman materi sebelum
                memutuskan untuk mendaftar.]
              </p>
              <Link className="button button--primary button--sm" href="/mulai">
                Buka Modul Lengkap
                <ArrowRightIcon size={14} />
              </Link>
            </div>
          </article>
        </section>

        {related.length ? (
          <section style={{ marginTop: 48 }} aria-label="Modul terkait">
            <div className="section-heading section-heading--center">
              <p className="eyebrow">Modul Terkait</p>
              <h2>Lanjutkan jalur {category?.name}</h2>
            </div>
            <div className="spotlight-grid">
              {related.map((r) => (
                <article className="spotlight-card" key={r.slug}>
                  <div className="spotlight-card__top">
                    <span>{category?.name}</span>
                    <strong>{r.price}</strong>
                  </div>
                  <h3>{r.title}</h3>
                  <p>{r.excerpt}</p>
                  <Link className="button button--ghost button--sm" href={`/modul/${r.slug}`}>
                    Lihat Modul
                    <ArrowRightIcon size={14} />
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
