import type { Metadata } from "next";
import Link from "next/link";
import { DashboardRightBar } from "../_components/DashboardRightBar";
import { DashboardSidebar } from "../_components/DashboardSidebar";
import { DashboardTopbar } from "../_components/DashboardTopbar";
import {
  ArrowRightIcon,
  BookIcon,
  CheckIcon,
  ClockIcon,
  LevelIcon,
  PlayIcon
} from "../_components/Icon";
import { ProgressRing } from "../_components/ProgressRing";
import {
  ACTIVE_MODULES,
  buildSessions,
  findCategory,
  findMentor,
  findModule
} from "../../lib/content";
import { getMyActiveModules } from "../../lib/progress-server";

export const metadata: Metadata = {
  title: "Kelas Aktif",
  description:
    "Daftar modul aktif yang sedang kamu kerjakan di Senopati Academy — progress, sesi berikutnya, mentor.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/kelas" }
};

export default async function KelasAktifPage() {
  const myActive = await getMyActiveModules();
  const hasRealProgress = myActive.length > 0;
  const activeModules = hasRealProgress ? myActive : ACTIVE_MODULES;

  return (
    <main className="academy-shell dashboard-shell">
      <div className="container dashboard-app">
        <DashboardSidebar />

        <section className="dashboard-app__main" aria-label="Kelas aktif">
          <DashboardTopbar placeholder="Cari di kelas aktif" />

          <header className="dashboard-page-header">
            <div>
              <p className="eyebrow eyebrow--brand">Kelas Aktif</p>
              <h1>
                {hasRealProgress
                  ? "Semua modul yang sedang kamu kerjakan"
                  : "Belum ada modul aktif"}
              </h1>
              <p>
                {hasRealProgress
                  ? `${activeModules.length} modul aktif — klik salah satu untuk lanjut ke sesi terakhir. Progress tersimpan otomatis.`
                  : "Mulai modul pertamamu dari katalog. Contoh di bawah ini adalah tampilan ketika kamu sudah punya modul aktif."}
              </p>
            </div>
            <Link className="button button--secondary" href="/modul">
              Jelajahi Katalog
              <ArrowRightIcon size={16} />
            </Link>
          </header>

          <div className="dashboard-section">
            <div className="kelas-aktif-list">
              {activeModules.map((active) => {
                const mod = findModule(active.moduleSlug);
                const category = mod ? findCategory(mod.categorySlug) : null;
                const mentor = mod ? findMentor(mod.mentorSlug) : null;
                const sessions = mod ? buildSessions(mod, active.completed) : [];
                const nextSession = sessions.find((s) => s.status === "active") ?? sessions[0];
                if (!mod) return null;
                return (
                  <article className="kelas-row" key={active.moduleSlug}>
                    <ProgressRing value={active.percent} size={96} label="Progress" />
                    <div className="kelas-row__body">
                      <p className="eyebrow">{category?.name}</p>
                      <h3>{mod.title}</h3>
                      <p className="kelas-row__next">
                        Lanjutkan: <strong>{active.nextSession}</strong>
                      </p>
                      <div className="kelas-row__meta">
                        <span>
                          <LevelIcon size={14} /> {mod.level}
                        </span>
                        <span>
                          <ClockIcon size={14} /> {mod.duration}
                        </span>
                        <span>
                          <CheckIcon size={14} /> {active.completed}/{active.total} sesi
                        </span>
                        <span>Mentor: {mentor?.name ?? "[MENTOR]"}</span>
                      </div>
                    </div>
                    <div className="kelas-row__actions">
                      <Link
                        className="button button--primary button--sm"
                        href={`/belajar/${active.moduleSlug}/sesi/${active.completed}`}
                      >
                        <PlayIcon size={14} />
                        Lanjutkan
                      </Link>
                      <Link
                        className="button button--secondary button--sm"
                        href={`/belajar/${active.moduleSlug}`}
                      >
                        <BookIcon size={14} />
                        Buka Modul
                      </Link>
                      <span className="kelas-row__est">
                        {active.estimatedFinish}
                      </span>
                    </div>
                    {nextSession ? (
                      <div className="kelas-row__next-card">
                        <span className="eyebrow">Sesi Berikutnya</span>
                        <strong>
                          Sesi {String(nextSession.index + 1).padStart(2, "0")} ·{" "}
                          {nextSession.title}
                        </strong>
                        <p>{nextSession.summary}</p>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Tips Konsistensi</h2>
            </header>
            <div className="tips-grid">
              <article className="tips-card">
                <strong>Belajar 30 menit per hari</strong>
                <p>Lebih efektif dari marathon 3 jam di akhir pekan. Konsistensi &gt; intensitas.</p>
              </article>
              <article className="tips-card">
                <strong>Mulai dari sesi terpendek</strong>
                <p>Kalau sedang lelah, pilih sesi paling singkat. Dorong dirimu untuk mulai saja.</p>
              </article>
              <article className="tips-card">
                <strong>Pakai fitur Catatan</strong>
                <p>Rangkum tiap sesi dalam 2-3 bullet. Membantu recall saat ujian akhir modul.</p>
              </article>
            </div>
          </div>
        </section>

        <DashboardRightBar />
      </div>
    </main>
  );
}
