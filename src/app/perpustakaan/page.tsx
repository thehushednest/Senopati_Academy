import type { Metadata } from "next";
import Link from "next/link";
import { DashboardRightBar } from "../_components/DashboardRightBar";
import { DashboardSidebar } from "../_components/DashboardSidebar";
import { DashboardTopbar } from "../_components/DashboardTopbar";
import {
  ArrowRightIcon,
  BookIcon,
  CheckIcon,
  PenIcon,
  PlayIcon,
  PresentIcon,
  SparklesIcon
} from "../_components/Icon";

export const metadata: Metadata = {
  title: "Perpustakaan",
  description:
    "Template, toolkit, video explainer, dan artikel pendukung untuk peserta Senopati Academy.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/perpustakaan" }
};

type Resource = {
  id: string;
  title: string;
  description: string;
  type: "template" | "video" | "artikel" | "checklist" | "worksheet";
  tag: string;
  duration?: string;
  format?: string;
};

const RESOURCES: Resource[] = [
  {
    id: "rs1",
    title: "Template Prompt CTCF (Context · Task · Constraint · Format)",
    description:
      "Template siap pakai untuk nulis prompt yang menghasilkan output konsisten. Cocok untuk semua modul Praktis.",
    type: "template",
    tag: "Praktis",
    format: "Google Docs"
  },
  {
    id: "rs2",
    title: "Checklist Etika AI untuk Pelajar",
    description:
      "7 poin cepat sebelum pakai AI untuk tugas — memastikan penggunaan bijak dan bertanggung jawab.",
    type: "checklist",
    tag: "Ethics & Safety",
    format: "PDF"
  },
  {
    id: "rs3",
    title: "Video Explainer: Cara AI Belajar dari Data",
    description:
      "Animasi 7 menit membongkar konsep training data, inference, dan kenapa AI kadang salah.",
    type: "video",
    tag: "Foundations",
    duration: "7 menit"
  },
  {
    id: "rs4",
    title: "Worksheet: Bias Detection di Contoh Nyata",
    description:
      "Latihan 20 menit untuk mengenali bias di output AI dan mencari cara mengatasinya.",
    type: "worksheet",
    tag: "Ethics & Safety",
    format: "PDF · Printable"
  },
  {
    id: "rs5",
    title: "Video: Prompt Engineering Showdown",
    description:
      "Side-by-side comparison prompt bagus vs biasa. Lihat perbedaan hasilnya langsung di ChatGPT.",
    type: "video",
    tag: "Praktis",
    duration: "12 menit"
  },
  {
    id: "rs6",
    title: "Template Workshop AI untuk Guru",
    description:
      "Template slide + lesson plan workshop 90 menit — siap diadaptasi untuk kelas sendiri.",
    type: "template",
    tag: "Teaching",
    format: "Google Slides"
  },
  {
    id: "rs7",
    title: "Artikel: Masa Depan Kerja di Era AI Indonesia",
    description:
      "Analisis skill yang akan naik nilai dan yang akan tergantikan AI dalam 5 tahun ke depan.",
    type: "artikel",
    tag: "Karir",
    duration: "8 menit baca"
  },
  {
    id: "rs8",
    title: "Checklist Keamanan Data saat Pakai AI",
    description:
      "10 aturan data pribadi yang tidak boleh paste ke ChatGPT publik + alternatifnya.",
    type: "checklist",
    tag: "Ethics & Safety",
    format: "PDF"
  }
];

const TYPE_META: Record<Resource["type"], { label: string; Icon: typeof BookIcon }> = {
  template: { label: "Template", Icon: PenIcon },
  video: { label: "Video", Icon: PlayIcon },
  artikel: { label: "Artikel", Icon: BookIcon },
  checklist: { label: "Checklist", Icon: CheckIcon },
  worksheet: { label: "Worksheet", Icon: PresentIcon }
};

