import type { Metadata } from "next";
import Link from "next/link";
import { CopyButton } from "../_components/CopyButton";
import {
  ArrowRightIcon,
  CheckIcon,
  MessageIcon,
  SparklesIcon,
  UsersIcon
} from "../_components/Icon";

export const metadata: Metadata = {
  title: "Ajak Teman Belajar — Senopati Academy",
  description:
    "Bagikan link kamu, ajak teman bergabung belajar AI di Senopati Academy. Makin banyak teman seangkatan, makin seru belajarnya.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/referral" }
};

const REFERRAL_URL = "https://asksenopati.com/r/[KODE_KAMU]";

const STEPS = [
  {
    Icon: MessageIcon,
    title: "Bagikan Link Kamu",
    desc: "Salin link rujukan di bawah, kirim ke teman via WhatsApp, Instagram, atau channel apa pun."
  },
  {
    Icon: UsersIcon,
    title: "Teman Bergabung",
    desc: "Teman kamu klik link dan mendaftar akun Senopati Academy — gratis."
  },
  {
    Icon: SparklesIcon,
    title: "Belajar Bersama",
    desc: "Kalian bisa diskusi di thread modul, saling dukung, dan tumbuh bareng jadi melek AI."
  }
];

const PERKS = [
  {
    title: "Badge Komunitas",
    desc: "Setiap teman yang bergabung lewat kamu menambah jejak komunitasmu. Badge khusus muncul di profil setelah ≥5 teman aktif."
  },
  {
    title: "Akses Awal Fitur Baru",
    desc: "Anggota yang aktif mengajak teman mendapat prioritas uji coba fitur baru — misal live session tematik atau modul beta."
  },
  {
    title: "Undangan Diskusi Tertutup",
    desc: "Ambassador aktif diundang ke grup komunitas inti bersama mentor untuk diskusi kurikulum & arah platform."
  }
];

const FAQ = [
  {
    q: "Siapa saja yang bisa ikut program rujukan?",
    a: "Semua pelajar Senopati Academy yang sudah punya akun. Link rujukan otomatis muncul di halaman ini begitu kamu login."
  },
  {
    q: "Apa yang teman saya dapat kalau daftar lewat link saya?",
    a: "Mereka langsung tercatat sebagai bagian dari jaringanmu — dan kalian bisa saling muncul di thread diskusi modul, bikin belajar tidak sendirian."
  },
  {
    q: "Ada reward material-nya?",
    a: "Untuk sekarang belum. Fokus kami saat ini adalah membangun komunitas belajar yang sehat, bukan program afiliasi. Pengakuan di platform tetap ada (badge, akses awal, undangan diskusi)."
  },
  {
    q: "Bolehkah saya bagikan link di media sosial?",
    a: "Boleh. Justru kami dorong — kalau kamu punya pengikut yang penasaran AI, undang mereka ke sini."
  }
];

export default function ReferralPage() {
  return (
    <main className="academy-shell">
      <div className="container">
        <section className="referral-hero" aria-label="Ajak teman">
          <p className="eyebrow eyebrow--brand">Ajak Teman</p>
          <h1 className="referral-hero__title">
            Ajak teman <span className="highlight-text">belajar AI bareng</span>
          </h1>
          <p className="lede referral-hero__lede">
            Bagikan link kamu, ajak teman bergabung. Belajar AI lebih enak kalau ada yang bisa
            diajak ngobrol — saling tanya di thread modul, saling kirim insight baru.
          </p>
        </section>

        <section className="referral-link-card" aria-label="Link rujukan">
          <div className="referral-link-card__copy">
            <p className="eyebrow eyebrow--brand">Link Kamu</p>
            <h2>Salin dan bagikan ke temanmu</h2>
            <p className="lede" style={{ marginTop: 8 }}>
              Setiap orang yang daftar lewat link ini tercatat sebagai bagian jaringan belajarmu.
            </p>
          </div>
          <div className="referral-link-card__input">
            <input
              type="text"
              defaultValue={REFERRAL_URL}
              readOnly
              aria-label="Link rujukan"
            />
            <CopyButton value={REFERRAL_URL} className="button button--primary button--sm" />
          </div>
        </section>

        <section aria-label="Cara kerja">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Cara Kerja</p>
            <h2>3 langkah sederhana</h2>
          </div>
          <div className="referral-steps">
            {STEPS.map(({ Icon, title, desc }, idx) => (
              <article className="referral-step" key={title}>
                <span className="referral-step__number">{String(idx + 1).padStart(2, "0")}</span>
                <span className="referral-step__icon">
                  <Icon size={20} />
                </span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-label="Benefit komunitas">
          <div className="section-heading section-heading--center">
            <p className="eyebrow eyebrow--brand">Yang Didapat</p>
            <h2>Benefit buat kamu yang aktif mengajak</h2>
          </div>
          <div className="lp-benefit-grid">
            {PERKS.map((perk) => (
              <article className="lp-benefit-card" key={perk.title}>
                <span className="lp-benefit-card__icon">
                  <CheckIcon size={22} />
                </span>
                <h3>{perk.title}</h3>
                <p>{perk.desc}</p>
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
              <p className="eyebrow">Ajak Sekarang</p>
              <h2>Siap bikin belajar AI lebih seru dengan teman-temanmu?</h2>
              <p className="lede" style={{ marginTop: 12 }}>
                Salin link di atas, kirim ke circle kamu. Mereka daftar gratis, kalian jadi
                seangkatan di platform.
              </p>
            </div>
            <div className="cta-banner__actions">
              <Link className="button button--accent" href="/modul">
                Lihat Katalog
                <ArrowRightIcon size={16} />
              </Link>
              <Link className="button button--ghost" href="/dashboard">
                Kembali ke Dashboard
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
