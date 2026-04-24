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
import { getCurrentUser } from "../../../lib/session";
import { resolveModuleProgress } from "../../../lib/progress-server";

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

  const user = await getCurrentUser();
  const progress = user ? await resolveModuleProgress(mod.slug) : null;
  const hasStarted = Boolean(progress && progress.source === "db" && progress.completed > 0);

  // CTA utama: kalau user belum login → /daftar (register).
  // Kalau sudah login dan belum mulai → /belajar/[slug] (mulai modul).
  // Kalau sudah login & sudah mulai → /belajar/[slug]/sesi/<completed> (resume).
  const primaryCtaHref = !user
    ? "/daftar"
    : hasStarted
    ? `/belajar/${mod.slug}/sesi/${progress!.completed}`
    : `/belajar/${mod.slug}`;

  const primaryCtaLabel = !user
    ? "Daftar Akun Dulu"
    : hasStarted
    ? "Lanjutkan Belajar"
    : "Mulai Modul Ini";

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
              <span>Kategori</span>
              <strong>{category?.name ?? "Modul"}</strong>
            </div>
            {mentor ? (
              <div className="course-sidecard__row">
                <span>Mentor</span>
                <strong>{mentor.name}</strong>
              </div>
            ) : null}
            <Link className="button button--primary" href={primaryCtaHref} style={{ marginTop: 8 }}>
              {primaryCtaLabel}
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
              <Link className="button button--primary button--sm" href={primaryCtaHref}>
                {user ? "Buka Modul Lengkap" : "Daftar untuk Buka Modul"}
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
                    <strong>{r.level}</strong>
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
