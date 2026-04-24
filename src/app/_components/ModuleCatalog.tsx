"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Category, Module } from "../../lib/content";
import { ArrowRightIcon, ClockIcon, LevelIcon } from "./Icon";

type Props = {
  modules: Module[];
  categories: Category[];
};

export function ModuleCatalog({ modules, categories }: Props) {
  const [activeFilter, setActiveFilter] = useState<string>("semua");
  const [query, setQuery] = useState<string>("");

  const filteredModules = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return modules.filter((mod) => {
      const matchesCategory = activeFilter === "semua" || mod.categorySlug === activeFilter;
      const matchesQuery =
        !needle ||
        mod.title.toLowerCase().includes(needle) ||
        mod.excerpt.toLowerCase().includes(needle);
      return matchesCategory && matchesQuery;
    });
  }, [modules, activeFilter, query]);

  const chipLabel = (slug: string) =>
    categories.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <>
      <div className="catalog-toolbar">
        <div className="catalog-filter" role="tablist" aria-label="Filter kategori">
          <button
            type="button"
            role="tab"
            className={activeFilter === "semua" ? "chip chip--active" : "chip"}
            aria-selected={activeFilter === "semua"}
            onClick={() => setActiveFilter("semua")}
          >
            Semua
          </button>
          {categories.map((category) => (
            <button
              key={category.slug}
              type="button"
              role="tab"
              className={activeFilter === category.slug ? "chip chip--active" : "chip"}
              aria-selected={activeFilter === category.slug}
              onClick={() => setActiveFilter(category.slug)}
            >
              {category.name}
            </button>
          ))}
        </div>
        <label className="catalog-search" aria-label="Cari modul">
          <input
            type="search"
            placeholder="Cari judul atau topik modul"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      <p className="catalog-count">
        Menampilkan <strong>{filteredModules.length}</strong> dari {modules.length} modul
      </p>

      {filteredModules.length === 0 ? (
        <div className="catalog-empty">
          <p>Belum ada modul yang cocok dengan pencarian ini.</p>
          <button
            type="button"
            className="button button--secondary button--sm"
            onClick={() => {
              setQuery("");
              setActiveFilter("semua");
            }}
          >
            Reset filter
          </button>
        </div>
      ) : (
        <div className="course-grid">
          {filteredModules.map((mod) => (
            <article className="course-card" key={mod.slug}>
              <div className="course-card__media" aria-hidden="true">
                <span className="course-card__badge">{chipLabel(mod.categorySlug)}</span>
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
                  <span>{mod.reviews} reviews</span>
                </div>
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
                  <strong>[NAMA_MENTOR]</strong>
                </div>
                <Link href={`/modul/${mod.slug}`} aria-label={`Detail ${mod.title}`}>
                  Detail
                  <ArrowRightIcon size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
