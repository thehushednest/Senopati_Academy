import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, ClockIcon, LevelIcon, SparklesIcon } from "../../_components/Icon";
import { OnboardingSteps } from "../../_components/OnboardingSteps";
import {
  findCategory,
  findMentor,
  MODULES,
  modulesByCategory,
  type Module
} from "../../../lib/content";

export const metadata: Metadata = {
  title: "Rekomendasi Modul — Onboarding",
  description:
    "Tiga modul awal yang paling cocok untukmu, disusun berdasarkan profil belajar yang barusan kamu isi.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/onboarding/rekomendasi" }
};

const ROLE_LABEL: Record<string, string> = {
  smp: "Pelajar SMP",
  sma: "Pelajar SMA",
  kuliah: "Mahasiswa",
  guru: "Guru / Fasilitator",
  umum: "Umum"
};

const GOAL_LABEL: Record<string, string> = {
  "paham-dasar": "Paham dasar AI",
  "tugas-sekolah": "Pakai AI untuk tugas sekolah",
  produktivitas: "Tingkatkan produktivitas harian",
  "bikin-tools": "Bikin tools AI sendiri",
  "ajarin-orang": "Ajarin AI ke orang lain",
  "karir-ai": "Siapkan karir di AI"
};

const TIME_LABEL: Record<string, string> = {
  singkat: "< 2 jam / minggu",
  sedang: "2 — 5 jam / minggu",
  banyak: "5+ jam / minggu"
};

const GOAL_CATEGORY_BIAS: Record<string, string> = {
  "paham-dasar": "foundations",
  "tugas-sekolah": "praktis",
  produktivitas: "praktis",
  "bikin-tools": "advanced-dev",
  "ajarin-orang": "teaching-training",
  "karir-ai": "advanced-dev"
};

function buildRecommendation(params: {
  interests: string[];
  goal?: string;
  time?: string;
}): Module[] {
  const { interests, goal, time } = params;
  const biasCategory = goal ? GOAL_CATEGORY_BIAS[goal] : undefined;

  const priorityCategories = Array.from(
    new Set([biasCategory, ...interests].filter(Boolean) as string[])
  );

  const picked: Module[] = [];
  const seen = new Set<string>();

  for (const catSlug of priorityCategories) {
    const catModules = modulesByCategory(catSlug);
    for (const mod of catModules) {
      if (!seen.has(mod.slug)) {
        picked.push(mod);
        seen.add(mod.slug);
      }
      if (picked.length >= 3) break;
    }
    if (picked.length >= 3) break;
  }

  if (picked.length < 3) {
    for (const mod of MODULES) {
      if (!seen.has(mod.slug)) {
        picked.push(mod);
        seen.add(mod.slug);
      }
      if (picked.length >= 3) break;
    }
  }

  if (time === "singkat") {
    return picked.slice(0, 2).concat(picked.slice(2, 3));
  }

  return picked;
}

