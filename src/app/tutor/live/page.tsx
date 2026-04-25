import type { Metadata } from "next";
import { DashboardRightBar } from "../../_components/DashboardRightBar";
import { DashboardSidebar } from "../../_components/DashboardSidebar";
import { DashboardTopbar } from "../../_components/DashboardTopbar";
import { CreateLiveEventForm } from "../../_components/CreateLiveEventForm";
import { LiveEventActions } from "../../_components/LiveEventActions";
import { ArrowRightIcon, ClockIcon, PlayIcon, UsersIcon } from "../../_components/Icon";
import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/session";
import { findModule, modulesByMentor, MODULES } from "../../../lib/content";

export const metadata: Metadata = {
  title: "Live Session — Tutor",
  robots: { index: false, follow: false },
  alternates: { canonical: "/tutor/live" },
};

export const dynamic = "force-dynamic";

function formatDateTime(d: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  scheduled: { label: "Terjadwal", tone: "submitted" },
  live: { label: "Live Sekarang", tone: "reviewing" },
  ended: { label: "Selesai", tone: "approved" },
  cancelled: { label: "Dibatalkan", tone: "needs_revision" },
};

export default async function TutorLivePage() {
  const viewer = await getCurrentUser();
  if (!viewer) return null;

  const isAdmin = viewer.role === "admin";

  // Fetch user's mentorSlug → daftar modul yang bisa di-pilih untuk scope
  let availableModules = isAdmin ? MODULES : [];
  let mentorSlug: string | null = null;
  if (viewer.role === "tutor") {
    const record = await prisma.user.findUnique({
      where: { id: viewer.id },
      select: { mentorSlug: true },
    });
    mentorSlug = record?.mentorSlug ?? null;
    if (mentorSlug) {
      availableModules = modulesByMentor(mentorSlug);
    }
  }

  const myEvents = await prisma.liveEvent.findMany({
    where: { hostId: viewer.id },
    orderBy: { scheduledAt: "desc" },
    take: 50,
    include: {
      _count: { select: { rsvps: true } },
    },
  });

  const upcoming = myEvents.filter((e) => e.status === "scheduled" || e.status === "live");
  const past = myEvents.filter((e) => e.status === "ended" || e.status === "cancelled");

  return (
    <main className="academy-shell dashboard-shell">
      <div className="container dashboard-app">
        <DashboardSidebar />

        <section className="dashboard-app__main" aria-label="Live session tutor">
          <DashboardTopbar placeholder="Cari live session" />

          <header className="dashboard-page-header">
            <div>
              <p className="eyebrow eyebrow--brand">Live Session</p>
              <h1>Jadwalkan &amp; kelola sesi live kamu</h1>
              <p>
                {isAdmin
                  ? "Admin: bisa buat event ke modul mana pun atau platform-wide."
                  : mentorSlug
                  ? `Scope ke ${availableModules.length} modul yang kamu ampu. Murid yang punya progress di modul itu otomatis dapat notifikasi.`
                  : "Akunmu belum di-map ke mentor track. Kamu hanya bisa buat event platform-wide (notify tutor lain)."}
              </p>
            </div>
          </header>

          <div className="dashboard-section">
            <CreateLiveEventForm
              modules={availableModules.map((m) => ({ slug: m.slug, title: m.title }))}
              isAdmin={isAdmin}
            />
          </div>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Akan Datang &amp; Sedang Live</h2>
              <span className="dashboard-section__count">{upcoming.length} event</span>
            </header>
            {upcoming.length === 0 ? (
              <div className="catalog-empty">
                <p>Belum ada event terjadwal. Klik tombol di atas untuk buat baru.</p>
              </div>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 }}>
                {upcoming.map((e) => {
                  const mod = e.moduleSlug ? findModule(e.moduleSlug) : null;
                  const meta = STATUS_LABEL[e.status];
                  return (
                    <li
                      key={e.id}
                      style={{
                        padding: 18,
                        borderRadius: 14,
                        background: "#ffffff",
                        border: "1px solid rgba(15, 23, 42, 0.06)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                          marginBottom: 12,
                        }}
                      >
                        <div style={{ flex: "1 1 280px", minWidth: 0 }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                            <span className={`review-status review-status--${meta.tone}`}>{meta.label}</span>
                            {mod ? (
                              <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                                {mod.title}
                              </span>
                            ) : (
                              <span style={{ fontSize: "0.78rem", color: "var(--muted)", fontStyle: "italic" }}>
                                Platform-wide
                              </span>
                            )}
                          </div>
                          <strong style={{ fontSize: "1.05rem", display: "block", marginBottom: 4 }}>
                            {e.title}
                          </strong>
                          <small style={{ color: "var(--muted)", display: "block", marginBottom: 4 }}>
                            <ClockIcon size={12} /> {formatDateTime(e.scheduledAt)} · {e.durationMinutes} menit
                          </small>
                          {e.description ? (
                            <p style={{ margin: "8px 0 0 0", color: "var(--ink-soft)", fontSize: "0.88rem" }}>
                              {e.description}
                            </p>
                          ) : null}
                        </div>
                        <div style={{ textAlign: "right", flex: "0 0 auto" }}>
                          <strong style={{ fontSize: "1.4rem", display: "block" }}>
                            {e._count.rsvps}
                          </strong>
                          <small style={{ color: "var(--muted)" }}>
                            <UsersIcon size={12} /> RSVP
                            {e.maxParticipants ? ` / ${e.maxParticipants}` : ""}
                          </small>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <a
                          href={`/live-session/${e.id}/room`}
                          className="button button--primary button--sm"
                        >
                          <PlayIcon size={12} /> Buka Slide Room
                        </a>
                        {e.meetingUrl ? (
                          <a
                            href={e.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="button button--ghost button--sm"
                          >
                            Meeting URL
                          </a>
                        ) : null}
                        <LiveEventActions
                          eventId={e.id}
                          status={e.status}
                          recordingUrl={e.recordingUrl}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Riwayat Event</h2>
              <span className="dashboard-section__count">{past.length} selesai/dibatalkan</span>
            </header>
            {past.length === 0 ? (
              <div className="catalog-empty">
                <p>Belum ada event yang selesai.</p>
              </div>
            ) : (
              <div className="review-table">
                <div className="review-table__head" role="row">
                  <span>Tanggal</span>
                  <span>Judul</span>
                  <span>Modul</span>
                  <span>Status</span>
                  <span>RSVP</span>
                  <span>Recording</span>
                </div>
                {past.map((e) => {
                  const mod = e.moduleSlug ? findModule(e.moduleSlug) : null;
                  const meta = STATUS_LABEL[e.status];
                  return (
                    <div className="review-table__row" role="row" key={e.id}>
                      <span>
                        <small style={{ color: "var(--muted)" }}>{formatDateTime(e.scheduledAt)}</small>
                      </span>
                      <span>
                        <strong>{e.title}</strong>
                      </span>
                      <span>
                        <small>{mod?.title ?? "Platform-wide"}</small>
                      </span>
                      <span>
                        <span className={`review-status review-status--${meta.tone}`}>
                          {meta.label}
                        </span>
                      </span>
                      <span>{e._count.rsvps}</span>
                      <span>
                        {e.recordingUrl ? (
                          <a href={e.recordingUrl} target="_blank" rel="noopener noreferrer">
                            Buka rekaman
                            <ArrowRightIcon size={10} />
                          </a>
                        ) : (
                          <small style={{ color: "var(--muted)" }}>—</small>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <DashboardRightBar />
      </div>
    </main>
  );
}
