import type { Metadata } from "next";
import Link from "next/link";
import { DashboardRightBar } from "../../_components/DashboardRightBar";
import { DashboardSidebar } from "../../_components/DashboardSidebar";
import { DashboardTopbar } from "../../_components/DashboardTopbar";
import { ArrowRightIcon, BookIcon } from "../../_components/Icon";
import { CATEGORIES, MENTORS, MODULES, modulesByCategory, modulesByMentor } from "../../../lib/content";
import { prisma } from "../../../lib/prisma";

export const metadata: Metadata = {
  title: "Admin · Konten",
  robots: { index: false, follow: false },
  alternates: { canonical: "/admin/konten" },
};

export const dynamic = "force-dynamic";

export default async function AdminKontenPage() {
  // Stat content statis (dari content.ts)
  const categoryCount = CATEGORIES.length;
  const moduleCount = MODULES.length;
  const mentorCount = MENTORS.length;

  // Engagement per modul (dari DB) — top 5 modul paling banyak dipelajari
  const topModules = await prisma.moduleProgress.groupBy({
    by: ["moduleSlug"],
    _count: { _all: true },
    orderBy: { _count: { moduleSlug: "desc" } },
    take: 5,
  });

  return (
    <main className="academy-shell dashboard-shell">
      <div className="container dashboard-app">
        <DashboardSidebar />

        <section className="dashboard-app__main" aria-label="Admin konten">
          <DashboardTopbar placeholder="Cari modul / mentor" />

          <header className="dashboard-page-header">
            <div>
              <p className="eyebrow eyebrow--brand">Admin · Konten</p>
              <h1>Ringkasan konten platform</h1>
              <p>
                {moduleCount} modul tersebar di {categoryCount} kategori · {mentorCount} mentor. Konten saat ini
                masih disimpan di <code>src/lib/content.ts</code> (statis). Migrasi ke CMS adalah pekerjaan tim
                kurikulum.
              </p>
            </div>
          </header>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Per Kategori</h2>
            </header>
            <div className="lp-benefit-grid">
              {CATEGORIES.map((c) => {
                const mods = modulesByCategory(c.slug);
                return (
                  <article className="lp-benefit-card" key={c.slug}>
                    <span className="lp-benefit-card__icon">
                      <BookIcon size={22} />
                    </span>
                    <h3>{c.name}</h3>
                    <p>{c.tagline}</p>
                    <p style={{ fontWeight: 700, color: "var(--brand-strong)" }}>
                      {mods.length} modul
                    </p>
                    <Link className="button button--ghost button--sm" href={`/kategori/${c.slug}`}>
                      Preview
                      <ArrowRightIcon size={12} />
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Mentor &amp; Penugasan</h2>
              <span className="dashboard-section__count">{mentorCount} mentor</span>
            </header>
            <div className="review-table">
              <div className="review-table__head" role="row">
                <span>Mentor</span>
                <span>Slug</span>
                <span>Track</span>
                <span>Modul Diampu</span>
              </div>
              {MENTORS.map((m) => {
                const mods = modulesByMentor(m.slug);
                return (
                  <div className="review-table__row" role="row" key={m.slug}>
                    <span className="review-table__student">
                      <span>
                        <strong>{m.name}</strong>
                        <small>{m.role}</small>
                      </span>
                    </span>
                    <span>
                      <code style={{ fontSize: "0.82rem" }}>{m.slug}</code>
                    </span>
                    <span>
                      <small>{mods[0] ? mods[0].categorySlug : "—"}</small>
                    </span>
                    <span>
                      <strong>{mods.length}</strong> modul
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Top 5 Modul (by enrollment)</h2>
            </header>
            {topModules.length === 0 ? (
              <div className="catalog-empty">
                <p>Belum ada siswa enroll.</p>
              </div>
            ) : (
              <ul className="activity-list">
                {topModules.map((tm) => {
                  const mod = MODULES.find((m) => m.slug === tm.moduleSlug);
                  return (
                    <li className="activity-item" key={tm.moduleSlug}>
                      <span className="activity-item__tag">Modul</span>
                      <div className="activity-item__body">
                        <strong>{mod?.title ?? tm.moduleSlug}</strong>
                        <p>
                          {tm._count._all} siswa enroll · kategori {mod?.categorySlug ?? "—"}
                        </p>
                      </div>
                      <Link className="activity-item__link" href={`/modul/${tm.moduleSlug}`}>
                        Preview
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <DashboardRightBar />
      </div>
    </main>
  );
}
