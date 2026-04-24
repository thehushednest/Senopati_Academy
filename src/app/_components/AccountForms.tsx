"use client";

import { useEffect, useState } from "react";
import { ArrowRightIcon, CheckIcon } from "./Icon";

type Account = {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  school: string | null;
  grade: string | null;
};

const GRADE_OPTIONS = [
  { value: "", label: "Pilih kelas (opsional)" },
  { value: "10", label: "Kelas 10 (SMA/SMK)" },
  { value: "11", label: "Kelas 11 (SMA/SMK)" },
  { value: "12", label: "Kelas 12 (SMA/SMK)" },
  { value: "7", label: "Kelas 7 (SMP)" },
  { value: "8", label: "Kelas 8 (SMP)" },
  { value: "9", label: "Kelas 9 (SMP)" },
  { value: "mahasiswa", label: "Mahasiswa" },
  { value: "guru", label: "Guru / Fasilitator" },
  { value: "umum", label: "Umum" },
];

export function ProfileSection() {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/account/profile");
        if (!res.ok) throw new Error("Gagal memuat profil");
        const data = await res.json();
        if (cancelled) return;
        setAccount(data.account);
        setName(data.account.name ?? "");
        setSchool(data.account.school ?? "");
        setGrade(data.account.grade ?? "");
      } catch (err) {
        if (!cancelled) setErrorMessage(err instanceof Error ? err.message : "Gagal memuat profil");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setStatus("idle");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          school: school.trim() || null,
          grade: grade || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Gagal menyimpan" }));
        throw new Error(data.error ?? "Gagal menyimpan");
      }
      const data = await res.json();
      setAccount(data.account);
      setStatus("saved");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="catalog-empty">
        <p>Memuat profil…</p>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="catalog-empty">
        <p>{errorMessage ?? "Profil tidak bisa dimuat."}</p>
      </div>
    );
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit} noValidate>
      <fieldset className="form-field">
        <legend>
          <strong>Email</strong>
          <span>Dipakai untuk login. Kalau ingin mengganti email, hubungi admin.</span>
        </legend>
        <input type="email" className="form-input" value={account.email} readOnly disabled />
      </fieldset>

      <fieldset className="form-field">
        <legend>
          <strong>Nama lengkap</strong>
          <span>Akan ditampilkan di sertifikat dan thread diskusi.</span>
        </legend>
        <input
          type="text"
          className="form-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama lengkap"
          required
          maxLength={120}
        />
      </fieldset>

      <div className="register-form__row">
        <fieldset className="form-field">
          <legend>
            <strong>Sekolah / Institusi</strong>
            <span>Opsional.</span>
          </legend>
          <input
            type="text"
            className="form-input"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            placeholder="Nama sekolah atau kampus"
            maxLength={200}
          />
        </fieldset>

        <fieldset className="form-field">
          <legend>
            <strong>Kelas / Tingkat</strong>
            <span>Opsional.</span>
          </legend>
          <select className="form-input" value={grade} onChange={(e) => setGrade(e.target.value)}>
            {GRADE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </fieldset>
      </div>

      {status === "error" && errorMessage ? (
        <p className="login-error" role="alert">
          {errorMessage}
        </p>
      ) : null}
      {status === "saved" ? (
        <p className="profile-form__hint" role="status" style={{ color: "var(--brand-strong)" }}>
          <CheckIcon size={14} /> Perubahan tersimpan.
        </p>
      ) : null}

      <div className="profile-form__actions">
        <button
          type="submit"
          className="button button--primary"
          disabled={saving || name.trim().length === 0}
        >
          {saving ? "Menyimpan…" : "Simpan Perubahan"}
          <ArrowRightIcon size={16} />
        </button>
      </div>
    </form>
  );
}

export function ChangePasswordSection() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit =
    current.length >= 1 && next.length >= 8 && confirm.length >= 8 && next === confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setStatus("idle");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: current,
          newPassword: next,
          confirmPassword: confirm,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Gagal mengganti password" }));
        throw new Error(data.error ?? "Gagal mengganti password");
      }
      setStatus("ok");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setStatus("err");
      setErrorMessage(err instanceof Error ? err.message : "Gagal mengganti password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="profile-form" onSubmit={handleSubmit} noValidate>
      <fieldset className="form-field">
        <legend>
          <strong>Password saat ini</strong>
          <span>Verifikasi identitas sebelum ganti password.</span>
        </legend>
        <input
          type="password"
          className="form-input"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </fieldset>

      <fieldset className="form-field">
        <legend>
          <strong>Password baru</strong>
          <span>Minimal 8 karakter.</span>
        </legend>
        <input
          type="password"
          className="form-input"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          autoComplete="new-password"
          minLength={8}
          placeholder="••••••••"
          required
        />
      </fieldset>

      <fieldset className="form-field">
        <legend>
          <strong>Konfirmasi password baru</strong>
          <span>Ketik ulang password baru di atas.</span>
        </legend>
        <input
          type="password"
          className="form-input"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          minLength={8}
          placeholder="••••••••"
          required
        />
      </fieldset>

      {next.length > 0 && confirm.length > 0 && next !== confirm ? (
        <p className="profile-form__hint" role="alert" style={{ color: "#c62828" }}>
          Password baru dan konfirmasinya belum sama.
        </p>
      ) : null}
      {status === "err" && errorMessage ? (
        <p className="login-error" role="alert">
          {errorMessage}
        </p>
      ) : null}
      {status === "ok" ? (
        <p className="profile-form__hint" role="status" style={{ color: "var(--brand-strong)" }}>
          <CheckIcon size={14} /> Password berhasil diganti.
        </p>
      ) : null}

      <div className="profile-form__actions">
        <button type="submit" className="button button--primary" disabled={!canSubmit || submitting}>
          {submitting ? "Memproses…" : "Ganti Password"}
          <ArrowRightIcon size={16} />
        </button>
      </div>
    </form>
  );
}
