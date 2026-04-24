import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  SparklesIcon
} from "../../../../_components/Icon";
import { ProgressRing } from "../../../../_components/ProgressRing";
import { findModule } from "../../../../../lib/content";
import { getLatestFinalExamResult } from "../../../../../lib/progress-server";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const mod = findModule(slug);
  return {
    title: `Hasil Ujian · ${mod?.title ?? "Modul"}`,
    robots: { index: false, follow: false },
    alternates: { canonical: `/belajar/${slug}/ujian/hasil` }
  };
}

const BREAKDOWN = [
  {
    label: "Pemahaman konsep",
    percent: 88,
    note: "Konsep dasar dan analogi sudah kamu kuasai."
  },
  {
    label: "Penerapan praktis",
    percent: 78,
    note: "Sebagian besar kasus nyata bisa dipecahkan. Tetap latihan di kasus edge."
  },
  {
    label: "Etika & kesadaran risiko",
    percent: 92,
    note: "Jawaban kamu menunjukkan kesadaran kuat soal bias & privasi."
  },
  {
    label: "Prompt engineering",
    percent: 70,
    note: "Dasar prompt sudah rapi — teknik lanjutan bisa diasah lewat modul Praktis."
  }
];

export default async function ExamResultPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const mod = findModule(slug);
  if (!mod) notFound();

  // Prioritaskan hasil terakhir dari DB. Fallback ke query params (mis. user belum login / demo).
  const latest = await getLatestFinalExamResult(slug);
  const skor = latest?.score ?? Number(query.skor ?? 78) ?? 78;
  const lulus = latest ? latest.passed : (query.lulus as string | undefined) === "1" ? true : skor >= 70;
  const answers = (latest?.answersJson ?? {}) as Record<string, number>;
  const totalFromDb = latest ? Object.keys(answers).length : null;
  const total = totalFromDb ?? Number(query.total ?? 8) ?? 8;
  const benar = latest
    ? Math.round((skor / 100) * total)
    : Number(query.benar ?? 6) || 6;
  const attemptTime = latest?.submittedAt ? new Date(latest.submittedAt) : null;

  return (
    <main className="academy-shell learning-shell">
      <div className="container">
        <nav className="detail-breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span>/</span>
          <Link href={`/belajar/${mod.slug}`}>{mod.title}</Link>
          <span>/</span>
          <Link href={`/belajar/${mod.slug}/ujian`}>Ujian Akhir</Link>
          <span>/</span>
          <span>Hasil</span>
        </nav>

        <section
          className={`exam-result-hero${lulus ? " exam-result-hero--pass" : " exam-result-hero--fail"}`}
          aria-label="Ringkasan hasil"
        >
          <div>
            <p className="eyebrow eyebrow--brand">Hasil Ujian Akhir</p>
            <h1>
              {lulus ? "Selamat — kamu LULUS ujian akhir modul ini." : "Belum lolos, tapi tidak masalah."}
            </h1>
            <p className="lede">
              {lulus
                ? "Modul ini siap ditandai selesai. Langkah berikutnya: ambil sertifikat, beri review, lalu pilih modul selanjutnya."
                : "Passing score 70 belum tercapai. Review materi kelemahan di bawah, lalu coba lagi setelah 24 jam."}
            </p>
            <div className="exam-result-hero__meta">
              <span>
                <CheckIcon size={14} /> {benar} benar dari {total} soal
              </span>
              <span>
                <ClockIcon size={14} /> {attemptTime
                  ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(attemptTime)
                  : "Waktu pengerjaan 32 menit"}
              </span>
              <span>
                <SparklesIcon size={14} /> {latest ? "Attempt tersimpan" : "Attempt ke-1"}
              </span>
            </div>
          </div>
          <ProgressRing value={skor} size={180} label={lulus ? "Skor akhir" : "Belum lulus"} />
        </section>

        <section aria-label="Breakdown skor">
          <div className="section-heading">
            <p className="eyebrow">Breakdown Skor</p>
            <h2>Dari 4 dimensi pemahaman — mana yang kuat, mana yang perlu diasah</h2>
          </div>
          <ul className="exam-breakdown">
            {BREAKDOWN.map((item) => (
              <li key={item.label}>
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.percent}%</span>
                </div>
                <div className="active-progress-bar" aria-hidden="true">
                  <span style={{ width: `${item.percent}%` }} />
                </div>
                <p>{item.note}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Feedback mentor">
          <article className="exam-feedback">
            <p className="eyebrow">Feedback Mentor</p>
            <h2>Catatan dari {`[NAMA_MENTOR]`} untuk kamu</h2>
            <p>
              [Feedback personal dari mentor akan diisi otomatis berdasarkan jawabanmu. Contoh:
              "Kamu menunjukkan pemahaman yang baik terutama di konsep bias. Perlu ditingkatkan di
              penerapan prompt engineering — coba eksplor lebih banyak contoh di modul AI Prompts 101."]
            </p>
            <p>
              Mentor akan kirim feedback detail ke email terdaftar dalam 48 jam. Pantau kotak masuk
              ya.
            </p>
          </article>
        </section>

        <section aria-label="Langkah berikutnya">
          <div className="next-steps next-steps--result">
            <div>
              <p className="eyebrow eyebrow--brand">Langkah Berikutnya</p>
              <h2>{lulus ? "Kamu sudah lulus — ini jalur selanjutnya." : "Review dulu, lalu coba lagi."}</h2>
            </div>
            <ul>
              {lulus ? (
                <>
                  <li>
                    <strong>Ambil sertifikat</strong>
                    <p>Sertifikat resmi Senopati Academy siap diunduh atau dibagikan ke LinkedIn.</p>
                    <Link
                      className="button button--primary button--sm"
                      href={`/belajar/${mod.slug}/sertifikat`}
                    >
                      Buka Sertifikat
                      <ArrowRightIcon size={14} />
                    </Link>
                  </li>
                  <li>
                    <strong>Beri review modul</strong>
                    <p>Feedback kamu bantu mentor & peserta lain di masa depan.</p>
                    <Link
                      className="button button--secondary button--sm"
                      href={`/belajar/${mod.slug}/review`}
                    >
                      Isi Review
                    </Link>
                  </li>
                  <li>
                    <strong>Lihat rekomendasi modul berikutnya</strong>
                    <p>Jalur paling pas untuk dilanjutkan berdasarkan progress kamu.</p>
                    <Link
                      className="button button--secondary button--sm"
                      href={`/belajar/${mod.slug}/selesai`}
                    >
                      Lihat Rekomendasi
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <strong>Review materi kelemahan</strong>
                    <p>Fokus ke sesi terkait prompt engineering & penerapan praktis.</p>
                    <Link
                      className="button button--primary button--sm"
                      href={`/belajar/${mod.slug}`}
                    >
                      Buka Modul
                    </Link>
                  </li>
                  <li>
                    <strong>Coba ujian lagi 24 jam dari sekarang</strong>
                    <p>Waktu jeda membantu otak memproses. Tidak terburu-buru.</p>
                  </li>
                  <li>
                    <strong>Tanya di halaman diskusi</strong>
                    <p>Mentor dan peserta lain bisa bantu clarify konsep yang belum klik.</p>
                    <Link
                      className="button button--secondary button--sm"
                      href={`/belajar/${mod.slug}/diskusi`}
                    >
                      Buka Diskusi
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
