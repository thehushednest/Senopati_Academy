import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "../_components/Icon";
import { ModuleCatalog } from "../_components/ModuleCatalog";
import { CATEGORIES, MODULES } from "../../lib/content";

export const metadata: Metadata = {
  title: "Katalog Modul — 25 Modul AI Terstruktur",
  description:
    "Jelajahi 25 modul AI Senopati Academy, dari Foundations sampai Advanced & Dev. Filter sesuai kategori, level, atau cari topik spesifik.",
  alternates: { canonical: "/modul" }
};

export default function ModulCatalogPage() {
  return (
    <main className="academy-shell">
      <div className="container">
        <section className="lp-hero" aria-label="Katalog modul">
          <p className="eyebrow eyebrow--brand">Katalog Lengkap</p>
          <h1 className="lp-hero__title">
            25 modul AI untuk{" "}
            <span className="highlight-text">paham, bisa, dan berani mencoba</span>.
          </h1>
          <p className="lede lp-hero__lede">
            Semua modul Senopati Academy dalam satu halaman. Filter per kategori, cari berdasarkan
            topik, dan pilih yang paling relevan untuk jalur belajarmu.
          </p>
        </section>

        <section id="katalog" aria-label="Daftar modul">
          <ModuleCatalog modules={MODULES} categories={CATEGORIES} />
        </section>

        <section aria-label="Jalur kategori">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Lewat Jalur Kategori</p>
            <h2>Lebih suka belajar bertahap? Ikuti satu track sampai habis.</h2>
          </div>
          <div className="category-grid category-grid--five">
            {CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/kategori/${category.slug}`}
                className="category-card"
              >
                <span className="category-card__icon">
                  {category.name.charAt(0)}
                </span>
                <h3>{category.name}</h3>
                <p className="category-card__subtitle">{category.tagline}</p>
                <p className="category-card__count">
                  {MODULES.filter((m) => m.categorySlug === category.slug).length} Modul
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section aria-label="Call to action">
          <div className="cta-banner">
            <div>
              <p className="eyebrow">Mulai Sekarang</p>
              <h2>Bingung mulai dari mana? Ikuti jalur Foundations dulu.</h2>
              <p className="lede" style={{ marginTop: 12 }}>
                Lima modul di jalur Foundations dirancang sebagai titik masuk paling bersahabat.
                Setelahnya, kamu bisa pilih jalur manapun dengan nyaman.
              </p>
            </div>
            <div className="cta-banner__actions">
              <Link className="button button--accent" href="/kategori/foundations">
                Mulai dari Foundations
                <ArrowRightIcon size={16} />
              </Link>
              <Link className="button button--ghost" href="/mulai">
                Lihat Harga
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
