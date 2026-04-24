import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightIcon,
  BookIcon,
  CheckIcon,
  MessageIcon,
  PresentIcon,
  SparklesIcon,
  UsersIcon
} from "../_components/Icon";

export const metadata: Metadata = {
  title: "Mulai Belajar AI — Senopati Academy",
  description:
    "25 modul AI terstruktur, mentor berpengalaman, sertifikat resmi. Cocok untuk pelajar SMP, SMA, dan siapa saja yang penasaran AI.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/mulai" }
};

const BENEFITS = [
  {
    Icon: SparklesIcon,
    title: "Kurikulum berbasis riset",
    desc: "Disusun dari AI Literacy framework Senopati Strategic Institute."
  },
  {
    Icon: BookIcon,
    title: "25 modul terstruktur",
    desc: "Dari Foundations sampai Advanced & Dev — semua jalurnya jelas."
  },
  {
    Icon: PresentIcon,
    title: "Belajar sambil praktik",
    desc: "Setiap modul punya challenge langsung — bukan cuma teori."
  },
  {
    Icon: UsersIcon,
    title: "Mentor berpengalaman",
    desc: "Didampingi praktisi yang sudah pakai AI di kerja nyata."
  },
  {
    Icon: MessageIcon,
    title: "Komunitas pelajar",
    desc: "Grup diskusi aktif, teman belajar dari seluruh Indonesia."
  },
  {
    Icon: CheckIcon,
    title: "Sertifikat resmi",
    desc: "Tersedia setelah menyelesaikan modul untuk ditambahkan ke CV."
  }
];

const INCLUDED = [
  "Akses ke 25 modul AI",
  "Challenge interaktif di setiap modul",
  "Template prompt siap pakai",
  "Grup diskusi & Q&A dengan mentor",
  "Sertifikat resmi Senopati Academy",
  "Update modul baru"
];

const TESTIMONIALS = [
  {
    quote:
      "Awalnya buta soal AI. Setelah modul Foundations, sekarang saya pakai AI untuk bantu tugas sekolah setiap hari.",
    name: "[NAMA_PELAJAR_1]",
    role: "SMA · Jakarta"
  },
  {
    quote:
      "Modul Prompts 101 bener-bener ngubah cara saya ngobrol sama ChatGPT. Jawabannya jadi lebih spesifik dan berguna.",
    name: "[NAMA_PELAJAR_2]",
    role: "SMP · Bandung"
  },
  {
    quote:
      "Paling suka bagian Ethics — bikin saya sadar ada tanggung jawab pas pakai AI. Bukan sekadar alat.",
    name: "[NAMA_PELAJAR_3]",
    role: "Mahasiswa · Surabaya"
  }
];

const FAQ = [
  {
    q: "Siapa saja yang cocok ikut program ini?",
    a: "Pelajar SMP, SMA, mahasiswa, dan siapa saja yang penasaran soal AI. Nggak perlu background teknis. Kurikulum dirancang supaya semua level bisa ikut."
  },
  {
    q: "Berapa lama saya bisa akses modul?",
    a: "Setelah daftar, kamu bisa akses semua modul kapan saja. Belajar pakai ritmemu sendiri — tidak ada deadline yang mengunci."
  },
  {
    q: "Apakah ada sertifikatnya?",
    a: "Ada. Sertifikat resmi Senopati Academy keluar otomatis setelah kamu menyelesaikan seluruh sesi dan lulus ujian akhir sebuah modul. Bisa ditambahkan ke CV atau portofolio."
  },
  {
    q: "Saya pemula total soal AI, apakah tetap bisa ikut?",
    a: "Justru cocok. Modul Foundations dirancang dari nol — tidak ada prasyarat teknis. Kamu bisa mulai dari Introduction to AI dan ikuti alurnya."
  },
  {
    q: "Bagaimana cara mulai?",
    a: "Daftar pakai email, kelar isi profil belajar singkat (3 menit), lalu kamu langsung dapat 3 rekomendasi modul pertama yang paling cocok buatmu."
  }
];

