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
  findCategory,
  findMentor,
  findModule
} from "../../lib/content";
import { getMyActiveModules, getMyRecentActivity } from "../../lib/progress-server";

export const metadata: Metadata = {
  title: "Dashboard Peserta",
  description:
    "Overview semua modul aktif, progress belajar, dan langkah berikutnya di Senopati Academy.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/dashboard" }
};

const KIND_LABEL: Record<string, string> = {
  progress: "Progress",
  quiz: "Kuis",
  assignment: "Tugas",
  certificate: "Sertifikat",
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (role === "tutor") {
    return <TutorDashboard />;
  }

  // Kalau user sudah mulai modul, pakai data DB. Kalau belum, fallback ke contoh
  // statis supaya dashboard tidak kosong saat onboarding pertama kali.
  const [myActive, recentActivity] = await Promise.all([
    getMyActiveModules(),
    getMyRecentActivity(6),
  ]);
  const activeModules = myActive.length > 0 ? myActive : ACTIVE_MODULES;
  const hasRealProgress = myActive.length > 0;

  // Prioritaskan modul yang belum selesai sebagai "continue". Kalau semua sudah
  // selesai, continueModule tetap ada tapi CTA dialihkan.
  const inProgressModules = myActive.filter((m) => m.completed < m.total);
  const continueModule = inProgressModules[0] ?? activeModules[0];
  const continueModuleCompleted = Boolean(
    continueModule && continueModule.completed >= continueModule.total,
  );
  const continueSessionIndex = continueModule
    ? Math.min(continueModule.completed, Math.max(0, continueModule.total - 1))
    : 0;
  const continueHref = !continueModule
    ? "/modul"
    : continueModuleCompleted
    ? `/belajar/${continueModule.moduleSlug}/sertifikat`
    : `/belajar/${continueModule.moduleSlug}/sesi/${continueSessionIndex}`;
  const continueLabel = !continueModule
    ? "Jelajahi Katalog"
    : continueModuleCompleted
    ? "Lihat Sertifikat"
    : "Lanjutkan Belajar";

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
                {!hasRealProgress
                  ? "Kamu belum mulai modul apa pun. Pilih satu dari katalog dan mulai sesi pertamamu."
                  : inProgressModules.length === 0
                  ? "Semua modul aktifmu sudah selesai — keren! Saatnya pilih modul berikutnya."
                  : "Lanjutin modul kamu — progress terakhir disimpan otomatis."}
              </p>
              <div className="dashboard-welcome__actions">
                {hasRealProgress ? (
                  <Link className="button button--primary" href={continueHref}>
                    {continueLabel}
                    <ArrowRightIcon size={16} />
                  </Link>
                ) : (
                  <Link className="button button--primary" href="/modul">
                    Jelajahi Katalog
                    <ArrowRightIcon size={16} />
                  </Link>
                )}
                {inProgressModules.length === 0 && hasRealProgress ? (
                  <Link className="button button--secondary" href="/modul">
                    Pilih Modul Berikutnya
                  </Link>
                ) : (
                  <Link className="button button--secondary" href="/kelas">
                    Kelas Aktif
                  </Link>
                )}
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
              <h2>Aktivitas Terbaru</h2>
              <Link className="dashboard-section__link" href="/progress">
                Lihat Progress <ArrowRightIcon size={14} />
              </Link>
            </header>
            {recentActivity.length === 0 ? (
              <div className="catalog-empty">
                <p>
                  Belum ada aktivitas tercatat. Selesaikan sesi pertama untuk melihat jejak
                  belajarmu di sini.
                </p>
              </div>
            ) : (
              <ul className="activity-list">
                {recentActivity.map((item) => (
                  <li className={`activity-item activity-item--${item.kind}`} key={item.id}>
                    <span className="activity-item__tag">{KIND_LABEL[item.kind] ?? item.kind}</span>
                    <div className="activity-item__body">
                      <strong>{item.moduleTitle}</strong>
                      <p>{item.message}</p>
                      <span className="activity-item__time">{formatDate(item.at)}</span>
                    </div>
                    <Link className="activity-item__link" href={item.href}>
                      Buka <ArrowRightIcon size={14} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <DashboardRightBar />
      </div>
    </main>
  );
}
