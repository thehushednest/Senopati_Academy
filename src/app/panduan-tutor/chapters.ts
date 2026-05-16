/**
 * Catalog 12 chapter walkthrough tutor Senopati Academy.
 * Sumber video: scripts/video-walkthrough/lipsync/char-NN.mp4 (Elsya talking
 * head 1080p dengan caption burnt-in).
 *
 * Untuk halaman /panduan-tutor — file MP4 di-mirror ke
 * public/walkthrough/chapter-NN.mp4 supaya bisa di-stream sebagai static
 * asset.
 */

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
  { num: 1, title: "Pembuka & Perkenalan Elsya", durationSec: 25, src: "/walkthrough/chapter-01.mp4" },
  { num: 2, title: "Login & Dashboard Tutor", durationSec: 30, src: "/walkthrough/chapter-02.mp4" },
  { num: 3, title: "Tour Sidebar Navigation", durationSec: 19, src: "/walkthrough/chapter-03.mp4" },
  { num: 4, title: "Program Paham AI Overview", durationSec: 48, src: "/walkthrough/chapter-04.mp4" },
  { num: 5, title: "Modul Saya: Pantau Modul yang Anda Ampu", durationSec: 46, src: "/walkthrough/chapter-05.mp4" },
  { num: 6, title: "Bahan Ajar: Library Kurasi Tim Pusat", durationSec: 29, src: "/walkthrough/chapter-06.mp4" },
  { num: 7, title: "Materi & Soal: Usulan Materi ke Kurasi", durationSec: 39, src: "/walkthrough/chapter-07.mp4" },
  { num: 8, title: "Review Tugas & IELTS Writing: Hasil Scoring AI", durationSec: 54, src: "/walkthrough/chapter-08.mp4" },
  { num: 9, title: "Siswa & Diskusi: Pantau Siswa", durationSec: 38, src: "/walkthrough/chapter-09.mp4" },
  { num: 10, title: "Live Session: Schedule, Presenter Room, End Session", durationSec: 76, src: "/walkthrough/chapter-10.mp4" },
  { num: 11, title: "Cerita Interaktif (Jeda)", durationSec: 28, src: "/walkthrough/chapter-11.mp4" },
  { num: 12, title: "Pesan, Analitik, Profil & Penutup", durationSec: 35, src: "/walkthrough/chapter-12.mp4" },
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
