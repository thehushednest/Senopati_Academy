import type { Metadata } from "next";
import Link from "next/link";
import { DashboardRightBar } from "../../_components/DashboardRightBar";
import { DashboardSidebar } from "../../_components/DashboardSidebar";
import { DashboardTopbar } from "../../_components/DashboardTopbar";
import { ArrowRightIcon, ClockIcon, PenIcon, PlayIcon, UsersIcon } from "../../_components/Icon";

export const metadata: Metadata = {
  title: "Live Session — Tutor",
  robots: { index: false, follow: false },
  alternates: { canonical: "/tutor/live" }
};

type Session = {
  id: string;
  title: string;
  type: "Q&A" | "Workshop" | "Office Hour" | "Masterclass";
  date: string;
  time: string;
  duration: string;
  registered: number;
  capacity: number;
  status: "ready" | "draft" | "done" | "live";
  notes?: string;
  attendance?: number;
  rating?: number;
};

const SESSIONS: Session[] = [
  {
    id: "ts1",
    title: "Q&A Mingguan Foundations",
    type: "Q&A",
    date: "Kamis, 18 Apr 2026",
    time: "19.00 WIB",
    duration: "90 menit",
    registered: 42,
    capacity: 80,
    status: "ready",
    notes: "Fokus: supervised vs unsupervised, bias data training"
  },
  {
    id: "ts2",
    title: "Workshop Prompt Engineering Level-Up",
    type: "Workshop",
    date: "Sabtu, 27 Apr 2026",
    time: "10.00 WIB",
    duration: "2 jam",
    registered: 68,
    capacity: 100,
    status: "draft",
    notes: "Outline slide belum final — target: Jumat 19.00"
  },
  {
    id: "ts3",
    title: "Office Hour: Intro to AI",
    type: "Office Hour",
    date: "Kamis, 2 Mei 2026",
    time: "16.00 WIB",
    duration: "60 menit",
    registered: 18,
    capacity: 30,
    status: "ready"
  },
  {
    id: "ts4",
    title: "Masterclass Chain-of-Thought",
    type: "Masterclass",
    date: "Minggu, 11 Apr 2026",
    time: "13.00 WIB",
    duration: "90 menit",
    registered: 54,
    capacity: 80,
    status: "done",
    attendance: 38,
    rating: 4.8
  }
];

export default function TutorLivePage() {
  const upcoming = SESSIONS.filter((s) => s.status !== "done");
  const past = SESSIONS.filter((s) => s.status === "done");
  const totalRegistered = upcoming.reduce((s, e) => s + e.registered, 0);

  return (
    <main className="academy-shell dashboard-shell">
      <div className="container dashboard-app">
        <DashboardSidebar />

        <section className="dashboard-app__main" aria-label="Live session tutor">
          <DashboardTopbar placeholder="Cari live session" />

          <header className="dashboard-page-header">
            <div>
              <p className="eyebrow eyebrow--brand">Live Session</p>
              <h1>Jadwal live yang kamu host</h1>
              <p>
                {upcoming.length} sesi akan datang · {totalRegistered} peserta sudah daftar · {past.length}{" "}
                rekaman terarsip. Pastikan prep slide siap minimal 4 jam sebelum live.
              </p>
            </div>
            <Link className="button button--primary" href="/tutor/live/baru">
              <PlayIcon size={14} /> Jadwalkan Live
            </Link>
          </header>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Akan Datang</h2>
              <span className="dashboard-section__count">{upcoming.length} sesi</span>
            </header>
            <div className="tutor-session-list">
              {upcoming.map((s) => (
                <article className="tutor-session-row" key={s.id}>
                  <div className="tutor-session-row__date">
                    <strong>{s.date.split(",")[1]?.trim()}</strong>
                    <span>{s.time}</span>
                    <small>{s.duration}</small>
                  </div>
                  <div className="tutor-session-row__body">
                    <div className="tutor-session-row__head">
                      <span className={`tutor-session-type tutor-session-type--${s.type.toLowerCase().replace(/\s|&/g, "-")}`}>
                        {s.type}
                      </span>
                      <span className={`tutor-session-status tutor-session-status--${s.status}`}>
                        <span className="tutor-session-status__dot" aria-hidden="true" />
                        {s.status === "ready" ? "Siap Host" : s.status === "draft" ? "Draft Materi" : "Live"}
                      </span>
                    </div>
                    <h3>{s.title}</h3>
                    <div className="tutor-session-row__meta">
                      <span>
                        <UsersIcon size={14} /> {s.registered}/{s.capacity} terdaftar
                      </span>
                      <span>
                        <ClockIcon size={14} /> {s.duration}
                      </span>
                    </div>
                    {s.notes ? <p className="tutor-session-row__notes">Catatan: {s.notes}</p> : null}
                  </div>
                  <div className="tutor-session-row__actions">
                    {s.status === "ready" ? (
                      <Link className="button button--primary button--sm" href={`#${s.id}`}>
                        <PlayIcon size={14} /> Mulai Host
                      </Link>
                    ) : (
                      <Link className="button button--accent button--sm" href={`#${s.id}`}>
                        <PenIcon size={14} /> Lengkapi
                      </Link>
                    )}
                    <Link className="button button--secondary button--sm" href={`#edit-${s.id}`}>
                      Edit Detail
                    </Link>
                    <Link className="button button--ghost button--sm" href={`#copy-${s.id}`}>
                      Copy Link Zoom
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Rekaman & Hasil</h2>
              <span className="dashboard-section__count">{past.length} sesi selesai</span>
            </header>
            <div className="tutor-past-list">
              {past.map((s) => (
                <article className="tutor-past-row" key={s.id}>
                  <span className="tutor-past-row__icon">
                    <PlayIcon size={16} />
                  </span>
                  <div>
                    <strong>{s.title}</strong>
                    <span>
                      {s.date} · {s.duration} · {s.type}
                    </span>
                  </div>
                  <div className="tutor-past-row__stats">
                    <div>
                      <strong>{s.attendance}/{s.registered}</strong>
                      <span>Hadir</span>
                    </div>
                    <div>
                      <strong>{s.rating}★</strong>
                      <span>Rating</span>
                    </div>
                  </div>
                  <Link className="button button--secondary button--sm" href={`/rekaman/${s.id}`}>
                    Rekaman
                    <ArrowRightIcon size={12} />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <DashboardRightBar />
      </div>
    </main>
  );
}