export default async function OnboardingRecommendationPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;

  const name = typeof query.nama === "string" ? query.nama : "";
  const role = typeof query.peran === "string" ? query.peran : undefined;
  const goal = typeof query.tujuan === "string" ? query.tujuan : undefined;
  const time = typeof query.waktu === "string" ? query.waktu : undefined;
  const interestsRaw = typeof query.minat === "string" ? query.minat : "";
  const interests = interestsRaw ? interestsRaw.split(",").filter(Boolean) : [];

  const hasProfile = Boolean(role && goal && time && interests.length > 0);

  const recommendations = hasProfile
    ? buildRecommendation({ interests, goal, time })
    : MODULES.slice(0, 3);

  const displayName = name || "kamu";
  const primaryCategory = interests[0] ? findCategory(interests[0]) : null;

  return (
    <main className="academy-shell onboarding-shell">
      <div className="container">
        <OnboardingSteps current={3} />

        <section className="onboarding-hero onboarding-hero--compact" aria-label="Rekomendasi modul">
          <div className="onboarding-hero__badge">
            <SparklesIcon size={18} />
            <span>Rekomendasi untuk {displayName}</span>
          </div>
          <h1>
            Tiga modul awal yang <span className="highlight-text">paling pas</span> buat kamu.
          </h1>
          <p className="lede">
            Disusun berdasarkan profil yang barusan kamu isi. Mulai dari paling atas — tapi bebas
            juga kalau mau loncat.
          </p>
        </section>

        {hasProfile ? (
          <section aria-label="Ringkasan profil">
            <div className="profile-summary">
              <div>
                <p className="eyebrow">Ringkasan Profil</p>
                <h2>Begini yang kami tangkap dari jawabanmu</h2>
              </div>
              <dl className="profile-summary__list">
                {role ? (
                  <div>
                    <dt>Peran</dt>
                    <dd>{ROLE_LABEL[role] ?? role}</dd>
                  </div>
                ) : null}
                {goal ? (
                  <div>
                    <dt>Tujuan utama</dt>
                    <dd>{GOAL_LABEL[goal] ?? goal}</dd>
                  </div>
                ) : null}
                {time ? (
                  <div>
                    <dt>Waktu belajar</dt>
                    <dd>{TIME_LABEL[time] ?? time}</dd>
                  </div>
                ) : null}
                {interests.length ? (
                  <div>
                    <dt>Minat kategori</dt>
                    <dd>
                      {interests
                        .map((slug) => findCategory(slug)?.name ?? slug)
                        .join(", ")}
                    </dd>
                  </div>
                ) : null}
              </dl>
              <Link
                className="button button--secondary button--sm"
                href="/onboarding/profil"
                style={{ marginTop: 18 }}
              >
                Ubah profil
              </Link>
            </div>
          </section>
        ) : (
          <section>
            <div className="onboarding-empty">
              <p>
                Belum ada profil yang terbaca. Kembali ke{" "}
                <Link href="/onboarding/profil">halaman setup profil</Link> dan isi formnya dulu
                untuk dapat rekomendasi yang lebih personal.
              </p>
            </div>
          </section>
        )}

        <section aria-label="Rekomendasi modul">
          <div className="section-heading">
            <p className="eyebrow eyebrow--brand">Rekomendasi</p>
            <h2>Tiga modul awal yang disarankan</h2>
          </div>
          <ol className="recommend-track">
            {recommendations.map((mod, idx) => {
              const category = findCategory(mod.categorySlug);
              const mentor = findMentor(mod.mentorSlug);
              return (
                <li className="recommend-track__item" key={mod.slug}>
                  <span className="recommend-track__number">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="recommend-track__body">
                    <p className="eyebrow">{category?.name}</p>
                    <h3>{mod.title}</h3>
                    <p>{mod.excerpt}</p>
                    <div className="recommend-track__meta">
                      <span>
                        <LevelIcon size={14} />
                        {mod.level}
                      </span>
                      <span>
                        <ClockIcon size={14} />
                        {mod.duration}
                      </span>
                      <span>{mod.topics} Topik</span>
                      {mentor ? <span>Mentor: {mentor.name}</span> : null}
                    </div>
                  </div>
                  <div className="recommend-track__actions">
                    <Link
                      className="button button--primary button--sm"
                      href={`/modul/${mod.slug}`}
                    >
                      Lihat Modul
                      <ArrowRightIcon size={14} />
                    </Link>
                    {category ? (
                      <Link
                        className="button button--ghost button--sm"
                        href={`/kategori/${category.slug}`}
                      >
                        Jelajahi {category.name}
                      </Link>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section aria-label="Langkah berikutnya">
          <div className="next-steps">
            <div>
              <p className="eyebrow">Langkah Berikutnya</p>
              <h2>Setelah rekomendasi ini, ada 3 pilihan yang bisa kamu ambil.</h2>
            </div>
            <ul>
              <li>
                <strong>Mulai dari modul pertama</strong>
                <p>Ikuti urutan rekomendasi untuk progression paling natural.</p>
                <Link
                  className="button button--secondary button--sm"
                  href={recommendations[0] ? `/modul/${recommendations[0].slug}` : "/modul"}
                >
                  Mulai Modul #01
                </Link>
              </li>
              <li>
                <strong>Eksplorasi kategori</strong>
                <p>Lihat semua modul di satu jalur dan pilih sendiri urutannya.</p>
                <Link
                  className="button button--secondary button--sm"
                  href={primaryCategory ? `/kategori/${primaryCategory.slug}` : "/modul"}
                >
                  {primaryCategory
                    ? `Kategori ${primaryCategory.name}`
                    : "Lihat semua kategori"}
                </Link>
              </li>
              <li>
                <strong>Lihat katalog lengkap</strong>
                <p>Mau lihat semua 25 modul dulu sebelum mulai? Bisa juga.</p>
                <Link className="button button--secondary button--sm" href="/modul">
                  Lihat Katalog
                </Link>
              </li>
            </ul>
          </div>
        </section>

        <section aria-label="Call to action">
          <div className="cta-banner">
            <div>
              <p className="eyebrow">Onboarding Selesai</p>
              <h2>Selesai sampai di sini — siap mulai belajar?</h2>
              <p className="lede" style={{ marginTop: 12 }}>
                Kamu bisa balik ke halaman ini kapan saja dari dashboard. Rekomendasi akan
                ter-update otomatis saat kamu menyelesaikan modul.
              </p>
            </div>
            <div className="cta-banner__actions">
              <Link
                className="button button--accent"
                href={recommendations[0] ? `/modul/${recommendations[0].slug}` : "/modul"}
              >
                Mulai Modul Pertama
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
