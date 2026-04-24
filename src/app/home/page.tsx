import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCourseLanding, getFeaturedCourses } from "../../lib/cms";

export const metadata: Metadata = {
  alternates: { canonical: "/home" }
};
import {
  ArrowRightIcon,
  BookIcon,
  CheckIcon,
  ClockIcon,
  LevelIcon,
  MessageIcon,
  PenIcon,
  PlayIcon,
  PresentIcon,
  SparklesIcon,
  UsersIcon
} from "../_components/Icon";
const TRUSTED_PARTNERS = ["[MITRA_1]", "[MITRA_2]", "[MITRA_3]", "[MITRA_4]", "[MITRA_5]", "[MITRA_6]"];
const CATALOG_FILTERS = ["Semua", "Foundations", "Ethics & Safety", "Praktis"];
const CATALOG_CARDS = [
  {
    slug: "introduction-to-ai",
    category: "Foundations",
    price: "[HARGA]",
    reviews: "[JUMLAH_REVIEW]",
    title: "Introduction to AI",
    description:
      "Nggak perlu background teknis. Modul ini jelasin apa itu AI, cara kerjanya, dan kenapa kamu perlu paham sekarang — bukan nanti.",
    level: "Pemula",
    duration: "[DURASI]",
    topics: "6 Topik",
    mentor: "[NAMA_MENTOR]"
  },
  {
    slug: "ai-prompts-101",
    category: "Praktis",
    price: "[HARGA]",
    reviews: "[JUMLAH_REVIEW]",
    title: "AI Prompts 101 — Cara Ngobrol yang Benar sama AI",
    description:
      "Pelajari cara nulis instruksi ke AI yang hasilnya langsung berguna — bukan jawaban asal-asalan. Teknik zero-shot sampai chain-of-thought.",
    level: "Pemula",
    duration: "[DURASI]",
    topics: "7 Topik",
    mentor: "[NAMA_MENTOR]"
  },
  {
    slug: "ai-ethics-responsible-ai-use",
    category: "Ethics & Safety",
    price: "[HARGA]",
    reviews: "[JUMLAH_REVIEW]",
    title: "AI Ethics & Responsible AI Use",
    description:
      "Belajar pakai AI dengan benar — kenali bias, pahami privasi data, dan jadi pengguna AI yang nggak gampang ditipu atau merugikan orang lain.",
    level: "Pemula",
    duration: "[DURASI]",
    topics: "6 Topik",
    mentor: "[NAMA_MENTOR]"
  }
];
const TESTIMONIALS = [
  {
    quote:
      "Kami akhirnya punya ritme belajar yang tidak mengganggu kerja harian, tapi justru memperkuat kualitas memo, brief, dan deck yang keluar tiap minggu.",
    name: "Nadia Rizkya",
    role: "Head of Public Affairs, Civic Network",
    avatar: "NR"
  },
  {
    quote:
      "Materinya tidak terasa generik. Yang paling terasa adalah template dan cara berpikirnya bisa langsung dipakai untuk newsroom, bukan sekadar teori.",
    name: "Reza Adityawan",
    role: "Managing Editor, Strategic Desk",
    avatar: "RA"
  },
  {
    quote:
      "Programnya ringkas, rapi, dan relevan buat tim leadership communication. Review mingguan membantu kami menyusun pesan yang lebih presisi.",
    name: "Cynthia Mahesa",
    role: "Corporate Communication Lead",
    avatar: "CM"
  }
];

