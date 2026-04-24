import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "../_components/Icon";
import { AccountNav } from "../_components/AccountNav";
import {
  ChangePasswordSection,
  ProfileSection,
} from "../_components/AccountForms";

export const metadata: Metadata = {
  title: "Akun Saya — Senopati Academy",
  description: "Kelola profil, sekolah, kelas, dan password akun Senopati Academy kamu.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/akun" },
};

export default function AkunPage() {
  return (
    <main className="academy-shell">
      <div className="container">
        <section className="onboarding-hero onboarding-hero--compact" aria-label="Akun">
          <p className="eyebrow eyebrow--brand">Akun Saya</p>
          <h1>
            Kelola <span className="highlight-text">profil &amp; password</span>
          </h1>
          <p className="lede">
            Perbarui nama, sekolah, dan kelas kamu, atau ganti password login. Email login tidak
            bisa diubah lewat halaman ini — hubungi admin kalau butuh.
          </p>
        </section>

        <AccountNav current="akun" />

        <section aria-label="Profil" className="section-spacer">
          <div className="section-heading">
            <p className="eyebrow eyebrow--brand">Profil</p>
            <h2>Informasi yang muncul di sertifikat &amp; diskusi</h2>
          </div>
          <ProfileSection />
        </section>

        <section aria-label="Ganti password" className="section-spacer">
          <div className="section-heading">
            <p className="eyebrow">Keamanan</p>
            <h2>Ganti password</h2>
          </div>
          <ChangePasswordSection />
        </section>

        <section aria-label="Preferensi belajar" className="section-spacer">
          <div className="section-heading">
            <p className="eyebrow">Preferensi Belajar</p>
            <h2>Ubah tujuan &amp; minat belajar</h2>
            <p>
              Kalau peran, tujuan, atau minatmu berubah, perbarui lewat halaman onboarding —
              rekomendasi modul akan otomatis menyesuaikan.
            </p>
          </div>
          <Link className="button button--secondary" href="/onboarding/profil">
            Buka Setup Profil Belajar
            <ArrowRightIcon size={16} />
          </Link>
        </section>
      </div>
    </main>
  );
}
