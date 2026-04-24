import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "../_components/LoginForm";

export const metadata: Metadata = {
  title: "Masuk ke Senopati Academy",
  description:
    "Masuk ke akun Senopati Academy kamu. Pakai akun demo untuk mencoba UI/UX langsung.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/login" }
};

export default function LoginPage() {
  return (
    <main className="academy-shell">
      <div className="container login-shell">
        <section className="login-hero" aria-label="Masuk">
          <p className="eyebrow eyebrow--brand">Login</p>
          <h1>Selamat datang kembali.</h1>
          <p className="lede">
            Masuk untuk lanjut belajar, lihat progress, dan dapat modul yang sudah kamu mulai.
            Belum punya akun? <Link href="/mulai">Daftar sekarang</Link>.
          </p>
        </section>

        <LoginForm />

        <section aria-label="Bantuan" className="login-help">
          <p>
            Masih kesulitan masuk? Hubungi kami di{" "}
            <a href="mailto:halo@asksenopati.com">halo@asksenopati.com</a> atau buka halaman{" "}
            <Link href="/tentang">Tentang</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}
