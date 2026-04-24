import type { Metadata } from "next";
import Link from "next/link";
import { DashboardRightBar } from "../_components/DashboardRightBar";
import { DashboardSidebar } from "../_components/DashboardSidebar";
import { DashboardTopbar } from "../_components/DashboardTopbar";
import { ArrowRightIcon, ClockIcon, PlayIcon, UsersIcon } from "../_components/Icon";
import { findMentor } from "../../lib/content";

export const metadata: Metadata = {
  title: "Live Session",
  description:
    "Jadwal live session, Q&A dengan mentor, dan workshop tatap muka di Senopati Academy.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/live-session" }
};

type LiveStatus = "live" | "upcoming" | "past";

type LiveEvent = {
  id: string;
  title: string;
  mentorSlug: string;
  type: string;
  date: string;
  time: string;
  duration: string;
  participants: number;
  status: LiveStatus;
  description: string;
  zoomId?: string;
};

const LIVE_EVENTS: LiveEvent[] = [
  {
    id: "le1",
    title: "Q&A Mingguan — Foundations Track",
    mentorSlug: "arya-pratama",
    type: "Q&A Session",
    date: "Kamis, 18 April 2026",
    time: "19.00 WIB",
    duration: "90 menit",
    participants: 42,
    status: "upcoming",
    description:
      "Sesi tanya-jawab langsung untuk semua peserta Foundations. Bawa pertanyaan, kasus, atau bahan diskusi yang muncul dari sesi mingguan.",
    zoomId: "[LINK_ZOOM]"
  },
  {
    id: "le2",
    title: "Workshop: Prompt Engineering Level-Up",
    mentorSlug: "reza-adityawan",
    type: "Workshop",
    date: "Sabtu, 27 April 2026",
    time: "10.00 WIB",
    duration: "2 jam",
    participants: 68,
    status: "upcoming",
    description:
      "Hands-on workshop membedah teknik prompt lanjutan: chain-of-thought, role prompting, few-shot dengan contoh kasus nyata.",
    zoomId: "[LINK_ZOOM]"
  },
  {
    id: "le3",
    title: "Live Office Hour — Ethics & Safety",
    mentorSlug: "maya-hendrawan",
    type: "Office Hour",
    date: "Kamis, 2 Mei 2026",
    time: "16.00 WIB",
    duration: "60 menit",
    participants: 18,
    status: "upcoming",
    description:
      "Slot konsultasi 1-on-1 dan diskusi grup kecil untuk topik bias AI, privasi data, dan studi kasus etika kontekstual.",
    zoomId: "[LINK_ZOOM]"
  },
  {
    id: "le4",
    title: "Live Masterclass — Teaching AI to Others",
    mentorSlug: "cynthia-mahesa",
    type: "Masterclass",
    date: "Minggu, 4 Mei 2026",
    time: "13.00 WIB",
    duration: "90 menit",
    participants: 24,
    status: "upcoming",
    description:
      "Mentor Teaching Track bagikan framework fasilitasi workshop AI. Cocok untuk guru, fasilitator, atau kakak pembina komunitas.",
    zoomId: "[LINK_ZOOM]"
  },
  {
    id: "le5",
    title: "Q&A: Introduction to AI (Minggu 1)",
    mentorSlug: "arya-pratama",
    type: "Q&A Session",
    date: "Kamis, 11 April 2026",
    time: "19.00 WIB",
    duration: "90 menit",
    participants: 38,
    status: "past",
    description:
      "Rekaman sesi Q&A untuk modul Introduction to AI. Tersedia di halaman rekaman."
  }
];

function statusLabel(s: LiveStatus) {
  if (s === "live") return "Live";
  if (s === "upcoming") return "Akan Datang";
  return "Selesai";
}

export default function LiveSessionPage() {
  const upcoming = LIVE_EVENTS.filter((e) => e.status === "upcoming" || e.status === "live");
  const past = LIVE_EVENTS.filter((e) => e.status === "past");

  return (
    <main className="academy-shell dashboard-shell">
      <div className="container dashboard-app">
        <DashboardSidebar />

        <section className="dashboard-app__main" aria-label="Live session">
          <DashboardTopbar placeholder="Cari live session" />

          <header className="dashboard-page-header">
            <div>
              <p className="eyebrow eyebrow--brand">Live Session</p>
              <h1>Jadwal live & rekaman sesi tatap muka</h1>
              <p>
                {upcoming.length} sesi akan datang · {past.length} rekaman tersedia. Bergabung lewat
                Zoom, atau tonton rekaman kapan saja kalau berhalangan.
              </p>
            </div>
            <Link className="button button--secondary" href="/rekaman">
              Arsip Rekaman
              <ArrowRightIcon size={16} />
            </Link>
          </header>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Akan Datang</h2>
              <span className="dashboard-section__count">{upcoming.length} sesi</span>
            </header>
            <div className="live-grid">
              {upcoming.map((ev) => {
                const mentor = findMentor(ev.mentorSlug);
                return (
                  <article className="live-card" key={ev.id}>
                    <div className="live-card__date">
                      <strong>{ev.date.split(",")[1]?.trim() ?? ev.date}</strong>
                      <span>{ev.time}</span>
                    </div>
                    <div className="live-card__body">
                      <div className="live-card__top">
                        <span className={`live-status live-status--${ev.status}`}>
                          <span className="live-status__dot" aria-hidden="true" />
                          {statusLabel(ev.status)}
                        </span>
                        <span className="live-card__type">{ev.type}</span>
                      </div>
                      <h3>{ev.title}</h3>
                      <p>{ev.description}</p>
                      <div className="live-card__meta">
                        <span>
                          <ClockIcon size={14} /> {ev.duration}
                        </span>
                        <span>
                          <UsersIcon size={14} /> {ev.participants} peserta
                        </span>
                        {mentor ? <span>Mentor: {mentor.name}</span> : null}
                      </div>
                    </div>
                    <div className="live-card__actions">
                      <Link className="button button--primary button--sm" href={`#${ev.id}`}>
                        <PlayIcon size={14} />
                        Gabung Zoom
                      </Link>
                      <Link className="button button--secondary button--sm" href={`#ical-${ev.id}`}>
                        Tambah ke Kalender
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Rekaman Terakhir</h2>
              <Link className="dashboard-section__link" href="/rekaman">
                Semua Rekaman <ArrowRightIcon size={14} />
              </Link>
            </header>
            <div className="live-past">
              {past.map((ev) => {
                const mentor = findMentor(ev.mentorSlug);
                return (
                  <article key={ev.id} className="live-past__item">
                    <span className="live-past__icon" aria-hidden="true">
                      <PlayIcon size={16} />
                    </span>
                    <div>
                      <strong>{ev.title}</strong>
                      <span>
                        {ev.date} · {ev.duration} · {mentor?.name ?? "[MENTOR]"}
                      </span>
                    </div>
                    <Link
                      className="button button--ghost button--sm"
                      href={`/rekaman/${ev.id}`}
                    >
                      Tonton
                      <ArrowRightIcon size={14} />
                    </Link>
                  </article>
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
