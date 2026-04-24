import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  LevelIcon,
  SparklesIcon
} from "../../../_components/Icon";
import { ProgressRing } from "../../../_components/ProgressRing";
import {
  CATEGORIES,
  findCategory,
  findMentor,
  findModule,
  modulesByCategory,
  MODULES,
  type Module
} from "../../../../lib/content";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const mod = findModule(slug);
  return {
    title: `Modul Selesai · ${mod?.title ?? "Modul"}`,
    robots: { index: false, follow: false },
    alternates: { canonical: `/belajar/${slug}/selesai` }
  };
}

function pickRecommendations(current: Module): Module[] {
  const sameCategory = modulesByCategory(current.categorySlug).filter(
    (m) => m.slug !== current.slug
  );
  const ordered = sameCategory.slice(0, 2);

  const currentCategoryIdx = CATEGORIES.findIndex((c) => c.slug === current.categorySlug);
  const nextCategorySlug =
    CATEGORIES[(currentCategoryIdx + 1) % CATEGORIES.length]?.slug ?? CATEGORIES[0].slug;
  const nextCategoryModule = modulesByCategory(nextCategorySlug)[0];

  const remainingPool = MODULES.filter(
    (m) =>
      m.slug !== current.slug &&
      !ordered.some((o) => o.slug === m.slug) &&
      m.slug !== nextCategoryModule?.slug
  );

  const result = [...ordered];
  if (nextCategoryModule) result.push(nextCategoryModule);
  if (result.length < 3 && remainingPool[0]) result.push(remainingPool[0]);

  return result.slice(0, 3);
}

