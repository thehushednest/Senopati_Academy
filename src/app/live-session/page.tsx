import type { Metadata } from "next";
import { DashboardRightBar } from "../_components/DashboardRightBar";
import { DashboardSidebar } from "../_components/DashboardSidebar";
import { DashboardTopbar } from "../_components/DashboardTopbar";
import { RsvpButton } from "../_components/RsvpButton";
import { ArrowRightIcon, ClockIcon, PlayIcon, UsersIcon } from "../_components/Icon";
import { prisma } from "../../lib/prisma";
import { getCurrentUser } from "../../lib/session";
import { findModule } from "../../lib/content";

export const metadata: Metadata = {
  title: "Live Session — Senopati Academy",
  robots: { index: false, follow: false },
  alternates: { canonical: "/live-session" },
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

function timeUntil(d: Date): string {
  const diff = d.getTime() - Date.now();
  if (diff < 0) {
    const past = Math.abs(diff);
    const h = Math.floor(past / (3600 * 1000));
    if (h < 24) return `${h} jam lalu`;
    return `${Math.floor(h / 24)} hari lalu`;
  }
  const h = Math.floor(diff / (3600 * 1000));
  if (h < 1) return `dalam ${Math.floor(diff / 60000)} menit`;
  if (h < 24) return `dalam ${h} jam`;
  const days = Math.floor(h / 24);
  return `dalam ${days} hari`;
}

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  scheduled: { label: "Terjadwal", tone: "submitted" },
  live: { label: "🔴 Live Sekarang", tone: "reviewing" },
  ended: { label: "Selesai", tone: "approved" },
  cancelled: { label: "Dibatalkan", tone: "needs_revision" },
};

