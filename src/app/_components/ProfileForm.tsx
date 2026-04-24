"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Category } from "../../lib/content";
import { ArrowRightIcon, CheckIcon } from "./Icon";

type Role = "smp" | "sma" | "kuliah" | "guru" | "umum";
type TimeBudget = "singkat" | "sedang" | "banyak";
type Goal =
  | "paham-dasar"
  | "tugas-sekolah"
  | "produktivitas"
  | "bikin-tools"
  | "ajarin-orang"
  | "karir-ai";

const ROLE_OPTIONS: Array<{ value: Role; title: string; desc: string }> = [
  { value: "smp", title: "Pelajar SMP", desc: "Masih awal, butuh dasar yang santai." },
  { value: "sma", title: "Pelajar SMA", desc: "Siap belajar teknik + konsep yang lebih dalam." },
  { value: "kuliah", title: "Mahasiswa", desc: "Fokus ke aplikasi untuk kuliah & karir." },
  { value: "guru", title: "Guru / Fasilitator", desc: "Mau ngajarin AI ke kelas atau komunitas." },
  { value: "umum", title: "Pengen tahu saja", desc: "Nggak harus terikat konteks sekolah." }
];

const GOAL_OPTIONS: Array<{ value: Goal; title: string; desc: string }> = [
  {
    value: "paham-dasar",
    title: "Paham dasar AI",
    desc: "Pengen tahu apa itu AI, cara kerjanya, dan mengapa penting sekarang."
  },
  {
    value: "tugas-sekolah",
    title: "Pakai AI untuk tugas sekolah",
    desc: "Bikin tugas lebih cepat tanpa kehilangan kualitas belajar."
  },
  {
    value: "produktivitas",
    title: "Tingkatkan produktivitas harian",
    desc: "Template prompt, toolkit, workflow untuk pekerjaan & belajar."
  },
  {
    value: "bikin-tools",
    title: "Bikin tools AI sendiri",
    desc: "Pengen build aplikasi AI — chatbot, summarizer, assistant pribadi."
  },
  {
    value: "ajarin-orang",
    title: "Ajarin AI ke orang lain",
    desc: "Mau bawakan workshop AI ke sekolah, teman, atau komunitas."
  },
  {
    value: "karir-ai",
    title: "Siapkan karir di AI",
    desc: "Bangun pondasi literasi AI yang matang untuk 5 tahun ke depan."
  }
];

const TIME_OPTIONS: Array<{ value: TimeBudget; title: string; desc: string }> = [
  { value: "singkat", title: "< 2 jam / minggu", desc: "Fokus ke 1-2 modul pendek dulu." },
  { value: "sedang", title: "2 — 5 jam / minggu", desc: "Bisa ikuti 1 jalur sampai selesai." },
  { value: "banyak", title: "5+ jam / minggu", desc: "Bisa gabung beberapa jalur sekaligus." }
];

type Props = {
  categories: Category[];
};