export default function MulaiPage() {
  return (
    <main className="academy-shell lp-shell">
      <div className="container">
        <section className="lp-hero" aria-label="Hero">
          <p className="eyebrow eyebrow--brand">Senopati Academy</p>
          <h1 className="lp-hero__title">
            Mulai Belajar <span className="highlight-text">AI dari Nol</span> — Siap Hadapi Era
            Digital
          </h1>
          <p className="lede lp-hero__lede">
            25 modul terstruktur, mentor berpengalaman, sertifikat resmi. Dirancang khusus untuk
            pelajar Indonesia yang mau paham AI — bukan cuma ikut-ikutan tren.
          </p>
          <div className="lp-hero__cta">
            <Link className="button button--primary" href="/daftar">
              Daftar Akun
              <ArrowRightIcon size={16} />
            </Link>
            <Link className="button button--secondary" href="/modul">
              Lihat Katalog Modul
            </Link>
          </div>
          <ul className="lp-hero__trust" aria-label="Jaminan">
            <li>
              <CheckIcon size={16} /> 25 modul lengkap
            </li>
            <li>
              <CheckIcon size={16} /> Mentor dari praktisi
            </li>
            <li>
              <CheckIcon size={16} /> Sertifikat resmi
            </li>
          </ul>
        </section>

        <section aria-label="Keunggulan">
          <div className="section-heading section-heading--center">
            <p className="eyebrow eyebrow--brand">Kenapa Senopati Academy?</p>
            <h2>Alasan pelajar memilih Senopati Academy untuk mulai belajar AI</h2>
          </div>
          <div className="lp-benefit-grid">
            {BENEFITS.map(({ Icon, title, desc }) => (
              <article className="lp-benefit-card" key={title}>
                <span className="lp-benefit-card__icon">
                  <Icon size={22} />
                </span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="modul" aria-label="Yang kamu dapat">
          <div className="lp-included-card">
            <div className="lp-included-card__copy">
              <p className="eyebrow">Yang Kamu Dapat</p>
              <h2>Semua yang kamu butuhkan untuk kuasai AI dalam satu platform</h2>
              <p className="lede" style={{ marginTop: 8 }}>
                Kurikulum, mentor, komunitas, dan sertifikat — semua terintegrasi di satu tempat.
              </p>
            </div>
            <ul className="lp-included-card__list">
              {INCLUDED.map((item) => (
                <li key={item}>
                  <span className="lp-included-card__tick">
                    <CheckIcon size={14} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-label="Testimoni">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Kata Pelajar Kami</p>
            <h2>Dipercaya oleh pelajar dari berbagai kota di Indonesia</h2>
          </div>
          <div className="spotlight-grid">
            {TESTIMONIALS.map((item) => (
              <article className="spotlight-card" key={item.name}>
                <div className="spotlight-card__top">
                  <span>★★★★★</span>
                </div>
                <p>“{item.quote}”</p>
                <div>
                  <strong>{item.name}</strong>
                  <span style={{ color: "var(--muted)", display: "block", fontSize: "0.85rem" }}>
                    {item.role}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-label="FAQ">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">FAQ</p>
            <h2>Pertanyaan yang sering ditanyakan</h2>
          </div>
          <div className="lp-faq">
            {FAQ.map((item) => (
              <details className="lp-faq__item" key={item.q}>
                <summary>
                  <span>{item.q}</span>
                  <span className="lp-faq__chevron" aria-hidden="true">
                    <ArrowRightIcon size={16} />
                  </span>
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section aria-label="Call to action">
          <div className="cta-banner">
            <div>
              <p className="eyebrow">Siap Mulai?</p>
              <h2>AI nggak nunggu siapa-siapa — mulai hari ini.</h2>
              <p className="lede" style={{ marginTop: 12 }}>
                Buat akun, isi profil belajarmu, dan langsung dapat rekomendasi 3 modul pertama
                yang paling cocok.
              </p>
            </div>
            <div className="cta-banner__actions">
              <Link className="button button--accent" href="/daftar">
                Daftar Akun
                <ArrowRightIcon size={16} />
              </Link>
              <Link className="button button--ghost" href="/modul">
                Lihat Katalog
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
