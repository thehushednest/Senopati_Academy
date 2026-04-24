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
  title: "Program Rujukan — Ajak Teman, Dapat Reward",
  description:
    "Bagikan link rujukan kamu, ajak teman daftar Senopati Academy, dan dapatkan reward untuk setiap teman yang join.",
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
    title: "Teman Daftar",
    desc: "Teman kamu klik link, pilih paket, dan selesaikan pembayaran di Senopati Academy."
  },
  {
    Icon: SparklesIcon,
    title: "Dapat Reward",
    desc: "Begitu teman aktif, reward otomatis masuk ke akun kamu. Bisa dicairkan atau dipakai untuk paket tambahan."
  }
];

const TIERS = [
  {
    level: "Level 1",
    threshold: "1 — 4 teman",
    reward: "[REWARD_LEVEL_1]",
    perks: ["Komisi per teman aktif", "Akses modul bonus"]
  },
  {
    level: "Level 2",
    threshold: "5 — 14 teman",
    reward: "[REWARD_LEVEL_2]",
    perks: [
      "Komisi lebih besar per teman",
      "Badge Mentor Ambassador",
      "Akses Q&A bulanan eksklusif"
    ],
    featured: true
  },
  {
    level: "Level 3",
    threshold: "15+ teman",
    reward: "[REWARD_LEVEL_3]",
    perks: [
      "Komisi premium per teman",
      "Sesi 1-on-1 dengan mentor",
      "Kesempatan jadi narasumber komunitas"
    ]
  }
];

const FAQ = [
  {
    q: "Siapa saja yang bisa ikut program rujukan?",
    a: "Semua pelajar Senopati Academy yang sudah aktif (sudah daftar paket apa pun). Link rujukan otomatis aktif di dashboard setelah pembayaran berhasil."
  },
  {
    q: "Kapan reward saya masuk?",
    a: "Reward masuk otomatis 24 jam setelah teman yang kamu ajak menyelesaikan pembayaran dan status akunnya aktif."
  },
  {
    q: "Bagaimana cara mencairkan reward?",
    a: "Setelah mencapai minimum [MIN_WITHDRAW], kamu bisa request pencairan via transfer bank atau e-wallet dari halaman dashboard rujukan."
  },
  {
    q: "Apakah teman yang saya ajak dapat benefit juga?",
    a: "Ya. Teman yang daftar lewat link kamu otomatis dapat diskon spesial [DISKON_REFERRAL] untuk pembelian pertama."
  },
  {
    q: "Bolehkah saya promosi di media sosial?",
    a: "Boleh. Kami bahkan menyediakan template konten untuk Instagram, TikTok, dan WhatsApp. Hanya saja, hindari praktik spam atau klaim palsu soal Senopati Academy."
  }
];

export default function ReferralPage() {
  return (
    <main className="academy-shell">
      <div className="container">
        <section className="referral-hero" aria-label="Program rujukan">
          <p className="eyebrow eyebrow--brand">Program Rujukan</p>
          <h1 className="referral-hero__title">
            Ajak Teman Belajar AI — <span className="highlight-text">Kalian Sama-sama Dapat Reward</span>
          </h1>
          <p className="lede referral-hero__lede">
            Bagikan link rujukan kamu, ajak teman daftar Senopati Academy, dan dapatkan reward untuk
            setiap teman yang join. Teman kamu juga dapat diskon spesial untuk pembelian pertama.
          </p>
        </section>

        <section className="referral-link-card" aria-label="Link rujukan">
          <div className="referral-link-card__copy">
            <p className="eyebrow eyebrow--brand">Link Rujukan Kamu</p>
            <h2>Salin dan bagikan ke temanmu</h2>
            <p className="lede" style={{ marginTop: 8 }}>
              Setiap orang yang daftar lewat link ini tercatat sebagai rujukanmu.
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
            <h2>3 langkah mudah untuk mulai dapatkan reward</h2>
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

        <section aria-label="Tingkat reward">
          <div className="section-heading section-heading--center">
            <p className="eyebrow eyebrow--brand">Tingkat Reward</p>
            <h2>Makin banyak ajak, makin besar reward yang kamu dapat</h2>
          </div>
          <div className="referral-tiers">
            {TIERS.map((tier) => (
              <article
                className={`referral-tier${tier.featured ? " referral-tier--featured" : ""}`}
                key={tier.level}
              >
                {tier.featured ? <span className="referral-tier__ribbon">Paling Diminati</span> : null}
                <p className="eyebrow">{tier.level}</p>
                <h3>{tier.threshold}</h3>
                <div className="referral-tier__reward">
                  <strong>{tier.reward}</strong>
                  <span>reward per teman aktif</span>
                </div>
                <ul>
                  {tier.perks.map((perk) => (
                    <li key={perk}>
                      <CheckIcon size={14} /> {perk}
                    </li>
                  ))}
                </ul>
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
              <p className="eyebrow">Mulai Sekarang</p>
              <h2>Belum daftar Senopati Academy? Mulai dulu, lalu ajak teman.</h2>
              <p className="lede" style={{ marginTop: 12 }}>
                Program rujukan aktif otomatis setelah kamu jadi pelajar aktif. Mulai dari paket
                Starter atau Premium — keduanya bisa jadi pintu masuk jadi ambassador.
              </p>
            </div>
            <div className="cta-banner__actions">
              <Link className="button button--accent" href="/mulai">
                Daftar Sekarang
                <ArrowRightIcon size={16} />
              </Link>
              <Link className="button button--ghost" href="/home#catalog">
                Lihat Modul
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
