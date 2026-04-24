import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon, ClockIcon, LevelIcon } from "../../_components/Icon";
import {
  findCategory,
  findMentor,
  MENTORS,
  modulesByMentor
} from "../../../lib/content";

export function generateStaticParams() {
  return MENTORS.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const mentor = findMentor(slug);
  if (!mentor) return { title: "Mentor tidak ditemukan" };
  return {
    title: `${mentor.name} — Mentor Senopati Academy`,
    description: mentor.headline,
    alternates: { canonical: `/mentor/${mentor.slug}` }
  };
}

export default async function MentorPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mentor = findMentor(slug);

  if (!mentor) notFound();

  const modules = modulesByMentor(mentor.slug);

  return (
    <main className="academy-shell">
      <div className="container">
        <section className="mentor-hero" aria-label={`Profil ${mentor.name}`}>
          <nav className="detail-breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: 14 }}>
            <Link href="/home">Academy</Link>
            <span>/</span>
            <Link href="/tentang">Tentang</Link>
            <span>/</span>
            <span>Mentor</span>
          </nav>
          <div className="mentor-hero__inner">
            <span className="mentor-hero__avatar">{mentor.initials}</span>
            <div className="mentor-hero__body">
              <p className="eyebrow">Mentor</p>
              <h1>{mentor.name}</h1>
              <p className="mentor-hero__role">{mentor.role}</p>
              <p className="lede mentor-hero__headline">{mentor.headline}</p>
              {mentor.social ? (
                <div className="mentor-hero__social">
                  {mentor.social.twitter ? (
                    <a href={mentor.social.twitter} target="_blank" rel="noreferrer noopener">
                      Twitter
                    </a>
                  ) : null}
                  {mentor.social.linkedin ? (
                    <a href={mentor.social.linkedin} target="_blank" rel="noreferrer noopener">
                      LinkedIn
                    </a>
                  ) : null}
                  {mentor.social.website ? (
                    <a href={mentor.social.website} target="_blank" rel="noreferrer noopener">
                      Website
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section aria-label="Profil">
          <div className="mentor-profile-grid">
            <article className="detail-panel">
              <p className="eyebrow eyebrow--brand">Tentang</p>
              <h2>Latar belakang</h2>
              <p style={{ marginTop: 12, color: "var(--muted)", lineHeight: 1.75 }}>{mentor.bio}</p>
            </article>
            <article className="detail-panel">
              <p className="eyebrow">Keahlian</p>
              <h2>Fokus & spesialisasi</h2>
              <ul className="mentor-expertise">
                {mentor.expertise.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section aria-label="Modul yang dibawakan">
          <div className="section-heading">
            <p className="eyebrow eyebrow--brand">Modul yang Dibawakan</p>
            <h2>{modules.length} modul dibawakan oleh {mentor.name}</h2>
          </div>
          <div className="course-grid">
            {modules.map((mod) => {
              const category = findCategory(mod.categorySlug);
              return (
                <article className="course-card" key={mod.slug}>
                  <div className="course-card__media" aria-hidden="true">
                    <span className="course-card__badge">{category?.name}</span>
                    <div className="course-card__mockup">
                      <div className="course-card__mockup-header">
                        <span />
                        <span />
                        <span />
                      </div>
                      <div className="course-card__mockup-body">
                        <div className="course-card__mockup-line course-card__mockup-line--wide" />
                        <div className="course-card__mockup-line" />
                        <div className="course-card__mockup-grid">
                          <span />
                          <span />
                          <span />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="course-card__body">
                    <h3>{mod.title}</h3>
                    <p>{mod.excerpt}</p>
                    <div className="course-card__meta">
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
                  <div className="course-card__footer">
                    <div className="course-card__teacher">
                      <span>Mentor</span>
                      <strong>{mentor.name}</strong>
                    </div>
                    <Link href={`/modul/${mod.slug}`}>
                      Detail
                      <ArrowRightIcon size={16} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section aria-label="Mentor lainnya">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Mentor Lainnya</p>
            <h2>Kenali mentor di jalur lain</h2>
          </div>
          <div className="mentor-grid">
            {MENTORS.filter((m) => m.slug !== mentor.slug).map((m) => (
              <Link href={`/mentor/${m.slug}`} className="mentor-card" key={m.slug}>
                <span className="mentor-card__avatar">{m.initials}</span>
                <h3>{m.name}</h3>
                <p className="mentor-card__role">{m.role}</p>
                <p className="mentor-card__headline">{m.headline}</p>
                <span className="mentor-card__cta">
                  Lihat profil
                  <ArrowRightIcon size={14} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section aria-label="Call to action">
          <div className="cta-banner">
            <div>
              <p className="eyebrow">Mulai Sekarang</p>
              <h2>Belajar langsung dari {mentor.name}</h2>
              <p className="lede" style={{ marginTop: 12 }}>
                Daftar sekarang untuk akses semua modul yang dibawakan {mentor.name} — plus seluruh
                jalur belajar di Senopati Academy.
              </p>
            </div>
            <div className="cta-banner__actions">
              <Link className="button button--accent" href="/mulai">
                Daftar Sekarang
                <ArrowRightIcon size={16} />
              </Link>
              <Link className="button button--ghost" href="/modul">
                Lihat Semua Modul
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
