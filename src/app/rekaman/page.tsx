import type { Metadata } from "next";
import Link from "next/link";
import { DashboardRightBar } from "../_components/DashboardRightBar";
import { DashboardSidebar } from "../_components/DashboardSidebar";
import { DashboardTopbar } from "../_components/DashboardTopbar";
import { ArrowRightIcon, ClockIcon, PlayIcon } from "../_components/Icon";
import { CATEGORIES, findCategory, findMentor } from "../../lib/content";

export const metadata: Metadata = {
  title: "Rekaman Sesi",
  description:
    "Arsip rekaman live session, Q&A, dan workshop Senopati Academy. Tonton kapan saja sesuai jalur belajarmu.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/rekaman" }
};

type Recording = {
  id: string;
  title: string;
  categorySlug: string;
  mentorSlug: string;
  date: string;
  duration: string;
  views: number;
  type: "qna" | "workshop" | "masterclass";
};

const RECORDINGS: Recording[] = [
  {
    id: "r1",
    title: "Q&A: Introduction to AI (Minggu 1)",
    categorySlug: "foundations",
    mentorSlug: "arya-pratama",
    date: "11 Apr 2026",
    duration: "1j 28m",
    views: 324,
    type: "qna"
  },
  {
    id: "r2",
    title: "Workshop: Pertama Kali Pakai ChatGPT",
    categorySlug: "foundations",
    mentorSlug: "arya-pratama",
    date: "4 Apr 2026",
    duration: "1j 45m",
    views: 512,
    type: "workshop"
  },
  {
    id: "r3",
    title: "Masterclass: Bias Detection di Konteks Indonesia",
    categorySlug: "ethics-safety",
    mentorSlug: "maya-hendrawan",
    date: "28 Mar 2026",
    duration: "2j 02m",
    views: 276,
    type: "masterclass"
  },
  {
    id: "r4",
    title: "Q&A: Prompt Engineering Dasar",
    categorySlug: "praktis",
    mentorSlug: "reza-adityawan",
    date: "21 Mar 2026",
    duration: "1j 35m",
    views: 628,
    type: "qna"
  },
  {
    id: "r5",
    title: "Workshop: AI untuk Nulis Esai Sekolah",
    categorySlug: "praktis",
    mentorSlug: "reza-adityawan",
    date: "14 Mar 2026",
    duration: "1j 52m",
    views: 441,
    type: "workshop"
  },
  {
    id: "r6",
    title: "Masterclass: Facilitating AI Workshop untuk Guru",
    categorySlug: "teaching-training",
    mentorSlug: "cynthia-mahesa",
    date: "7 Mar 2026",
    duration: "2j 15m",
    views: 189,
    type: "masterclass"
  }
];

const TYPE_LABEL: Record<Recording["type"], string> = {
  qna: "Q&A Session",
  workshop: "Workshop",
  masterclass: "Masterclass"
};

export default function RekamanPage() {
  const totalHours = RECORDINGS.reduce((sum, r) => {
    const [h, m] = r.duration.split(/[jm]/).map((s) => parseInt(s.trim(), 10) || 0);
    return sum + h + m / 60;
  }, 0);

  return (
    <main className="academy-shell dashboard-shell">
      <div className="container dashboard-app">
        <DashboardSidebar />

        <section className="dashboard-app__main" aria-label="Rekaman sesi">
          <DashboardTopbar placeholder="Cari rekaman (judul, mentor, topik)" />

          <header className="dashboard-page-header">
            <div>
              <p className="eyebrow eyebrow--brand">Rekaman Sesi</p>
              <h1>Arsip lengkap semua live session</h1>
              <p>
                {RECORDINGS.length} rekaman · total {totalHours.toFixed(1)} jam. Ditambah setiap
                minggu — bisa tonton ulang kapan saja, juga ada transkrip otomatis.
              </p>
            </div>
            <Link className="button button--secondary" href="/live-session">
              Jadwal Live
              <ArrowRightIcon size={16} />
            </Link>
          </header>

          <div className="dashboard-section">
            <div className="rekaman-filters">
              <button className="chip chip--active" type="button">
                Semua
              </button>
              {CATEGORIES.map((cat) => (
                <button className="chip" type="button" key={cat.slug}>
                  {cat.name}
                </button>
              ))}
              <button className="chip" type="button">
                Q&A
              </button>
              <button className="chip" type="button">
                Workshop
              </button>
              <button className="chip" type="button">
                Masterclass
              </button>
            </div>

            <div className="rekaman-grid">
              {RECORDINGS.map((rec) => {
                const cat = findCategory(rec.categorySlug);
                const mentor = findMentor(rec.mentorSlug);
                return (
                  <article className="rekaman-card" key={rec.id}>
                    <div className="rekaman-card__thumb" aria-hidden="true">
                      <span className="rekaman-card__play">
                        <PlayIcon size={22} />
                      </span>
                      <span className="rekaman-card__duration">
                        <ClockIcon size={12} /> {rec.duration}
                      </span>
                      <span className={`rekaman-card__type rekaman-card__type--${rec.type}`}>
                        {TYPE_LABEL[rec.type]}
                      </span>
                    </div>
                    <div className="rekaman-card__body">
                      <p className="eyebrow">{cat?.name}</p>
                      <h3>{rec.title}</h3>
                      <div className="rekaman-card__meta">
                        <span>{mentor?.name ?? "[MENTOR]"}</span>
                        <span>·</span>
                        <span>{rec.date}</span>
                        <span>·</span>
                        <span>{rec.views} tayangan</span>
                      </div>
                      <div className="rekaman-card__actions">
                        <Link
                          className="button button--primary button--sm"
                          href={`/rekaman/${rec.id}`}
                        >
                          Tonton
                          <PlayIcon size={14} />
                        </Link>
                        <Link
                          className="button button--ghost button--sm"
                          href={`/rekaman/${rec.id}#transkrip`}
                        >
                          Transkrip
                        </Link>
                      </div>
                    </div>
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
