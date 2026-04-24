"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { ArrowRightIcon, CheckIcon } from "./Icon";

function RegisterFormInner() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params?.get("from") ?? "/onboarding/selamat-datang";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    school: "",
    grade: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const googleEnabled = Boolean(
    process.env.NEXT_PUBLIC_GOOGLE_LOGIN_ENABLED === "true" ||
      process.env.NEXT_PUBLIC_GOOGLE_LOGIN_ENABLED === "1"
  );

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [k]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal mendaftar.");
        setLoading(false);
        return;
      }
      const loginRes = await signIn("credentials", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        redirect: false,
      });
      if (loginRes?.ok) {
        router.push(redirect);
      } else {
        router.push("/login");
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  };

  return (
    <form className="register-form" onSubmit={handleSubmit} noValidate>
      <fieldset className="form-field">
        <legend>
          <strong>Nama lengkap</strong>
          <span>Nama akan ditampilkan di sertifikat.</span>
        </legend>
        <input
          className="form-input"
          value={form.name}
          onChange={update("name")}
          placeholder="Nama lengkap"
          autoComplete="name"
          required
        />
      </fieldset>

      <fieldset className="form-field">
        <legend>
          <strong>Email</strong>
          <span>Dipakai untuk login dan notifikasi.</span>
        </legend>
        <input
          type="email"
          className="form-input"
          value={form.email}
          onChange={update("email")}
          placeholder="nama@contoh.com"
          autoComplete="email"
          required
        />
      </fieldset>

      <fieldset className="form-field">
        <legend>
          <strong>Password</strong>
          <span>Minimal 8 karakter.</span>
        </legend>
        <input
          type="password"
          className="form-input"
          value={form.password}
          onChange={update("password")}
          placeholder="••••••••"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </fieldset>

      <div className="register-form__row">
        <fieldset className="form-field">
          <legend>
            <strong>Sekolah</strong>
            <span>Opsional.</span>
          </legend>
          <input
            className="form-input"
            value={form.school}
            onChange={update("school")}
            placeholder="Nama sekolah"
            autoComplete="organization"
          />
        </fieldset>
        <fieldset className="form-field">
          <legend>
            <strong>Kelas</strong>
            <span>Opsional.</span>
          </legend>
          <select className="form-input" value={form.grade} onChange={update("grade")}>
            <option value="">Pilih kelas</option>
            <option value="10">Kelas 10</option>
            <option value="11">Kelas 11</option>
            <option value="12">Kelas 12</option>
            <option value="mahasiswa">Mahasiswa</option>
            <option value="umum">Umum</option>
          </select>
        </fieldset>
      </div>

      {error ? <p className="login-error" role="alert">{error}</p> : null}

      <div className="login-form__actions">
        <button type="submit" className="button button--primary" disabled={loading}>
          {loading ? "Memproses..." : "Buat Akun"}
          <ArrowRightIcon size={16} />
        </button>
        <Link className="button button--ghost button--sm" href="/login">
          Sudah punya akun? Masuk
        </Link>
      </div>

      {googleEnabled ? (
        <button
          type="button"
          className="button button--secondary login-google"
          onClick={() => signIn("google", { callbackUrl: redirect })}
        >
          Daftar dengan Google
        </button>
      ) : null}

      <p className="register-form__legal">
        <CheckIcon size={14} /> Dengan mendaftar kamu menyetujui syarat layanan dan kebijakan
        privasi yang selaras dengan UU Perlindungan Data Pribadi.
      </p>
    </form>
  );
}

export function RegisterForm() {
  return (
    <Suspense fallback={<div className="login-card" aria-busy="true" />}>
      <RegisterFormInner />
    </Suspense>
  );
}
