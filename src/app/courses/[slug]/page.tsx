import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourseBySlug, getCourseSlugs } from "../../../lib/cms";
import { ArrowRightIcon, ClockIcon, LevelIcon } from "../../_components/Icon";

export async function generateStaticParams() {
  const slugs = await getCourseSlugs();
  return slugs.map((slug: string) => ({ slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) {
    return { title: "Program tidak ditemukan" };
  }
  return {
    title: course.title,
    description: course.excerpt,
    openGraph: {
      title: course.title,
      description: course.excerpt,
      type: "article"
    }
  };
}

export default async function CourseDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  return (
    <main className="academy-shell academy-shell--detail">
      <div className="container">
        <section className="course-hero" style={{ marginTop: 24 }}>
          <div className="card detail-hero-card">
            <nav className="detail-breadcrumb" aria-label="Breadcrumb">
              <Link href="/home">Academy</Link>
              <span>/</span>
              <Link href="/home#catalog">Program</Link>
              <span>/</span>
              <span>{course.category?.name || course.eyebrow}</span>
            </nav>
            <p className="eyebrow">{course.category?.name || course.eyebrow}</p>
            <h1>{course.title}</h1>
            <p className="lede">{course.excerpt}</p>
            <div className="featured-course__meta" style={{ marginTop: 24 }}>
              <span>
                <LevelIcon size={14} style={{ display: "inline-block", verticalAlign: "middle", marginRight: 6 }} />
                {course.difficultyLabel}
              </span>
              <span>
                <ClockIcon size={14} style={{ display: "inline-block", verticalAlign: "middle", marginRight: 6 }} />
                {course.duration}
              </span>
              <span>{course.priceLabel}</span>
            </div>
          </div>
          <aside className="course-sidecard">
            <div className="course-sidecard__row">
              <span>Level</span>
              <strong>{course.difficultyLabel}</strong>
            </div>
            <div className="course-sidecard__row">
              <span>Durasi</span>
              <strong>{course.duration}</strong>
            </div>
            <div className="course-sidecard__row">
              <span>Harga</span>
              <strong>{course.priceLabel}</strong>
            </div>
            <div className="course-sidecard__row">
              <span>Track</span>
              <strong>{course.category?.name || course.eyebrow}</strong>
            </div>
            <Link className="button button--primary" href="/home#catalog" style={{ marginTop: 8 }}>
              Daftar Minat
              <ArrowRightIcon size={16} />
            </Link>
            <Link className="button button--secondary button--sm" href="/home#catalog">
              Kembali ke katalog
            </Link>
          </aside>
        </section>

        <section className="detail-grid" style={{ marginTop: 28 }}>
          <article className="detail-panel">
            <p className="eyebrow eyebrow--brand">What you'll learn</p>
            <h2>Yang akan dipelajari</h2>
            <ul className="benefit-list">
              {course.benefits.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="detail-panel">
            <p className="eyebrow">Curriculum</p>
            <h2>Kurikulum inti</h2>
            <div className="curriculum-list">
              {course.curriculum.map((item) => (
                <div className="curriculum-item" key={item.title}>
                  <div className="curriculum-item__body">
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