export default async function LiveSessionPage() {
  const viewer = await getCurrentUser();
  if (!viewer) return null;

  // Student lihat: events yang relevan (modul dia enroll + platform-wide) +
  // recordings dari past events.
  const myProgress = await prisma.moduleProgress.findMany({
    where: { studentId: viewer.id },
    select: { moduleSlug: true },
    distinct: ["moduleSlug"],
  });
  const myModuleSlugs = myProgress.map((p) => p.moduleSlug);

  const [upcoming, recordings, myRsvps] = await Promise.all([
    // Upcoming: scope ke modul yang user enroll, atau platform-wide (moduleSlug null)
    prisma.liveEvent.findMany({
      where: {
        status: { in: ["scheduled", "live"] },
        OR: [
          { moduleSlug: null },
          ...(myModuleSlugs.length > 0 ? [{ moduleSlug: { in: myModuleSlugs } }] : []),
        ],
      },
      orderBy: { scheduledAt: "asc" },
      take: 30,
      include: {
        host: { select: { id: true, name: true } },
        _count: { select: { rsvps: true } },
      },
    }),
    // Recordings dari past events
    prisma.liveEvent.findMany({
      where: {
        status: "ended",
        recordingUrl: { not: null },
        OR: [
          { moduleSlug: null },
          ...(myModuleSlugs.length > 0 ? [{ moduleSlug: { in: myModuleSlugs } }] : []),
        ],
      },
      orderBy: { scheduledAt: "desc" },
      take: 20,
      include: {
        host: { select: { id: true, name: true } },
      },
    }),
    // User RSVP set
    prisma.liveEventRSVP.findMany({
      where: { userId: viewer.id },
      select: { eventId: true },
    }),
  ]);

  const myRsvpSet = new Set(myRsvps.map((r) => r.eventId));

  return (
    <main className="academy-shell dashboard-shell">
      <div className="container dashboard-app">
        <DashboardSidebar />

        <section className="dashboard-app__main" aria-label="Live session">
          <DashboardTopbar placeholder="Cari live session" />

          <header className="dashboard-page-header">
            <div>
              <p className="eyebrow eyebrow--brand">Live Session</p>
              <h1>Sesi live dari mentor</h1>
              <p>
                Q&amp;A, workshop, dan diskusi yang dijalankan mentor di luar materi sesi modul.
                RSVP supaya kamu dapat reminder + recording link otomatis.
              </p>
            </div>
          </header>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Akan Datang</h2>
              <span className="dashboard-section__count">{upcoming.length} event</span>
            </header>
            {upcoming.length === 0 ? (
              <div className="catalog-empty">
                <p>
                  Belum ada live session terjadwal. Mentor akan mengumumkan jadwal lewat
                  notifikasi saat tersedia.
                </p>
              </div>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 }}>
                {upcoming.map((e) => {
                  const mod = e.moduleSlug ? findModule(e.moduleSlug) : null;
                  const meta = STATUS_LABEL[e.status];
                  const rsvped = myRsvpSet.has(e.id);
                  return (
                    <li
                      key={e.id}
                      style={{
                        padding: 18,
                        borderRadius: 14,
                        background: "#ffffff",
                        border: rsvped
                          ? "2px solid rgba(24, 194, 156, 0.4)"
                          : "1px solid rgba(15, 23, 42, 0.06)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 14,
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ flex: "1 1 280px", minWidth: 0 }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                            <span className={`review-status review-status--${meta.tone}`}>{meta.label}</span>
                            {rsvped ? (
                              <span
                                style={{
                                  fontSize: "0.7rem",
                                  fontWeight: 800,
                                  letterSpacing: "0.06em",
                                  textTransform: "uppercase",
                                  padding: "3px 8px",
                                  borderRadius: 999,
                                  background: "rgba(24, 194, 156, 0.12)",
                                  color: "var(--brand-strong)",
                                }}
                              >
                                ✓ RSVPed
                              </span>
                            ) : null}
                            {mod ? (
                              <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                                {mod.title}
                              </span>
                            ) : (
                              <span style={{ fontSize: "0.78rem", color: "var(--muted)", fontStyle: "italic" }}>
                                Untuk semua peserta
                              </span>
                            )}
                          </div>
                          <strong style={{ fontSize: "1.05rem", display: "block", marginBottom: 4 }}>
                            {e.title}
                          </strong>
                          <small style={{ color: "var(--muted)", display: "block" }}>
                            <ClockIcon size={12} /> {formatDateTime(e.scheduledAt)} ({timeUntil(e.scheduledAt)})
                            · {e.durationMinutes} menit · oleh {e.host.name}
                          </small>
                          {e.description ? (
                            <p style={{ margin: "8px 0 0 0", color: "var(--ink-soft)", fontSize: "0.88rem" }}>
                              {e.description}
                            </p>
                          ) : null}
                          <small style={{ color: "var(--muted)", marginTop: 8, display: "block" }}>
                            <UsersIcon size={12} /> {e._count.rsvps} RSVP
                            {e.maxParticipants ? ` / ${e.maxParticipants} kapasitas` : ""}
                          </small>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexDirection: "column", flex: "0 0 auto" }}>
                          <RsvpButton
                            eventId={e.id}
                            initialRsvped={rsvped}
                            status={e.status}
                          />
                          {(e.status === "live" || (rsvped && e.status === "scheduled")) ? (
                            <a
                              href={e.meetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="button button--primary button--sm"
                            >
                              <PlayIcon size={12} /> Masuk
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {recordings.length > 0 ? (
            <div className="dashboard-section">
              <header className="dashboard-section__head">
                <h2>Rekaman Tersedia</h2>
                <span className="dashboard-section__count">{recordings.length} rekaman</span>
              </header>
              <div className="review-table">
                <div className="review-table__head" role="row">
                  <span>Tanggal</span>
                  <span>Judul</span>
                  <span>Modul</span>
                  <span>Host</span>
                  <span>Aksi</span>
                </div>
                {recordings.map((e) => {
                  const mod = e.moduleSlug ? findModule(e.moduleSlug) : null;
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
                        <small>{e.host.name}</small>
                      </span>
                      <span>
                        <a
                          href={e.recordingUrl ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="button button--secondary button--sm"
                        >
                          <PlayIcon size={12} /> Tonton
                          <ArrowRightIcon size={10} />
                        </a>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </section>

        <DashboardRightBar />
      </div>
    </main>
  );
}
