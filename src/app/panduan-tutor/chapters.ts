/**
 * Catalog 12 chapter walkthrough tutor Senopati Academy.
 * Sumber video: scripts/video-walkthrough/lipsync/char-NN.mp4 (Elsya talking
 * head 1080p dengan caption burnt-in), composed via compose.py.
 *
 * Video hosting:
 *   - Dev: server dari public/walkthrough/chapter-NN.mp4
 *   - Prod: dari MinIO/S3 — set NEXT_PUBLIC_WALKTHROUGH_BASE_URL ke
 *     https://asksenopati.com/senopati-media/walkthrough di
 *     .env.production.local supaya video di-stream langsung dari CDN.
 *
 * Kalau env var tidak di-set, fallback ke /walkthrough (relative path
 * yang resolve ke public/walkthrough/ untuk dev mode).
 */

const VIDEO_BASE =
  process.env.NEXT_PUBLIC_WALKTHROUGH_BASE_URL?.replace(/\/$/, "") || "/walkthrough";

const v = (filename: string) => `${VIDEO_BASE}/${filename}`;

export type Chapter = {
  num: number;
  title: string;
  durationSec: number;
  src: string;
};

export type Section = {
  title: string;
  chapters: Chapter[];
};

export const CHAPTERS: Chapter[] = [
  { num: 1, title: "Pembuka & Perkenalan Elsya", durationSec: 25, src: v("chapter-01.mp4") },
  { num: 2, title: "Login & Dashboard Tutor", durationSec: 30, src: v("chapter-02.mp4") },
  { num: 3, title: "Tour Sidebar Navigation", durationSec: 19, src: v("chapter-03.mp4") },
  { num: 4, title: "Program Paham AI Overview", durationSec: 48, src: v("chapter-04.mp4") },
  { num: 5, title: "Modul Saya: Pantau Modul yang Anda Ampu", durationSec: 46, src: v("chapter-05.mp4") },
  { num: 6, title: "Bahan Ajar: Library Kurasi Tim Pusat", durationSec: 29, src: v("chapter-06.mp4") },
  { num: 7, title: "Materi & Soal: Usulan Materi ke Kurasi", durationSec: 39, src: v("chapter-07.mp4") },
  { num: 8, title: "Review Tugas & IELTS Writing: Hasil Scoring AI", durationSec: 54, src: v("chapter-08.mp4") },
  { num: 9, title: "Siswa & Diskusi: Pantau Siswa", durationSec: 38, src: v("chapter-09.mp4") },
  { num: 10, title: "Live Session: Schedule, Presenter Room, End Session", durationSec: 76, src: v("chapter-10.mp4") },
  { num: 11, title: "Cerita Interaktif (Jeda)", durationSec: 28, src: v("chapter-11.mp4") },
  { num: 12, title: "Pesan, Analitik, Profil & Penutup", durationSec: 35, src: v("chapter-12.mp4") },
];

// Grouping yang masuk akal untuk side-panel — sama seperti Udemy course
// structure: dimulai dari pengantar, lanjut ke fitur inti, lalu eksplorasi
// dan penutup.
export const SECTIONS: Section[] = [
  {
    title: "Bagian 1 · Pengantar",
    chapters: CHAPTERS.slice(0, 3),
  },
  {
    title: "Bagian 2 · Modul & Konten",
    chapters: CHAPTERS.slice(3, 7),
  },
  {
    title: "Bagian 3 · Penilaian & Interaksi Siswa",
    chapters: CHAPTERS.slice(7, 10),
  },
  {
    title: "Bagian 4 · Fitur Lain & Penutup",
    chapters: CHAPTERS.slice(10, 12),
  },
];

export const TOTAL_DURATION_SEC = CHAPTERS.reduce((s, c) => s + c.durationSec, 0);

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return s > 0 ? `${m}m ${s}d` : `${m}m`;
}
