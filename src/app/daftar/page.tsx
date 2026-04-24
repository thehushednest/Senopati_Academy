import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "../_components/RegisterForm";
import { SparklesIcon } from "../_components/Icon";

export const metadata: Metadata = {
  title: "Daftar — Senopati Academy",
  description:
    "Buat akun Senopati Academy untuk akses modul pembelajaran AI dan Keamanan Siber bagi pelajar Indonesia.",
  robots: { index: false, follow: true },
};

export default function DaftarPage() {
  return (
    <main className="page-shell">
      <section className="auth-section">
        <div className="auth-grid">
          <div className="auth-grid__intro">
            <span className="auth-grid__chip">
              <SparklesIcon size={14} /> Gratis untuk pelajar SMA
            </span>
            <h1>Daftar Senopati Academy</h1>
            <p>
              Platform belajar AI dan Keamanan Siber berbahasa Indonesia, dirancang khusus untuk
              remaja SMA 16–18 tahun. Belajar mandiri, ikut kelas live dengan tutor, dan mainkan
              modul interaktif berbasis cerita.
            </p>
            <ul className="auth-grid__bullets">
              <li>Bahasa Indonesia, konteks lokal.</li>
              <li>Modul perdana: Artificial Intelligence & Keamanan Siber.</li>
              <li>Sertifikat digital saat modul selesai.</li>
            </ul>
            <p className="auth-grid__note">
              Sudah punya akun? <Link href="/login">Masuk di sini →</Link>
            </p>
          </div>

          <div className="auth-grid__form">
            <RegisterForm />
          </div>
        </div>
      </section>
    </main>
  );
}
