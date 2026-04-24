import type { Metadata } from "next";
import Link from "next/link";
import { DashboardRightBar } from "../../_components/DashboardRightBar";
import { DashboardSidebar } from "../../_components/DashboardSidebar";
import { DashboardTopbar } from "../../_components/DashboardTopbar";
import {
  ArrowRightIcon,
  BookIcon,
  CheckIcon,
  MessageIcon,
  PenIcon,
  PresentIcon,
  SparklesIcon
} from "../../_components/Icon";

export const metadata: Metadata = {
  title: "Materi & Soal — Tutor",
  robots: { index: false, follow: false },
  alternates: { canonical: "/tutor/materi" }
};

type Material = {
  id: string;
  title: string;
  category: "silabus" | "rubric" | "feedback" | "soal" | "slide" | "handout";
  description: string;
  lastUsed: string;
  usageCount: number;
};

const MATERIALS: Material[] = [
  {
    id: "m1",
    title: "Silabus Template: Modul 6 Sesi",
    category: "silabus",
    description: "Kerangka silabus siap pakai — objective, outcome, aktivitas per sesi, rubric.",
    lastUsed: "2 hari lalu",
    usageCount: 18
  },
  {
    id: "m2",
    title: "Rubric Default Tugas Praktik (100 poin)",
    category: "rubric",
    description: "4 dimensi × 25 poin: relevansi, kedalaman, kejelasan, keaslian.",
    lastUsed: "Hari ini",
    usageCount: 42
  },
  {
    id: "m3",
    title: "Template Feedback — Output Bagus",
    category: "feedback",
    description: "Validasi + ajak siswa coba variasi advanced. Nada encouraging.",
    lastUsed: "1 jam lalu",
    usageCount: 67
  },
  {
    id: "m4",
    title: "Template Feedback — Butuh Revisi",
    category: "feedback",
    description: "Spesifik area revisi, contoh konkret, bukan hanya 'coba lagi'.",
    lastUsed: "5 jam lalu",
    usageCount: 35
  },
  {
    id: "m5",
    title: "Bank Soal Foundations (40 soal)",
    category: "soal",
    description: "Pilihan ganda level pemula sampai menengah. Metadata sesi tersedia.",
    lastUsed: "Kemarin",
    usageCount: 12
  },
  {
    id: "m6",
    title: "Deck: Prompt Engineering Masterclass",
    category: "slide",
    description: "Slide 32 halaman + speaker notes. Siap dipakai untuk workshop.",
    lastUsed: "1 minggu lalu",
    usageCount: 8
  },
  {
    id: "m7",
    title: "Handout: CTCF Framework Cheatsheet",
    category: "handout",
    description: "1 halaman PDF — context, task, constraint, format dengan contoh.",
    lastUsed: "3 hari lalu",
    usageCount: 24
  },
  {
    id: "m8",
    title: "Bank Soal Ethics & Safety (25 soal)",
    category: "soal",
    description: "Kasus nyata, diskusi, multiple-interpretasi.",
    lastUsed: "2 minggu lalu",
    usageCount: 5
  }
];

const CATEGORY_META = {
  silabus: { label: "Silabus", Icon: BookIcon, tone: "brand" as const },
  rubric: { label: "Rubric", Icon: CheckIcon, tone: "brand" as const },
  feedback: { label: "Feedback", Icon: MessageIcon, tone: "accent" as const },
  soal: { label: "Bank Soal", Icon: PenIcon, tone: "indigo" as const },
  slide: { label: "Slide", Icon: PresentIcon, tone: "pink" as const },
  handout: { label: "Handout", Icon: SparklesIcon, tone: "blue" as const }
};

export default function TutorMateriPage() {
  const byCategory: Record<string, number> = {};
  for (const m of MATERIALS) byCategory[m.category] = (byCategory[m.category] ?? 0) + 1;

  return (
    <main className="academy-shell dashboard-shell">
      <div className="container dashboard-app">
        <DashboardSidebar />

        <section className="dashboard-app__main" aria-label="Materi tutor">
          <DashboardTopbar placeholder="Cari materi, rubric, soal, atau template" />

          <header className="dashboard-page-header">
            <div>
              <p className="eyebrow eyebrow--brand">Materi & Soal</p>
              <h1>Bank materi internal untuk tutor</h1>
              <p>
                {MATERIALS.length} item · template siap pakai dari Senopati Strategic Institute.
                Pilih, adjust, kirim ke siswa.
              </p>
            </div>
            <Link className="button button--primary" href="/tutor/materi/baru">
              <PenIcon size={14} /> Tambah Materi
            </Link>
          </header>

          <div className="dashboard-section">
            <div className="materi-categories">
              {(Object.keys(CATEGORY_META) as Array<keyof typeof CATEGORY_META>).map((k) => {
                const { label, Icon, tone } = CATEGORY_META[k];
                return (
                  <a href={`#${k}`} className={`materi-cat materi-cat--${tone}`} key={k}>
                    <span className="materi-cat__icon">
                      <Icon size={18} />
                    </span>
                    <div>
                      <strong>{label}</strong>
                      <span>{byCategory[k] ?? 0} item</span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="dashboard-section">
            <header className="dashboard-section__head">
              <h2>Semua Materi</h2>
              <span className="dashboard-section__count">Urut: paling sering dipakai</span>
            </header>
            <div className="materi-grid">
              {[...MATERIALS].sort((a, b) => b.usageCount - a.usageCount).map((m) => {
                const { label, Icon, tone } = CATEGORY_META[m.category];
                return (
                  <article className="materi-card" id={m.id} key={m.id}>
                    <div className={`materi-card__icon materi-card__icon--${tone}`}>
                      <Icon size={18} />
                    </div>
                    <div className="materi-card__body">
                      <div className="materi-card__head">
                        <span className={`lib-tag lib-tag--${tone === "accent" ? "artikel" : tone === "indigo" ? "checklist" : tone === "pink" ? "video" : tone === "blue" ? "worksheet" : "template"}`}>
                          {label}
                        </span>
                        <small>Dipakai {m.usageCount}×</small>
                      </div>
                      <h3>{m.title}</h3>
                      <p>{m.description}</p>
                      <div className="materi-card__meta">
                        <span>Terakhir dipakai {m.lastUsed}</span>
                      </div>
                    </div>
                    <div className="materi-card__actions">
                      <Link className="button button--primary button--sm" href={`#pakai-${m.id}`}>
                        Pakai
                        <ArrowRightIcon size={12} />
                      </Link>
                      <Link className="button button--ghost button--sm" href={`#duplicate-${m.id}`}>
                        Duplikat
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="dashboard-section">
            <div className="tutor-cta">
              <div>
                <p className="eyebrow eyebrow--brand">Tips Tutor</p>
                <h2>Usulkan materi baru — tim kurikulum review dalam 7 hari.</h2>
                <p>
                  Ada template feedback atau bank soal yang masih kurang? Kirim usulan, kami kurasi
                  dan tambahkan ke library jika relevan untuk semua tutor.
                </p>
              </div>
              <div className="tutor-cta__actions">
                <Link className="button button--accent" href="mailto:kurikulum@asksenopati.com">
                  Kirim Usulan
                  <ArrowRightIcon size={16} />
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