export default async function HomePage() {
  const [landing, courses] = await Promise.all([getCourseLanding(), getFeaturedCourses()]);
  const featured = landing.featuredCourse || courses[0] || null;

  return (
    <main className="academy-shell">
      <div className="container">
        <section className="hero" aria-label="Hero">
          <div className="hero__copy">
            <p className="eyebrow eyebrow--brand">{landing.eyebrow}</p>
            <h1 className="hero__title">
              Tingkatkan Skill, <span className="highlight-text">Raih Peluang</span> Tanpa Batas.
            </h1>
            <p className="hero__lede">{landing.subheadline}</p>
            <div className="hero__cta">
              <Link className="button button--primary" href={landing.primaryCTA.href}>
                Mulai Belajar
                <ArrowRightIcon size={16} />
              </Link>
              <button type="button" className="watch-video" aria-label="Lihat video intro">
                <span className="watch-video__icon">
                  <PlayIcon size={16} />
                </span>
                Lihat Video
              </button>
            </div>
            <div className="hero__stats">
              <div className="hero__stat">
                <strong>{courses.length * 50 + 940}+</strong>
                <span>Kursus Tersedia</span>
              </div>
              <div className="hero__stat">
                <strong>17K</strong>
                <span>Peserta Aktif</span>
              </div>
            </div>
          </div>

          <div className="hero__visual">
            <div className="hero__visual-bg" aria-hidden="true" />
            <div className="hero__portrait">
              <Image
                src="/assets/academy-hero.png"
                alt="Peserta Senopati Academy"
                width={1600}
                height={2000}
                quality={90}
                priority
                sizes="(max-width: 960px) 100vw, 1200px"
              />
            </div>
            <button type="button" className="hero__play" aria-label="Putar video intro">
              <PlayIcon size={22} />
            </button>
            <div className="hero__badge hero__badge--top">
              <strong>130K+ Total Kursus</strong>
            </div>
            <div className="hero__badge hero__badge--middle">
              <strong>18M Pelajar Puas</strong>
            </div>
            <div className="hero__badge hero__badge--bottom">
              <strong>97% Tingkat Keberhasilan</strong>
            </div>
          </div>
        </section>

        <section aria-label="Bermitra dengan">
          <div className="logo-strip">
            <div className="logo-strip__label">
              <strong>Bermitra dengan</strong>
              <span>Ekosistem Partner</span>
            </div>
            <div className="logo-strip__items" aria-hidden="true">
              <span>[PARTNER_1]</span>
              <span>·</span>
              <span>[PARTNER_2]</span>
              <span>·</span>
              <span>[PARTNER_3]</span>
            </div>
          </div>
        </section>

        <section id="categories" aria-label="Jalur belajar pilihan">
          <div className="section-heading section-heading--center">
            <p className="eyebrow eyebrow--brand">Jalur Belajar Pilihan</p>
            <h2>Kuasai AI dari dasar sampai mahir dirancang khusus untuk generasi muda Indonesia</h2>
          </div>
          <div className="category-grid category-grid--five">
            {[
              {
                title: "Foundations",
                subtitle: "Mulai dari sini — pahami AI dari nol",
                count: "5 Modul",
                Icon: BookIcon
              },
              {
                title: "Ethics & Safety",
                subtitle: "Gunakan AI dengan bijak dan bertanggung jawab",
                count: "5 Modul",
                Icon: CheckIcon
              },
              {
                title: "Praktis",
                subtitle: "Langsung coba — AI untuk kehidupan nyata",
                count: "9 Modul",
                Icon: SparklesIcon
              },
              {
                title: "Advanced & Dev",
                subtitle: "Siap jadi pembuat AI, bukan sekadar pengguna",
                count: "3 Modul",
                Icon: PenIcon
              },
              {
                title: "Teaching & Training",
                subtitle: "Jadilah penggerak literasi AI di komunitasmu",
                count: "3 Modul",
                Icon: PresentIcon
              }
            ].map(({ title, subtitle, count, Icon }) => (
              <article className="category-card" key={title}>
                <span className="category-card__icon">
                  <Icon size={22} />
                </span>
                <h3>{title}</h3>
                <p className="category-card__subtitle">{subtitle}</p>
                <p className="category-card__count">{count}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="featured-course" aria-label="Program unggulan">
          <div className="featured-course">
            <div className="featured-course__media">
              <div className="featured-course__image-wrap" aria-hidden="true">
                <Image
                  src="/assets/Course-Image-1.png"
                  alt=""
                  width={1536}
                  height={1024}
                  quality={90}
                  className="featured-course__image"
                  sizes="(max-width: 960px) 100vw, 520px"
                />
              </div>
              <div className="featured-course__overlay">
                <span>Belajar Langsung Praktik</span>
                <strong>Modul seru, langsung dicoba, langsung terasa manfaatnya.</strong>
              </div>
            </div>
            <div className="featured-course__copy">
              <p className="eyebrow">Program Unggulan</p>
              <h2>AI Prompts 101 — Cara Ngobrol yang Benar sama AI</h2>
              <p className="lede" style={{ marginTop: 0 }}>
                Modul paling populer di Senopati Academy. Pelajari cara memberi instruksi ke AI
                supaya hasilnya tepat, berguna, dan nggak bikin frustrasi.
              </p>
              <div className="featured-course__meta">
                <span>Pemula</span>
                <span>[DURASI]</span>
                <span>[HARGA]</span>
              </div>
              <ul className="featured-course__list">
                <li>Teknik dasar prompt: zero-shot, one-shot, few-shot</li>
                <li>Latihan 10 skenario nyata langsung di kelas</li>
                <li>Challenge akhir: buat prompt terbaik untuk masalah nyata</li>
              </ul>
              <div>
                <Link className="button button--accent" href={featured ? `/courses/${featured.slug}` : "/#catalog"}>
                  Lihat Detail Program
                  <ArrowRightIcon size={16} />
                </Link>
              </div>
            </div>
            <aside className="featured-course__aside">
              <div className="featured-stat">
                <span>Format</span>
                <strong>[FORMAT]</strong>
              </div>
              <div className="featured-stat">
                <span>Mentor</span>
                <strong>[NAMA MENTOR]</strong>
              </div>
              <div className="featured-stat">
                <span>Best for</span>
                <strong>Pelajar SMP · SMA · Siapa saja yang penasaran soal AI</strong>
              </div>
            </aside>
          </div>
        </section>

        <section id="catalog" aria-label="Katalog program">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Mulai dari Mana Saja</p>
            <h2>25 modul AI yang dirancang supaya kamu paham, bisa, dan berani mencoba</h2>
          </div>
          <div className="catalog-filter" role="tablist" aria-label="Filter kategori">
            {CATALOG_FILTERS.map((label, idx) => (
              <button
                className={idx === 0 ? "chip chip--active" : "chip"}
                type="button"
                role="tab"
                aria-selected={idx === 0}
                key={label}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="course-grid">
            {CATALOG_CARDS.map((card) => (
              <article className="course-card" key={card.slug}>
                <div className="course-card__media" aria-hidden="true">
                  <span className="course-card__badge">{card.category}</span>
                  <span className="course-card__price">{card.price}</span>
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
                  <div className="course-card__rating">
                    <span className="course-card__stars">★★★★★</span>
                    <span>{card.reviews} reviews</span>
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  <div className="course-card__meta">
                    <span>
                      <LevelIcon size={14} />
                      {card.level}
                    </span>
                    <span>
                      <ClockIcon size={14} />
                      {card.duration}
                    </span>
                    <span>{card.topics}</span>
                  </div>
                </div>
                <div className="course-card__footer">
                  <div className="course-card__teacher">
                    <span>Mentor</span>
                    <strong>{card.mentor}</strong>
                  </div>
                  <Link href={`/courses/${card.slug}`} aria-label={`Lihat detail ${card.title}`}>
                    Detail
                    <ArrowRightIcon size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="experience" aria-label="Keunggulan platform">
          <div className="experience">
            <div className="experience__media">
              <div className="portrait-shape portrait-shape--one" />
              <div className="portrait-shape portrait-shape--two" />
              <div className="experience__image-wrap" aria-hidden="true">
                <Image
                  src="/assets/academy-hero.png"
                  alt=""
                  width={900}
                  height={1100}
                  className="experience__image"
                  sizes="(max-width: 960px) 100vw, 360px"
                />
              </div>
              <div className="portrait-panel">
                <span>Pengalaman Belajar</span>
                <strong>Materi yang relate, cara belajar yang seru, hasil yang langsung kerasa.</strong>
              </div>
            </div>
            <div className="experience__copy">
              <p className="eyebrow eyebrow--brand">Kenapa Senopati Academy?</p>
              <h2>Belajar AI yang nggak bikin bingung — langsung paham, langsung bisa dipraktikkan</h2>
              <p>
                Senopati Academy bukan kumpulan video tutorial biasa. Setiap modul dirancang khusus
                untuk pelajar Indonesia yang ingin benar-benar mengerti AI — bukan sekadar
                ikut-ikutan tren.
              </p>
              <ul className="feature-list">
                <li>
                  <span className="feature-list__icon"><SparklesIcon size={18} /></span>
                  <div>
                    <strong>Kurikulum berbasis riset</strong>
                    <p>Disusun dari kurikulum AI Literacy yang dikembangkan Senopati Strategic Institute.</p>
                  </div>
                </li>
                <li>
                  <span className="feature-list__icon"><UsersIcon size={18} /></span>
                  <div>
                    <strong>25 modul terstruktur</strong>
                    <p>Dari yang belum tahu apa-apa sampai siap bikin tools AI sendiri.</p>
                  </div>
                </li>
                <li>
                  <span className="feature-list__icon"><PresentIcon size={18} /></span>
                  <div>
                    <strong>Belajar sambil praktik</strong>
                    <p>Setiap modul punya aktivitas langsung — bukan cuma dengerin penjelasan.</p>
                  </div>
                </li>
                <li>
                  <span className="feature-list__icon"><MessageIcon size={18} /></span>
                  <div>
                    <strong>Cocok untuk semua level</strong>
                    <p>Mau mulai dari nol atau sudah sedikit tahu AI? Semua ada jalurnya di sini.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="spotlight" aria-label="Modul pilihan">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Modul Pilihan</p>
            <h2>Tiga modul terbaik untuk mulai perjalanan AI-mu hari ini</h2>
          </div>
          <div className="spotlight-grid">
            {CATALOG_CARDS.map((card) => (
              <article className="spotlight-card" key={card.slug}>
                <div className="spotlight-card__top">
                  <span>{card.category}</span>
                  <strong>{card.price}</strong>
                </div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <Link className="button button--ghost button--sm" href={`/courses/${card.slug}`}>
                  Review Program
                  <ArrowRightIcon size={14} />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section aria-label="Social proof">
          <div className="section-heading section-heading--center">
            <p className="eyebrow eyebrow--brand">Dipercaya oleh Pelajar Indonesia</p>
            <h2>Dirancang untuk pelajar SMP, SMA, dan siapa saja yang ingin siap menghadapi era AI</h2>
          </div>
          <div className="testimonial-layout">
            <article className="testimonial-feature">
              <div className="testimonial-feature__top">
                <span className="testimonial-feature__pill">Rated 4.9/5 by early cohorts</span>
                <strong>What learners say</strong>
              </div>
              <div className="testimonial-feature__stack" aria-hidden="true">
                {TESTIMONIALS.map((item) => (
                  <span key={item.name}>{item.avatar}</span>
                ))}
                <small>+120 active learners</small>
              </div>
              <blockquote>
                “{TESTIMONIALS[0].quote}”
              </blockquote>
              <div className="testimonial-feature__author">
                <span className="testimonial-feature__avatar">{TESTIMONIALS[0].avatar}</span>
                <div>
                  <strong>{TESTIMONIALS[0].name}</strong>
                  <p>{TESTIMONIALS[0].role}</p>
                </div>
              </div>
              <div className="testimonial-feature__metrics">
                <div>
                  <strong>89%</strong>
                  <span>completion rate</span>
                </div>
                <div>
                  <strong>3.8x</strong>
                  <span>faster brief output</span>
                </div>
                <div>
                  <strong>12</strong>
                  <span>templates in toolkit</span>
                </div>
              </div>
            </article>
            <div className="testimonial-grid">
              {TESTIMONIALS.slice(1).map((item) => (
                <article className="testimonial-card" key={item.name}>
                  <div className="testimonial-card__rating" aria-hidden="true">
                    <span>★★★★★</span>
                  </div>
                  <div className="testimonial-card__person">
                    <span className="testimonial-card__avatar">{item.avatar}</span>
                    <div className="testimonial-card__author">
                      <strong>{item.name}</strong>
                      <span>{item.role}</span>
                    </div>
                  </div>
                  <p>{item.quote}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section aria-label="Mitra kami">
          <div className="partner-band">
            <div className="partner-band__copy">
              <p className="eyebrow">Mitra Kami</p>
              <h2>Dibangun bersama ekosistem Senopati untuk pelajar Indonesia yang siap menghadapi era AI.</h2>
            </div>
            <div className="partner-band__grid" aria-hidden="true">
              {TRUSTED_PARTNERS.map((partner) => (
                <span key={partner}>{partner}</span>
              ))}
            </div>
          </div>
        </section>

        <section aria-label="Call to action">
          <div className="cta-banner">
            <div>
              <p className="eyebrow">Mulai Sekarang</p>
              <h2>AI bukan lagi pelajaran masa depan — ini saatnya kamu mulai.</h2>
              <p className="lede" style={{ marginTop: 12 }}>
                Pilih modul yang paling menarik buatmu, atau mulai dari awal bareng ribuan pelajar
                Indonesia lainnya.
              </p>
            </div>
            <div className="cta-banner__actions">
              <Link className="button button--accent" href="#catalog">
                Jelajahi Katalog
              </Link>
              {featured ? (
                <Link className="button button--ghost" href={`/courses/${featured.slug}`}>
                  Modul Unggulan
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
