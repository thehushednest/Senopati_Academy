import type { Metadata } from "next";
import Link from "next/link";
import { DashboardRightBar } from "../../_components/DashboardRightBar";
import { DashboardSidebar } from "../../_components/DashboardSidebar";
import { DashboardTopbar } from "../../_components/DashboardTopbar";
import { ArrowRightIcon, BookIcon, ClockIcon, MessageIcon } from "../../_components/Icon";
import { getMyTaughtModules } from "../../../lib/tutor-scope";
import { getCurrentUser } from "../../../lib/session";
import { findCategory } from "../../../lib/content";

export const metadata: Metadata = {
  title: "Modul Saya — Tutor",
  robots: { index: false, follow: false },
  alternates: { canonical: "/tutor/modul" },
};

export const dynamic = "force-dynamic";

function relativeTime(d: Date | string) {
  const then = new Date(d).getTime();
  const diff = Math.max(0, Date.now() - then);
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${Math.max(m, 1)} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const dd = Math.floor(h / 24);
  return `${dd} hari lalu`;
}

export default async function TutorModulPage() {
  const viewer = await getCurrentUser();
  const modules = await getMyTaughtModules();

  // Kalau admin: tampilkan notice. Admin tidak punya mentorSlug — tapi bisa
  // lihat semua modul di /modul.
  const isAdmin = viewer?.role === "admin";

  const totalStudents = modules.reduce((s, m) => s + m.studentsCount, 0);
  const totalPendingReviews = modules.reduce((s, m) => s + m.pendingReviews, 0);
  const totalUnread = modules.reduce((s, m) => s + m.unreadThreads, 0);
  const avgCompletion =
    modules.length > 0
      ? Math.round(
          modules.reduce((s, m) => s + m.averageCompletion, 0) / modules.length,
        )
      : 0;

  return (
    <main className="academy-shell dashboard-shell">
      <div className="container dashboard-app">
        <DashboardSidebar />

        <section className="dashboard-app__main" aria-label="Modul saya">
          <DashboardTopbar placeholder="Cari modul" />

          <header className="dashboard-page-header">
            <div>
              <p className="eyebrow eyebrow--brand">Modul Saya</p>
              <h1>
                {modules.length === 0 && !isAdmin
                  ? "Belum ada modul yang kamu ampu"
                  : `Modul yang kamu ampu`}
              </h1>
              <p>
                {isAdmin ? (
                  <>
                    Admin view — semua modul di platform tidak otomatis terhubung ke akun admin.
                    Lihat katalog lengkap di <Link href="/modul">/modul</Link>.
                  </>
                ) : modules.length === 0 ? (
                  <>
                    Akun tutor kamu belum dihubungkan ke mentor track. Hubungi admin untuk
                    di-mapping ke salah satu track (mis. Foundations, Praktis, Ethics & Safety).
                  </>
                ) : (
                  <>
                    {modules.length} modul · {totalStudents} siswa aktif · {totalPendingReviews} tugas menunggu review · {totalUnread} thread belum dibalas · rata-rata {avgCompletion}% selesai.
                  </>
                )}
              </p>
            </div>
            <Link className="button button--secondary" href="/modul">
              Lihat Katalog
              <ArrowRightIcon size={14} />
            </Link>
          </header>

          {modules.length === 0 ? (
            <div className="dashboard-section">
              <div className="catalog-empty">
                <p>
                  {isAdmin
                    ? "Sebagai admin kamu tidak terikat mentor track. Gunakan halaman admin untuk melihat semua siswa & modul."
                    : "Minta admin untuk set 'mentor track' di akunmu (update field mentorSlug di tabel users). Setelah itu, modul yang kamu ampu akan muncul di sini."}
                </p>
                <div style={{ marginTop: 14 }}>
                  <Link className="button button--secondary button--sm" href="/tutor/review">
                    Sementara, buka Review Tugas →
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="dashboard-section">
              <div className="tutor-modul-list">
                {modules.map((m) => {
                  const category = findCategory(m.categorySlug);
                  return (
                    <article className="tutor-modul-row" key={m.slug}>
                      <div className="tutor-modul-row__main">
                        <div className="tutor-modul-row__head">
                          <span className="tutor-status tutor-status--brand">
                            <span className="tutor-status__dot" aria-hidden="true" />
                            Published
                          </span>
                          <span className="tutor-modul-row__cat">{category?.name ?? m.categorySlug}</span>
                          <span className="tutor-modul-row__updated">
                            <ClockIcon size={12} />{" "}
                            {m.lastActivity ? `Aktivitas ${relativeTime(m.lastActivity)}` : "Belum ada aktivitas"}
                          </span>
                        </div>
                        <h3>{m.title}</h3>
                        <div className="tutor-modul-row__stats">
                          <div>
                            <strong>{m.studentsCount}</strong>
                            <span>Siswa</span>
                          </div>
                          <div>
                            <strong>{m.averageCompletion}%</strong>
                            <span>Selesai</span>
                          </div>
                          <div>
                            <strong>{m.pendingReviews}</strong>
                            <span>Review</span>
                          </div>
                          <div>
                            <strong>{m.unreadThreads}</strong>
                            <span>Diskusi baru</span>
                          </div>
                        </div>
                        <div className="active-progress-bar" aria-hidden="true">
                          <span style={{ width: `${m.averageCompletion}%` }} />
                        </div>
                      </div>
                      <div className="tutor-modul-row__actions">
                        <Link
                          className={
                            m.pendingReviews > 0
                              ? "button button--primary button--sm"
                              : "button button--secondary button--sm"
                          }
                          href={`/tutor/review?status=submitted&moduleSlug=${m.slug}`}
                        >
                          {m.pendingReviews > 0
                            ? `Review ${m.pendingReviews} tugas`
                            : "Antrean kosong"}
                          <ArrowRightIcon size={12} />
                        </Link>
                        <Link
                          className="button button--ghost button--sm"
                          href={`/belajar/${m.slug}/diskusi`}
                        >
                          <MessageIcon size={14} /> Diskusi
                        </Link>
                        <Link
                          className="button button--ghost button--sm"
                          href={`/modul/${m.slug}`}
                        >
                          <BookIcon size={14} /> Preview Modul
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          <div className="dashboard-section">
            <div className="tutor-cta">
              <div>
                <p className="eyebrow eyebrow--brand">Tips</p>
                <h2>Review tugas setiap hari bikin SLA 48 jam tercapai.</h2>
                <p>
                  Cek antrean dua kali sehari — pagi dan sore — untuk menjaga feedback tetap
                  relevan dengan momen belajar murid.
                </p>
              </div>
              <div className="tutor-cta__actions">
                <Link className="button button--accent" href="/tutor/review">
                  Buka Antrean Review
                  <ArrowRightIcon size={16} />
                </Link>
                <Link className="button button--ghost" href="/tutor/siswa">
                  Lihat Siswa
                </Link>
              </div>
            </div>
          </div>
        </section>

        <DashboardRightBar />
      </div>
    </main>
  );
}