const FEATURED = [
  {
    title: "Template CTCF Framework",
    desc: "Cara tercepat bikin prompt yang hasilnya konsisten.",
    href: "#rs1",
    Icon: SparklesIcon
  },
  {
    title: "Video: How AI Learns",
    desc: "Konsep training + inference dalam 7 menit.",
    href: "#rs3",
    Icon: PlayIcon
  },
  {
    title: "Worksheet Bias Detection",
    desc: "Latihan praktis ngenalin bias di output AI.",
    href: "#rs4",
    Icon: PenIcon
  }
];

export default function PerpustakaanPage() {
  return (
    <main className="academy-shell dashboard-shell">
      <div className="container dashboard-app">
        <DashboardSidebar />

        <section className="dashboard-app__main" aria-label="Perpustakaan">
          <DashboardTopbar placeholder="Cari template, video, atau artikel" />

          <header className="dashboard-page-header">
            <div>
              <p className="eyebrow eyebrow--brand">Perpustakaan</p>
              <h1>Template, toolkit, dan materi pendukung</h1>
              <p>
                {RESOURCES.length} resource siap dipakai — template prompt, worksheet etika, video
                explainer, dan artikel. Semua gratis untuk peserta aktif.
              </p>
            </div>
            <Link className="button button--secondary" href="/blog">
              Baca Blog
              <ArrowRightIcon size={16} />
            </Link>
          </header>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Pilihan Mentor</h2>
              <span className="dashboard-section__count">Paling sering dipakai</span>
            </header>
            <div className="lib-featured">
              {FEATURED.map(({ title, desc, href, Icon }) => (
                <Link key={title} href={href} className="lib-featured__card">
                  <span className="lib-featured__icon">
                    <Icon size={20} />
                  </span>
                  <strong>{title}</strong>
                  <p>{desc}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Semua Resource</h2>
              <span className="dashboard-section__count">{RESOURCES.length} item</span>
            </header>
            <div className="rekaman-filters">
              <button type="button" className="chip chip--active">
                Semua
              </button>
              {(Object.keys(TYPE_META) as Array<Resource["type"]>).map((t) => {
                const { label, Icon } = TYPE_META[t];
                return (
                  <button type="button" className="chip" key={t}>
                    <Icon size={12} />
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="lib-grid">
              {RESOURCES.map((r) => {
                const { label, Icon } = TYPE_META[r.type];
                return (
                  <article className="lib-card" id={r.id} key={r.id}>
                    <div className={`lib-card__icon lib-card__icon--${r.type}`}>
                      <Icon size={18} />
                    </div>
                    <div className="lib-card__body">
                      <div className="lib-card__head">
                        <span className={`lib-tag lib-tag--${r.type}`}>{label}</span>
                        <span className="lib-card__tag">{r.tag}</span>
                      </div>
                      <h3>{r.title}</h3>
                      <p>{r.description}</p>
                      <div className="lib-card__meta">
                        {r.duration ? <span>{r.duration}</span> : null}
                        {r.format ? <span>{r.format}</span> : null}
                      </div>
                    </div>
                    <div className="lib-card__actions">
                      <Link className="button button--primary button--sm" href={`#${r.id}`}>
                        Buka
                        <ArrowRightIcon size={14} />
                      </Link>
                      <Link className="button button--ghost button--sm" href={`#save-${r.id}`}>
                        Simpan
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="dashboard-section">
            <div className="lib-request">
              <div>
                <p className="eyebrow">Butuh resource baru?</p>
                <h2>Request template atau worksheet untuk topik spesifik.</h2>
                <p>
                  Kalau ada kebutuhan belajar yang belum tercover, usulkan ke tim kurikulum — tim
                  akan review dalam 7 hari dan kabari lewat email.
                </p>
              </div>
              <Link className="button button--accent" href="mailto:halo@asksenopati.com">
                Kirim Usulan
                <ArrowRightIcon size={16} />
              </Link>
            </div>
          </div>
        </section>

        <DashboardRightBar />
      </div>
    </main>
  );
}
