import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { DashboardRightBar } from "../_components/DashboardRightBar";
import { DashboardSidebar } from "../_components/DashboardSidebar";
import { DashboardTopbar } from "../_components/DashboardTopbar";
import { ArrowRightIcon, BookIcon, UsersIcon } from "../_components/Icon";
import { TutorDashboard } from "../_components/TutorDashboard";
import { UserName } from "../_components/UserName";
import { authOptions } from "../../lib/auth";
import {
  ACTIVE_MODULES,
  buildSessions,
  findCategory,
  findMentor,
  findModule
} from "../../lib/content";
import { getMyActiveModules } from "../../lib/progress-server";

export const metadata: Metadata = {
  title: "Dashboard Peserta",
  description:
    "Overview semua modul aktif, progress belajar, dan langkah berikutnya di Senopati Academy.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/dashboard" }
};

const LESSONS_TABLE = [
  {
    id: "l1",
    moduleSlug: "introduction-to-ai",
    sessionIdx: 3,
    date: "14 Apr 2026",
    members: 3,
    tugasStatus: "done" as const
  },
  {
    id: "l2",
    moduleSlug: "ai-prompts-101",
    sessionIdx: 2,
    date: "17 Apr 2026",
    members: 7,
    tugasStatus: "pending" as const
  },
  {
    id: "l3",
    moduleSlug: "ai-ethics-responsible-ai-use",
    sessionIdx: 1,
    date: "22 Apr 2026",
    members: 1,
    tugasStatus: "done" as const
  }
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (role === "tutor") {
    return <TutorDashboard />;
  }

  // Kalau user sudah mulai modul, pakai data DB. Kalau belum, fallback ke contoh
  // statis supaya dashboard tidak kosong saat onboarding pertama kali.
  const myActive = await getMyActiveModules();
  const activeModules = myActive.length > 0 ? myActive : ACTIVE_MODULES;
  const hasRealProgress = myActive.length > 0;
  const continueModule = activeModules[0];

  return (
    <main className="academy-shell dashboard-shell">
      <div className="container dashboard-app">
        <DashboardSidebar />

        <section className="dashboard-app__main" aria-label="Konten utama">
          <DashboardTopbar />

          <div className="dashboard-welcome">
            <div>
              <p className="eyebrow eyebrow--brand">Selamat datang</p>
              <h1>
                Halo kembali, <UserName fallback="Calon Pelajar" />!
              </h1>
              <p>
                {hasRealProgress
                  ? "Lanjutin modul kamu — progress terakhir disimpan otomatis."
                  : "Kamu belum mulai modul apa pun. Pilih satu dari katalog dan mulai sesi pertamamu."}
              </p>
              <div className="dashboard-welcome__actions">
                {hasRealProgress && continueModule ? (
                  <Link
                    className="button button--primary"
                    href={`/belajar/${continueModule.moduleSlug}/sesi/${continueModule.completed}`}
                  >
                    Lanjutkan Belajar
                    <ArrowRightIcon size={16} />
                  </Link>
                ) : (
                  <Link className="button button--primary" href="/modul">
                    Jelajahi Katalog
                    <ArrowRightIcon size={16} />
                  </Link>
                )}
                <Link className="button button--secondary" href="/kelas">
                  Kelas Aktif
                </Link>
              </div>
            </div>
            <div className="dashboard-welcome__art" aria-hidden="true">
              <span className="dashboard-welcome__book" />
              <span className="dashboard-welcome__book dashboard-welcome__book--alt" />
              <span className="dashboard-welcome__orb" />
            </div>
          </div>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Kelas Aktif</h2>
              <Link className="dashboard-section__link" href="/kelas">
                Lihat Semua <ArrowRightIcon size={14} />
              </Link>
            </header>
            <div className="class-grid">
              {activeModules.map((active, idx) => {
                const mod = findModule(active.moduleSlug);
                const category = mod ? findCategory(mod.categorySlug) : null;
                const mentor = mod ? findMentor(mod.mentorSlug) : null;
                if (!mod) return null;
                const variant = idx === 0 ? "brand" : idx === 1 ? "indigo" : "accent";
                return (
                  <Link
                    href={`/belajar/${active.moduleSlug}`}
                    key={active.moduleSlug}
                    className={`class-card class-card--${variant}`}
                  >
                    <div className="class-card__top">
                      <strong>{category?.name}</strong>
                      <span>{mod.topics} Topik</span>
                    </div>
                    <h3>{mod.title}</h3>
                    <div className="class-card__avatars" aria-hidden="true">
                      <span>SA</span>
                      <span>RA</span>
                      <span>MH</span>
                      <span className="class-card__more">+{active.total - 3}</span>
                    </div>
                    <footer>
                      <span>
                        <BookIcon size={14} /> {mod.topics} Materi
                      </span>
                      <span>
                        <UsersIcon size={14} /> {mentor?.name ?? "[MENTOR]"}
                      </span>
                    </footer>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Sesi Terjadwal</h2>
              <Link className="dashboard-section__link" href="/live-session">
                Live Session <ArrowRightIcon size={14} />
              </Link>
            </header>
            <div className="lesson-table" role="table" aria-label="Sesi terjadwal">
              <div className="lesson-table__head" role="row">
                <span role="columnheader">Kelas</span>
                <span role="columnheader">Mentor</span>
                <span role="columnheader">Peserta</span>
                <span role="columnheader">Mulai</span>
                <span role="columnheader">Materi</span>
                <span role="columnheader">Tugas</span>
              </div>
              {LESSONS_TABLE.map((row) => {
                const mod = findModule(row.moduleSlug);
                const mentor = mod ? findMentor(mod.mentorSlug) : null;
                const sessions = mod ? buildSessions(mod, row.sessionIdx + 1) : [];
                const session = sessions[row.sessionIdx];
                if (!mod || !session) return null;
                const code = `${mod.slug.slice(0, 1).toUpperCase()}${row.sessionIdx + 1}`;
                return (
                  <div className="lesson-table__row" key={row.id} role="row">
                    <span role="cell" className="lesson-table__code">
                      {code}
                    </span>
                    <span role="cell">{mentor?.name ?? "[MENTOR]"}</span>
                    <span role="cell" className="lesson-table__avatars" aria-hidden="true">
                      <span>SA</span>
                      <span>RA</span>
                      <span className="class-card__more">+{row.members}</span>
                    </span>
                    <span role="cell">{row.date}</span>
                    <span role="cell">
                      <Link
                        href={`/belajar/${row.moduleSlug}/sesi/${row.sessionIdx}`}
                        className="lesson-table__link"
                      >
                        Buka
                      </Link>
                    </span>
                    <span role="cell">
                      <span
                        className={
                          "lesson-status lesson-status--" +
                          (row.tugasStatus === "done" ? "done" : "pending")
                        }
                      >
                        <span className="lesson-status__dot" aria-hidden="true" />
                        {row.tugasStatus === "done" ? "Selesai" : "Pending"}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <DashboardRightBar />
      </div>
    </main>
  );
}