export function ProfileForm({ categories }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [time, setTime] = useState<TimeBudget | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Prefill dari preference yang sudah pernah disimpan.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/onboarding/profile");
        if (!res.ok) return;
        const data = await res.json();
        const pref = data.preference;
        if (!pref || cancelled) return;
        if (pref.nickname) setName(pref.nickname);
        if (pref.learnerRole) setRole(pref.learnerRole as Role);
        if (pref.learningGoal) setGoal(pref.learningGoal as Goal);
        if (pref.timeBudget) setTime(pref.timeBudget as TimeBudget);
        if (Array.isArray(pref.interestsJson)) setInterests(pref.interestsJson as string[]);
      } catch {
        // abaikan
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleInterest = (slug: string) => {
    setInterests((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const canSubmit = role && goal && time && interests.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);

    // Simpan ke DB — kalau gagal, tetap lanjut ke rekomendasi (UX prioritas).
    try {
      await fetch("/api/onboarding/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: name.trim() || undefined,
          learnerRole: role,
          learningGoal: goal,
          timeBudget: time,
          interests,
        }),
      });
    } catch {
      // Abaikan — preferensi URL params tetap dipakai di halaman rekomendasi.
    }

    const params = new URLSearchParams();
    if (name.trim()) params.set("nama", name.trim());
    if (role) params.set("peran", role);
    if (goal) params.set("tujuan", goal);
    if (time) params.set("waktu", time);
    params.set("minat", interests.join(","));
    router.push(`/onboarding/rekomendasi?${params.toString()}`);
  };

  return (
    <form className="profile-form" onSubmit={handleSubmit} noValidate>
      <fieldset className="form-field">
        <legend>
          <strong>Panggilanmu</strong>
          <span>Cukup nama pendek atau nickname — biar pesan dari kami lebih personal.</span>
        </legend>
        <input
          type="text"
          className="form-input"
          placeholder="Misal: Sasa, Raka, atau nama lengkap"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          aria-label="Nama"
        />
      </fieldset>

      <fieldset className="form-field">
        <legend>
          <strong>Peran saat ini</strong>
          <span>Pilih salah satu yang paling mendekati kondisimu.</span>
        </legend>
        <div className="option-grid">
          {ROLE_OPTIONS.map((opt) => (
            <button
              type="button"
              key={opt.value}
              className={`option-card${role === opt.value ? " option-card--active" : ""}`}
              onClick={() => setRole(opt.value)}
              aria-pressed={role === opt.value}
            >
              <span className="option-card__check" aria-hidden="true">
                {role === opt.value ? <CheckIcon size={14} /> : null}
              </span>
              <span className="option-card__body">
                <strong>{opt.title}</strong>
                <span>{opt.desc}</span>
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="form-field">
        <legend>
          <strong>Tujuan belajar utama</strong>
          <span>Cukup pilih satu yang paling dominan. Bisa berubah kapan saja.</span>
        </legend>
        <div className="option-grid">
          {GOAL_OPTIONS.map((opt) => (
            <button
              type="button"
              key={opt.value}
              className={`option-card${goal === opt.value ? " option-card--active" : ""}`}
              onClick={() => setGoal(opt.value)}
              aria-pressed={goal === opt.value}
            >
              <span className="option-card__check" aria-hidden="true">
                {goal === opt.value ? <CheckIcon size={14} /> : null}
              </span>
              <span className="option-card__body">
                <strong>{opt.title}</strong>
                <span>{opt.desc}</span>
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="form-field">
        <legend>
          <strong>Minat kategori</strong>
          <span>Pilih 1 atau lebih. Akan kami pakai untuk susun rekomendasi awal.</span>
        </legend>
        <div className="option-grid">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat.slug}
              className={`option-card${interests.includes(cat.slug) ? " option-card--active" : ""}`}
              onClick={() => toggleInterest(cat.slug)}
              aria-pressed={interests.includes(cat.slug)}
            >
              <span className="option-card__check" aria-hidden="true">
                {interests.includes(cat.slug) ? <CheckIcon size={14} /> : null}
              </span>
              <span className="option-card__body">
                <strong>{cat.name}</strong>
                <span>{cat.tagline}</span>
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="form-field">
        <legend>
          <strong>Waktu belajar per minggu</strong>
          <span>Perkiraan saja. Kami bantu sesuaikan durasi modul.</span>
        </legend>
        <div className="option-grid option-grid--three">
          {TIME_OPTIONS.map((opt) => (
            <button
              type="button"
              key={opt.value}
              className={`option-card${time === opt.value ? " option-card--active" : ""}`}
              onClick={() => setTime(opt.value)}
              aria-pressed={time === opt.value}
            >
              <span className="option-card__check" aria-hidden="true">
                {time === opt.value ? <CheckIcon size={14} /> : null}
              </span>
              <span className="option-card__body">
                <strong>{opt.title}</strong>
                <span>{opt.desc}</span>
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="profile-form__actions">
        <Link className="button button--secondary" href="/onboarding/selamat-datang">
          Kembali
        </Link>
        <button
          type="submit"
          className="button button--primary"
          disabled={!canSubmit || submitting}
        >
          {submitting ? "Memproses..." : "Lihat Rekomendasi"}
          <ArrowRightIcon size={16} />
        </button>
      </div>
      {!canSubmit ? (
        <p className="profile-form__hint" role="status">
          Lengkapi peran, tujuan, minat, dan waktu belajar untuk lanjut.
        </p>
      ) : null}
    </form>
  );
}
