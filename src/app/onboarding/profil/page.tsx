import type { Metadata } from "next";
import { OnboardingSteps } from "../../_components/OnboardingSteps";
import { ProfileForm } from "../../_components/ProfileForm";
import { CATEGORIES } from "../../../lib/content";

export const metadata: Metadata = {
  title: "Setup Profil — Onboarding",
  description:
    "Isi profil belajar singkat supaya rekomendasi modul Senopati Academy pas dengan peran dan tujuanmu.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/onboarding/profil" }
};

export default function OnboardingProfilePage() {
  return (
    <main className="academy-shell onboarding-shell">
      <div className="container">
        <OnboardingSteps current={2} />

        <section className="onboarding-hero onboarding-hero--compact" aria-label="Setup profil">
          <p className="eyebrow eyebrow--brand">Setup Profil · 2 dari 3</p>
          <h1>
            Kenali kamu sedikit — biar <span className="highlight-text">rekomendasinya pas</span>.
          </h1>
          <p className="lede">
            Isi sebentar. Jawabannya kami pakai untuk susun 3 modul awal yang paling relevan
            denganmu. Semua bisa diubah dari dashboard nanti.
          </p>
        </section>

        <section aria-label="Form profil">
          <ProfileForm categories={CATEGORIES} />
        </section>
      </div>
    </main>
  );
}
