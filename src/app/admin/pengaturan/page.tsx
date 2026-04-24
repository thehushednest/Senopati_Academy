import type { Metadata } from "next";
import Link from "next/link";
import { DashboardRightBar } from "../../_components/DashboardRightBar";
import { DashboardSidebar } from "../../_components/DashboardSidebar";
import { DashboardTopbar } from "../../_components/DashboardTopbar";
import { ArrowRightIcon, CheckIcon } from "../../_components/Icon";
import { prisma } from "../../../lib/prisma";

export const metadata: Metadata = {
  title: "Admin · Pengaturan",
  robots: { index: false, follow: false },
  alternates: { canonical: "/admin/pengaturan" },
};

export const dynamic = "force-dynamic";

export default async function AdminPengaturanPage() {
  const [
    userCount,
    studentCount,
    tutorCount,
    adminCount,
    moduleProgressCount,
    completedModuleCount,
    certificateCount,
    assignmentCount,
    pendingReviewCount,
    threadCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "student" } }),
    prisma.user.count({ where: { role: "tutor" } }),
    prisma.user.count({ where: { role: "admin" } }),
    prisma.moduleProgress.count(),
    prisma.moduleProgress.count({ where: { completedAt: { not: null } } }),
    prisma.moduleCertificate.count(),
    prisma.assignmentSubmission.count(),
    prisma.assignmentSubmission.count({ where: { status: "submitted" } }),
    prisma.discussionThread.count(),
  ]);

  const googleOAuthEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "(tidak diset)";
  const nextAuthUrl = process.env.NEXTAUTH_URL ?? "(tidak diset)";

  return (
    <main className="academy-shell dashboard-shell">
      <div className="container dashboard-app">
        <DashboardSidebar />

        <section className="dashboard-app__main" aria-label="Admin pengaturan">
          <DashboardTopbar placeholder="Cari setting" />

          <header className="dashboard-page-header">
            <div>
              <p className="eyebrow eyebrow--brand">Admin · Pengaturan</p>
              <h1>Kesehatan platform</h1>
              <p>
                Ringkasan counts dari database + konfigurasi sistem. Gunakan ini untuk cek cepat apakah semua
                service terhubung dengan benar.
              </p>
            </div>
          </header>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Stats Database</h2>
            </header>
            <div className="review-quick-stats" style={{ flexWrap: "wrap", gap: 14 }}>
              <div>
                <strong>{userCount}</strong>
                <span>Total user ({studentCount}/{tutorCount}/{adminCount})</span>
              </div>
              <div>
                <strong>{moduleProgressCount}</strong>
                <span>Enrollment modul</span>
              </div>
              <div>
                <strong>{completedModuleCount}</strong>
                <span>Modul selesai</span>
              </div>
              <div>
                <strong>{certificateCount}</strong>
                <span>Sertifikat</span>
              </div>
              <div>
                <strong>{assignmentCount}</strong>
                <span>Submission ({pendingReviewCount} pending)</span>
              </div>
              <div>
                <strong>{threadCount}</strong>
                <span>Thread diskusi</span>
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Konfigurasi Sistem</h2>
            </header>
            <div className="review-table">
              <div className="review-table__head" role="row">
                <span>Setting</span>
                <span>Status</span>
                <span>Value</span>
                <span>Catatan</span>
              </div>
              <div className="review-table__row" role="row">
                <span>
                  <strong>NEXT_PUBLIC_SITE_URL</strong>
                </span>
                <span>
                  <span className={`review-status review-status--${siteUrl !== "(tidak diset)" ? "approved" : "needs_revision"}`}>
                    {siteUrl !== "(tidak diset)" ? "set" : "missing"}
                  </span>
                </span>
                <span>
                  <code style={{ fontSize: "0.82rem" }}>{siteUrl}</code>
                </span>
                <span>
                  <small style={{ color: "var(--muted)" }}>Dipakai di certificate URL & metadata</small>
                </span>
              </div>
              <div className="review-table__row" role="row">
                <span>
                  <strong>NEXTAUTH_URL</strong>
                </span>
                <span>
                  <span className={`review-status review-status--${nextAuthUrl !== "(tidak diset)" ? "approved" : "needs_revision"}`}>
                    {nextAuthUrl !== "(tidak diset)" ? "set" : "missing"}
                  </span>
                </span>
                <span>
                  <code style={{ fontSize: "0.82rem" }}>{nextAuthUrl}</code>
                </span>
                <span>
                  <small style={{ color: "var(--muted)" }}>Callback OAuth & session cookie</small>
                </span>
              </div>
              <div className="review-table__row" role="row">
                <span>
                  <strong>Google OAuth</strong>
                </span>
                <span>
                  <span className={`review-status review-status--${googleOAuthEnabled ? "approved" : "submitted"}`}>
                    {googleOAuthEnabled ? "enabled" : "disabled"}
                  </span>
                </span>
                <span>
                  {googleOAuthEnabled ? (
                    <small>
                      <CheckIcon size={12} /> Client ID & Secret terkonfigurasi
                    </small>
                  ) : (
                    <small style={{ color: "var(--muted)" }}>
                      Set GOOGLE_CLIENT_ID &amp; GOOGLE_CLIENT_SECRET di env
                    </small>
                  )}
                </span>
                <span>
                  <small style={{ color: "var(--muted)" }}>Login dengan Google</small>
                </span>
              </div>
              <div className="review-table__row" role="row">
                <span>
                  <strong>SMTP / Email</strong>
                </span>
                <span>
                  <span className="review-status review-status--needs_revision">belum</span>
                </span>
                <span>
                  <small style={{ color: "var(--muted)" }}>Belum diwire</small>
                </span>
                <span>
                  <small style={{ color: "var(--muted)" }}>Blocker untuk email verification &amp; password reset via email</small>
                </span>
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="tutor-cta">
              <div>
                <p className="eyebrow eyebrow--brand">Akses Database</p>
                <h2>Untuk perubahan low-level, pakai Prisma Studio.</h2>
                <p>
                  Halaman admin ini cover operasi umum (edit user, set mentor track, moderasi thread). Untuk akses
                  tabel mentah (mis. lihat token session, manage migrasi), buka Prisma Studio di local:{" "}
                  <code>npm run prisma:studio</code>
                </p>
              </div>
              <div className="tutor-cta__actions">
                <Link className="button button--accent" href="/admin/pengguna">
                  Kelola Pengguna
                  <ArrowRightIcon size={16} />
                </Link>
                <Link className="button button--ghost" href="/admin/moderasi">
                  Buka Moderasi
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