export default async function ModuleCompletePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mod = findModule(slug);
  if (!mod) notFound();

  const category = findCategory(mod.categorySlug);
  const mentor = findMentor(mod.mentorSlug);
  const recommendations = pickRecommendations(mod);

  return (
    <main className="academy-shell learning-shell">
      <div className="container">
        <nav className="detail-breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span>/</span>
          <Link href={`/belajar/${mod.slug}`}>{mod.title}</Link>
          <span>/</span>
          <span>Selesai</span>
        </nav>

        <section className="complete-hero" aria-label="Modul selesai">
          <div>
            <span className="complete-hero__badge">
              <SparklesIcon size={16} />
              Kamu baru saja menyelesaikan 1 modul
            </span>
            <h1>
              <span className="highlight-text">Selamat!</span> Satu langkah lebih dekat jadi generasi
              melek AI.
            </h1>
            <p className="lede">
              Modul <strong>{mod.title}</strong> resmi kamu selesaikan. Mentor {mentor?.name ?? "[NAMA_MENTOR]"} juga sudah notice progress kamu.
            </p>
            <div className="complete-hero__meta">
              <span>
                <CheckIcon size={14} /> Ujian lulus
              </span>
              <span>
                <CheckIcon size={14} /> Sertifikat tersedia
              </span>
              <span>
                <CheckIcon size={14} /> {category?.name ?? "Senopati"} — 1 dari {modulesByCategory(mod.categorySlug).length} modul
              </span>
            </div>
            <div className="complete-hero__actions">
              <Link
                className="button button--primary"
                href={`/belajar/${mod.slug}/sertifikat`}
              >
                Lihat Sertifikat
                <ArrowRightIcon size={16} />
              </Link>
              <Link className="button button--secondary" href={`/belajar/${mod.slug}/review`}>
                Beri Review
              </Link>
            </div>
          </div>
          <div className="complete-hero__visual">
            <ProgressRing value={100} size={200} label={category?.name ?? "Modul"} />
          </div>
        </section>

        <section aria-label="Rekomendasi lanjutan">
          <div className="section-heading">
            <p className="eyebrow eyebrow--brand">Langkah Selanjutnya</p>
            <h2>Tiga modul yang paling masuk akal diambil setelah {mod.title}</h2>
            <p>
              Dua dari jalur yang sama (untuk konsistensi) dan satu modul jembatan ke jalur
              berikutnya, biar kamu nggak kaget pindah track.
            </p>
          </div>
          <ol className="recommend-track">
            {recommendations.map((rec, idx) => {
              const recCat = findCategory(rec.categorySlug);
              const recMentor = findMentor(rec.mentorSlug);
              const isBridge = recCat && recCat.slug !== category?.slug;
              return (
                <li className="recommend-track__item" key={rec.slug}>
                  <span className="recommend-track__number">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="recommend-track__body">
                    <p className="eyebrow">
                      {recCat?.name}
                      {isBridge ? " · Jalur baru" : ""}
                    </p>
                    <h3>{rec.title}</h3>
                    <p>{rec.excerpt}</p>
                    <div className="recommend-track__meta">
                      <span>
                        <LevelIcon size={14} />
                        {rec.level}
                      </span>
                      <span>
                        <ClockIcon size={14} />
                        {rec.duration}
                      </span>
                      <span>{rec.topics} Topik</span>
                      {recMentor ? <span>Mentor: {recMentor.name}</span> : null}
                    </div>
                  </div>
                  <div className="recommend-track__actions">
                    <Link
                      className="button button--primary button--sm"
                      href={`/modul/${rec.slug}`}
                    >
                      Lihat Modul
                      <ArrowRightIcon size={14} />
                    </Link>
                    {recCat ? (
                      <Link
                        className="button button--ghost button--sm"
                        href={`/kategori/${recCat.slug}`}
                      >
                        Buka {recCat.name}
                      </Link>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section aria-label="Jalur lainnya">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Atau Eksplor Jalur Lain</p>
            <h2>Pilih jalur berikutnya berdasarkan mood belajarmu</h2>
          </div>
          <div className="category-grid category-grid--five">
            {CATEGORIES.map((c) => {
              const count = modulesByCategory(c.slug).length;
              const isCurrent = c.slug === category?.slug;
              return (
                <Link
                  href={`/kategori/${c.slug}`}
                  className={"category-card" + (isCurrent ? " category-card--current" : "")}
                  key={c.slug}
                >
                  <span className="category-card__icon">{c.name.charAt(0)}</span>
                  <h3>{c.name}</h3>
                  <p className="category-card__subtitle">{c.tagline}</p>
                  <p className="category-card__count">
                    {isCurrent ? `${count} Modul · Jalur ini` : `${count} Modul`}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <section aria-label="Milestone">
          <div className="next-steps">
            <div>
              <p className="eyebrow eyebrow--brand">Milestone</p>
              <h2>Apa yang sudah kamu raih sejauh ini</h2>
            </div>
            <ul>
              <li>
                <strong>1 modul selesai</strong>
                <p>Terus konsisten, 25 modul bisa dituntaskan dalam 4-6 bulan dengan pace santai.</p>
                <Link className="button button--secondary button--sm" href="/progress">
                  Lihat Progress
                </Link>
              </li>
              <li>
                <strong>Mentor tersedia 24/7</strong>
                <p>
                  Di setiap modul, mentor siap jawab pertanyaanmu. Jangan sungkan tanya — mereka
                  juga senang punya sparring partner.
                </p>
              </li>
              <li>
                <strong>Badge baru</strong>
                <p>
                  Cek halaman Progress untuk lihat badge yang baru saja kamu raih dari modul ini.
                </p>
                <Link className="button button--secondary button--sm" href="/progress">
                  Buka Badge
                </Link>
              </li>
            </ul>
          </div>
        </section>

        <section aria-label="Call to action">
          <div className="cta-banner">
            <div>
              <p className="eyebrow">Jaga Momentum</p>
              <h2>Satu hari jeda boleh, dua hari bisa. Lebih dari itu, kita yang ingetin.</h2>
              <p className="lede" style={{ marginTop: 12 }}>
                Aktifkan reminder harian di pengaturan dashboard — supaya progress belajar nggak
                berhenti di tengah jalan.
              </p>
            </div>
            <div className="cta-banner__actions">
              <Link className="button button--accent" href="/dashboard">
                Kembali ke Dashboard
                <ArrowRightIcon size={16} />
              </Link>
              <Link className="button button--ghost" href="/modul">
                Jelajahi Katalog
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
