import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon, ClockIcon, SparklesIcon } from "../_components/Icon";
import { ProgressRing } from "../_components/ProgressRing";
import {
  ACHIEVEMENTS,
  ACTIVE_MODULES,
  CATEGORY_PROGRESS,
  DASHBOARD_STATS,
  findCategory,
  findModule,
  MODULES
} from "../../lib/content";
import { getMyActiveModules, getLearnerStats } from "../../lib/progress-server";

export const metadata: Metadata = {
  title: "Progress Belajar",
  description:
    "Visualisasi kemajuan belajar kamu di Senopati Academy — per kategori, milestone, dan aktivitas mingguan.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/progress" }
};

const MAX_MINUTES = Math.max(...DASHBOARD_STATS.weeklyMinutes.map((d) => d.minutes), 60);

export default async function ProgressPage() {
  // Real data dari DB (kalau user sudah belajar), fallback ke sample statis untuk preview.
  const [myActive, stats] = await Promise.all([getMyActiveModules(), getLearnerStats()]);
  const hasRealProgress = myActive.length > 0;

  const sessionsCompleted = hasRealProgress
    ? stats.sessionsCompleted
    : DASHBOARD_STATS.sessionsCompleted;
  const totalSessions = hasRealProgress ? stats.totalSessions : DASHBOARD_STATS.totalSessions;
  const overall = totalSessions === 0 ? 0 : Math.round((sessionsCompleted / totalSessions) * 100);

  const activeModules = hasRealProgress ? myActive : ACTIVE_MODULES;
  const earned = ACHIEVEMENTS.filter((a) => a.status === "earned").length;
  const inProgress = ACHIEVEMENTS.filter((a) => a.status === "in-progress").length;

  return (
    <main className="academy-shell">
      <div className="container">
        <section className="progress-hero" aria-label="Ringkasan progress">
          <div>
            <p className="eyebrow eyebrow--brand">Progress Belajar</p>
            <h1>
              Kamu sudah di <span className="highlight-text">{overall}% perjalanan</span>.
            </h1>
            <p className="lede">
              {hasRealProgress
                ? "Ringkasan ini update otomatis setiap kamu menyelesaikan sesi, kuis, atau tugas."
                : "Belum ada progress tercatat — angka di bawah adalah contoh visual. Mulai modul pertamamu untuk mengisinya."}
            </p>
            <div className="progress-hero__quick">
              <div>
                <strong>{sessionsCompleted}</strong>
                <span>Sesi selesai</span>
              </div>
              <div>
                <strong>{hasRealProgress ? stats.modulesCompleted : DASHBOARD_STATS.hoursLearned + "j"}</strong>
                <span>{hasRealProgress ? "Modul selesai" : "Total waktu belajar"}</span>
              </div>
              <div>
                <strong>{hasRealProgress ? stats.modulesStarted : DASHBOARD_STATS.currentStreak}</strong>
                <span>{hasRealProgress ? "Modul dimulai" : "Hari streak"}</span>
              </div>
              <div>
                <strong>{hasRealProgress ? stats.certificatesEarned : earned}</strong>
                <span>{hasRealProgress ? "Sertifikat" : "Badge diraih"}</span>
              </div>
            </div>
          </div>
          <ProgressRing value={overall} size={180} label="Overall progress" />
        </section>

        <section aria-label="Progress kategori">
          <div className="section-heading">
            <p className="eyebrow">Per Kategori</p>
            <h2>Progress berdasarkan jalur belajar</h2>
          </div>
          <div className="category-progress-grid">
            {CATEGORY_PROGRESS.map((entry) => {
              const category = findCategory(entry.slug);
              const totalInCategory = MODULES.filter((m) => m.categorySlug === entry.slug).length;
              if (!category) return null;
              return (
                <article
                  key={entry.slug}
                  className={`category-progress-card category-progress-card--${category.accent}`}
                >
                  <div className="category-progress-card__head">
                    <p className="eyebrow">{category.name}</p>
                    <strong>{entry.percent}%</strong>
                  </div>
                  <p>{category.tagline}</p>
                  <div className="active-progress-bar" aria-hidden="true">
                    <span style={{ width: `${entry.percent}%` }} />
                  </div>
                  <div className="category-progress-card__footer">
                    <span>{Math.round((entry.percent / 100) * totalInCategory)}/{totalInCategory} modul</span>
                    <Link href={`/kategori/${category.slug}`}>
                      Buka
                      <ArrowRightIcon size={14} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section aria-label="Modul aktif">
          <div className="section-heading">
            <p className="eyebrow eyebrow--brand">Modul Aktif</p>
            <h2>Rincian progress per modul yang sedang dikerjakan</h2>
          </div>
          <ul className="progress-modules">
            {activeModules.map((active) => {
              const mod = findModule(active.moduleSlug);
              const category = mod ? findCategory(mod.categorySlug) : null;
              if (!mod) return null;
              return (
                <li key={active.moduleSlug} className="progress-module-row">
                  <div>
                    <p className="eyebrow">{category?.name}</p>
                    <h3>{mod.title}</h3>
                    <p className="progress-module-row__sub">{active.nextSession}</p>
                  </div>
                  <div className="progress-module-row__bar">
                    <span>{active.completed}/{active.total} sesi</span>
                    <div className="active-progress-bar" aria-hidden="true">
                      <span style={{ width: `${active.percent}%` }} />
                    </div>
                    <small>Estimasi selesai {active.estimatedFinish}</small>
                  </div>
                  <Link
                    className="button button--secondary button--sm"
                    href={`/belajar/${active.moduleSlug}`}
                  >
                    Buka Modul
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-label="Aktivitas mingguan">
          <div className="activity-card">
            <div>
              <p className="eyebrow">Aktivitas Mingguan</p>
              <h2>Menit belajar 7 hari terakhir</h2>
              <p style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.65 }}>
                Tidak perlu setiap hari — yang penting konsisten. Target sehat ~30 menit per hari
                untuk progression nyaman.
              </p>
            </div>
            <div className="activity-chart" role="img" aria-label="Grafik menit belajar per hari">
              {DASHBOARD_STATS.weeklyMinutes.map((day) => {
                const height = day.minutes === 0 ? 4 : (day.minutes / MAX_MINUTES) * 100;
                return (
                  <div key={day.day} className="activity-chart__col">
                    <span
                      className="activity-chart__bar"
                      style={{ height: `${height}%` }}
                    >
                      <span>{day.minutes}m</span>
                    </span>
                    <small>{day.day}</small>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section aria-label="Badge & milestone">
          <div className="section-heading">
            <p className="eyebrow eyebrow--brand">Badge & Milestone</p>
            <h2>
              {earned} badge diraih, {inProgress} sedang berjalan
            </h2>
          </div>
          <div className="achievement-grid">
            {ACHIEVEMENTS.map((item) => (
              <article
                key={item.slug}
                className={`achievement-card achievement-card--${item.status}`}
              >
                <span className="achievement-card__icon">
                  {item.status === "earned" ? (
                    <CheckIcon size={20} />
                  ) : item.status === "in-progress" ? (
                    <SparklesIcon size={20} />
                  ) : (
                    <ClockIcon size={20} />
                  )}
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                  {item.progress ? <small>{item.progress}</small> : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-label="Call to action">
          <div className="cta-banner">
            <div>
              <p className="eyebrow">Next Step</p>
              <h2>Jaga momentum — satu sesi pendek pun dihitung.</h2>
              <p className="lede" style={{ marginTop: 12 }}>
                Konsistensi ngalahin kecepatan. Lanjutkan modul aktif kamu, atau eksplor modul baru
                kalau butuh suasana berbeda.
              </p>
            </div>
            <div className="cta-banner__actions">
              <Link className="button button--accent" href="/dashboard">
                Kembali ke Dashboard
                <ArrowRightIcon size={16} />
              </Link>
              <Link className="button button--ghost" href="/modul">
                Jelajahi Modul
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
