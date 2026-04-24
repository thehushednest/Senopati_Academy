import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightIcon,
  BookIcon,
  CheckIcon,
  CompassIcon,
  SparklesIcon,
  UsersIcon
} from "../../_components/Icon";
import { OnboardingSteps } from "../../_components/OnboardingSteps";
import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/session";

export const metadata: Metadata = {
  title: "Selamat Datang — Onboarding",
  description:
    "Selamat datang di Senopati Academy. Tiga langkah singkat supaya pengalaman belajarmu lebih terarah.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/onboarding/selamat-datang" }
};

const BENEFITS = [
  {
    Icon: CompassIcon,
    title: "Kenali jalur belajar yang pas",
    desc: "Kita cocokkan modul dengan peran dan tujuanmu — biar nggak bingung mulai dari mana."
  },
  {
    Icon: BookIcon,
    title: "Dapat rekomendasi 3 modul awal",
    desc: "Tiga modul pertama yang paling cocok buatmu akan disarankan otomatis di akhir onboarding."
  },
  {
    Icon: UsersIcon,
    title: "Gabung komunitas belajar",
    desc: "Akses otomatis ke grup diskusi mentor dan teman seangkatan setelah onboarding selesai."
  }
];

export default async function OnboardingWelcomePage() {
  const user = await getCurrentUser();
  const pref = user
    ? await prisma.userPreference.findUnique({ where: { userId: user.id } })
    : null;
  const alreadyOnboarded = Boolean(pref?.onboardedAt);

  return (
    <main className="academy-shell onboarding-shell">
      <div className="container">
        <OnboardingSteps current={1} />

        {alreadyOnboarded ? (
          <section
            aria-label="Sudah onboarded"
            style={{
              marginTop: 20,
              padding: "16px 20px",
              borderRadius: 14,
              background: "rgba(24, 194, 156, 0.08)",
              border: "1px solid rgba(24, 194, 156, 0.22)",
              display: "flex",
              gap: 14,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span style={{ color: "var(--brand-strong)", display: "inline-flex" }}>
              <CheckIcon size={18} />
            </span>
            <div style={{ flex: "1 1 260px", minWidth: 0 }}>
              <strong>Kamu sudah pernah onboarding.</strong>{" "}
              <span style={{ color: "var(--muted)" }}>
                Langsung ke dashboard, atau perbarui profil kalau tujuan belajarmu berubah.
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link className="button button--primary button--sm" href="/dashboard">
                Ke Dashboard
                <ArrowRightIcon size={14} />
              </Link>
              <Link className="button button--secondary button--sm" href="/onboarding/profil">
                Perbarui Profil
              </Link>
            </div>
          </section>
        ) : null}

        <section className="onboarding-hero" aria-label="Selamat datang">
          <div className="onboarding-hero__badge">
            <SparklesIcon size={18} />
            <span>Senang kamu di sini</span>
          </div>
          <h1>
            Selamat datang di <span className="highlight-text">Senopati Academy</span>.
          </h1>
          <p className="lede">
            Tiga menit ke depan, kita akan setup profil belajarmu supaya rekomendasi modulnya lebih
            pas. Nggak ada yang benar atau salah — jawab apa adanya ya.
          </p>
          <div className="onboarding-hero__cta">
            <Link className="button button--primary" href="/onboarding/profil">
              {alreadyOnboarded ? "Perbarui Profil" : "Mulai Setup Profil"}
              <ArrowRightIcon size={16} />
            </Link>
            <Link className="button button--secondary" href="/modul">
              Lewati dulu, lihat katalog
            </Link>
          </div>
        </section>

        <section aria-label="Yang kamu dapat">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Yang Kamu Dapat</p>
            <h2>Apa yang terjadi setelah kamu selesai onboarding</h2>
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

        <section aria-label="Panduan singkat">
          <div className="onboarding-checklist">
            <div>
              <p className="eyebrow eyebrow--brand">Checklist Singkat</p>
              <h2>Sebelum lanjut, pastikan kamu siap</h2>
              <p style={{ marginTop: 12, color: "var(--muted)", lineHeight: 1.75 }}>
                Nggak perlu persiapan rumit. Cukup tiga hal biar pengalaman belajar lebih lancar.
              </p>
            </div>
            <ul>
              <li>
                <span>01</span>
                <div>
                  <strong>Siapkan waktu ~3 menit</strong>
                  <p>Form profilnya singkat. Tapi hasilnya nentuin rekomendasi modul kamu.</p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <strong>Tahu sedikit tujuanmu</strong>
                  <p>Misal: "pengen paham dasar AI" atau "mau bikin tools AI sendiri". Cukup itu.</p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <strong>Buka mindset eksploratif</strong>
                  <p>Kalau di tengah jalan berubah pikiran, bisa diulang. Rekomendasi bukan kunci mati.</p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <section aria-label="Call to action">
          <div className="cta-banner">
            <div>
              <p className="eyebrow">Langkah Berikutnya</p>
              <h2>Siap? Kita mulai setup profil belajar kamu.</h2>
              <p className="lede" style={{ marginTop: 12 }}>
                Step 2 dari 3 — form singkat tentang peran dan tujuan belajarmu. Semua jawaban bisa
                diubah kapan saja dari dashboard nanti.
              </p>
            </div>
            <div className="cta-banner__actions">
              <Link className="button button--accent" href="/onboarding/profil">
                Lanjut ke Setup Profil
                <ArrowRightIcon size={16} />
              </Link>
              <Link className="button button--ghost" href="/modul">
                Lewati dulu
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
