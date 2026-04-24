"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { ArrowRightIcon, CheckIcon, SparklesIcon } from "./Icon";
import { useAuth } from "./AuthProvider";

function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.6 16 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.4 4 9.9 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.3 0-9.8-3.4-11.4-8.1l-6.5 5C9.8 39.5 16.3 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.1 4.1-3.9 5.6l6.2 5.2C41.9 35 44 29.9 44 24c0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

function LoginFormInner() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("from") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const googleEnabled = Boolean(
    process.env.NEXT_PUBLIC_GOOGLE_LOGIN_ENABLED === "true" ||
      process.env.NEXT_PUBLIC_GOOGLE_LOGIN_ENABLED === "1"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });
    if (result?.ok) {
      router.push(redirect);
    } else {
      setError(
        result?.error === "CredentialsSignin"
          ? "Email atau password salah."
          : "Gagal masuk. Coba lagi beberapa saat."
      );
      setSubmitting(false);
    }
  };

  const handleGoogle = () => {
    void signIn("google", { callbackUrl: redirect });
  };

  if (user) {
    return (
      <div className="login-already">
        <span className="login-already__icon">
          <CheckIcon size={20} />
        </span>
        <h2>Kamu sudah login sebagai {user.name}</h2>
        <p>Langsung menuju dashboard atau jelajahi modul.</p>
        <div className="login-already__actions">
          <Link className="button button--primary" href="/dashboard">
            Buka Dashboard
            <ArrowRightIcon size={16} />
          </Link>
          <Link className="button button--secondary" href="/modul">
            Katalog Modul
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="login-card">
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <fieldset className="form-field">
          <legend>
            <strong>Email</strong>
            <span>Pakai email yang kamu daftarkan.</span>
          </legend>
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@domain.com"
            autoComplete="email"
            required
          />
        </fieldset>

        <fieldset className="form-field">
          <legend>
            <strong>Password</strong>
            <span>Minimal 8 karakter. Case-sensitive.</span>
          </legend>
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </fieldset>

        {error ? <p className="login-error" role="alert">{error}</p> : null}

        <div className="login-form__actions">
          <button
            type="submit"
            className="button button--primary"
            disabled={submitting || !email || !password}
          >
            {submitting ? "Memproses..." : "Masuk"}
            <ArrowRightIcon size={16} />
          </button>
          <Link className="button button--ghost button--sm" href="/mulai">
            Belum punya akun? Daftar
          </Link>
        </div>

        {googleEnabled ? (
          <button
            type="button"
            className="button button--secondary login-google"
            onClick={handleGoogle}
          >
            <GoogleIcon />
            Masuk dengan Google
          </button>
        ) : null}
      </form>

      <div className="login-demo">
        <div className="login-demo__header">
          <span className="login-demo__icon">
            <SparklesIcon size={16} />
          </span>
          <strong>Akun Demo untuk Testing UI/UX</strong>
        </div>
        <p>
          3 akun dengan role berbeda sudah di-seed ke database. Klik <em>Isi Otomatis</em> di
          akun pilihan, lalu klik <em>Masuk</em>.
        </p>

        <ul className="login-demo__list">
          {DEMO_ACCOUNTS.map((acc) => (
            <li key={acc.email}>
              <div>
                <strong>{acc.label}</strong>
                <span>{acc.description}</span>
                <div className="login-demo__cred">
                  <code>{acc.email}</code>
                  <code>{acc.password}</code>
                </div>
              </div>
              <button
                type="button"
                className="button button--secondary button--sm"
                onClick={() => {
                  setEmail(acc.email);
                  setPassword(acc.password);
                  setError(null);
                }}
              >
                Isi Otomatis
              </button>
            </li>
          ))}
        </ul>

        <p className="login-demo__footer">
          Belum punya akun sendiri?{" "}
          <Link href="/mulai">
            Daftar sekarang
            <ArrowRightIcon size={12} />
          </Link>
        </p>
      </div>
    </div>
  );
}

const DEMO_ACCOUNTS = [
  {
    label: "Siswa · Alya Pertiwi",
    description: "Role student — akses dashboard, modul, sertifikat.",
    email: "siswa.demo@asksenopati.com",
    password: "siswa-demo-1234"
  },
  {
    label: "Tutor · Pak Reza",
    description: "Role tutor — akses owner modul + live session.",
    email: "tutor.demo@asksenopati.com",
    password: "tutor-demo-1234"
  },
  {
    label: "Admin Senopati",
    description: "Role admin — full access ke seluruh sistem.",
    email: "admin@asksenopati.com",
    password: "admin-change-me"
  }
];

export function LoginForm() {
  return (
    <Suspense fallback={<div className="login-card" aria-busy="true" />}>
      <LoginFormInner />
    </Suspense>
  );
}
