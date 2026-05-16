/**
 * Single source of truth for chapter targets — must stay in sync with
 * STORYBOARD.md (rev-2). Used by record.ts to pace each chapter and by
 * compose.py (via timestamps.json) to know where to place overlays.
 */

export type ChapterSpec = {
  num: number;
  title: string;
  targetMs: number;
  voScript: string;
};

export const CHAPTERS: ChapterSpec[] = [
  {
    num: 1,
    title: "Pembuka & Perkenalan Elsya",
    targetMs: 30_000,
    voScript:
      "Halo, Bapak dan Ibu Tutor! Selamat datang di Senopati Academy. " +
      "Perkenalkan, saya Elsya, pemandu virtual Bapak Ibu hari ini. " +
      "Saya akan menemani Anda berkeliling Senopati Academy, mengenal " +
      "fitur-fitur penting yang akan jadi teman mengajar sehari-hari — " +
      "dari dashboard tutor, mengelola modul Paham AI, hingga memimpin " +
      "live session yang seru. Tenang, saya pelan-pelan saja kok. Yuk, " +
      "kita mulai perjalanannya!",
  },
  {
    num: 2,
    title: "Login & Dashboard Tutor",
    targetMs: 30_000,
    voScript:
      "Login dengan akun tutor Anda menggunakan email dan kata sandi yang " +
      "diberikan tim Senopati. Setelah masuk, Bapak Ibu akan langsung tiba " +
      "di dashboard tutor. Di sini ada ringkasan tugas hari ini: modul yang " +
      "aktif, diskusi terbaru dari siswa, dan jadwal live session yang akan " +
      "datang. Semua dirancang biar Bapak Ibu langsung tahu apa yang harus " +
      "dikerjakan.",
  },
  {
    num: 3,
    title: "Tour Sidebar Navigation",
    targetMs: 30_000,
    voScript:
      "Di sebelah kiri ada sebelas menu utama. Mulai dari Modul Saya, Bahan " +
      "Ajar, Review Tugas, Live Session, Pesan, Siswa, Materi dan Soal, " +
      "Analitik, Cerita Interaktif, sampai Profil. Saya akan jelaskan " +
      "masing-masing satu per satu, jadi tenang aja kalau sekarang terasa " +
      "banyak — kita akan tour lengkap di chapter berikutnya.",
  },
  {
    num: 4,
    title: "Program Paham AI Overview",
    targetMs: 45_000,
    voScript:
      "Program perdana kami namanya Paham AI — workshop intensif satu hari " +
      "untuk siswa SMA dengan tagline \"Cerdas, Etis, Aman\". Pesertanya " +
      "berkumpul dari pagi sampai sore, belajar tatap muka langsung. Total " +
      "ada lima sesi terkurasi: dibuka dengan cerita interaktif Jeda yang " +
      "membangun emotional anchor lewat kisah Alya dan keluarganya, lalu " +
      "empat modul akademis — Introduction to AI sebagai dasar, Ethical " +
      "Use of AI untuk etika, AI Prompts 101 untuk praktik dengan kerangka " +
      "K-I-F-C, dan ditutup Fighting Hoax with AI untuk literasi digital. " +
      "Tugas tutor di Paham AI adalah memandu seluruh rangkaian live tatap " +
      "muka, memimpin diskusi, dan memastikan setiap siswa keluar workshop " +
      "dengan bekal yang konkret.",
  },
  {
    num: 5,
    title: "Modul Saya: Kelola Sesi",
    targetMs: 50_000,
    voScript:
      "Di menu Modul Saya, Bapak Ibu bisa lihat semua modul yang Anda ampu, " +
      "lengkap dengan statistik: berapa siswa yang aktif, tugas yang " +
      "menunggu review, dan thread diskusi yang belum dibaca. Klik salah " +
      "satu modul untuk masuk ke editor sesi. Di sini Anda bisa tambah " +
      "materi bacaan, sisipkan kuis di tengah pelajaran, dan atur urutan " +
      "sesi. Status \"Draft\" artinya siswa belum lihat — aman buat " +
      "eksperimen. Klik \"Terbitkan\" kalau materinya sudah siap.",
  },
  {
    num: 6,
    title: "Bahan Ajar: File & Versioning",
    targetMs: 30_000,
    voScript:
      "Menu Bahan Ajar adalah pusat penyimpanan semua slide, PDF, dan " +
      "handout yang Anda pakai mengajar. Upload sekali, pakai berkali-kali " +
      "di banyak modul. Setiap kali Anda upload versi baru, sistem otomatis " +
      "simpan riwayatnya — jadi kalau perlu balik ke versi sebelumnya, " +
      "tinggal klik.",
  },
  {
    num: 7,
    title: "Materi & Soal: Bikin Kuis",
    targetMs: 40_000,
    voScript:
      "Untuk membuat kuis, masuk ke menu Materi dan Soal. Bapak Ibu bisa " +
      "bikin soal pilihan ganda, isian singkat, atau pertanyaan terbuka. " +
      "Soal dikelompokkan berdasarkan tipe: Pretest untuk cek pengetahuan " +
      "awal, Posttest untuk evaluasi akhir, dan Open Q-and-A untuk diskusi " +
      "live. Soal yang Anda buat bisa dipakai ulang di banyak modul.",
  },
  {
    num: 8,
    title: "Review Tugas & IELTS Writing",
    targetMs: 45_000,
    voScript:
      "Setelah siswa mengumpulkan tugas atau kuis terbuka, mereka muncul di " +
      "menu Review Tugas — siap Bapak Ibu nilai. Klik tugas, baca jawaban " +
      "siswa, isi rubric, dan tulis feedback. Khusus untuk persiapan IELTS, " +
      "ada menu terpisah Review IELTS Writing dengan rubric resmi IELTS: " +
      "empat dimensi penilaian — Task Achievement, Coherence, Lexical " +
      "Resource, dan Grammatical Range — masing-masing dengan band score " +
      "sembilan poin.",
  },
  {
    num: 9,
    title: "Siswa & Diskusi: Pantau Siswa",
    targetMs: 45_000,
    voScript:
      "Di menu Siswa, Anda lihat semua siswa yang Bapak Ibu bimbing. Klik " +
      "nama siswa untuk masuk ke profil lengkap. Di sini Anda dapat data " +
      "rapi: scorecard pemahaman akademik, hasil RIASEC untuk eksplorasi " +
      "karir, ringkasan CV, dan riwayat lamaran kerja kalau siswa sudah " +
      "mulai melamar. Anda juga bisa download CV mereka langsung untuk " +
      "review. Di tab Diskusi, balas thread siswa secara personal.",
  },
  {
    num: 10,
    title: "Live Session: Schedule & Pelaksanaan",
    targetMs: 75_000,
    voScript:
      "Sekarang bagian paling seru — Live Session. Dari menu Live Session, " +
      "klik Jadwalkan Live Baru, isi judul, pilih modul, tentukan tanggal " +
      "dan tipe sesi: Workshop, Reguler, atau Q-and-A. Saat tiba waktunya, " +
      "Anda masuk ke ruang siaran. " +
      "Di room presenter, slide tampil di tengah, dan panel kanan untuk " +
      "chat dan tanya-jawab. Upload PDF slide dengan satu klik, lalu " +
      "navigasi dengan tombol panah. Mau kasih kuis di tengah pelajaran? " +
      "Tekan Push Quiz, pilih bank soal yang sudah Bapak Ibu siapkan, " +
      "kirim. Siswa langsung dapat notifikasi dan kuisnya muncul di layar " +
      "mereka. " +
      "Setelah selesai, klik Akhiri Sesi. Rekaman otomatis tersimpan, dan " +
      "sertifikat kelulusan siswa terbit otomatis kalau mereka memenuhi " +
      "kriteria.",
  },
  {
    num: 11,
    title: "Cerita Interaktif (Jeda)",
    targetMs: 35_000,
    voScript:
      "Cerita Interaktif adalah fitur khas Senopati Academy — dan kalau " +
      "Bapak Ibu masih ingat dari awal tadi, Jeda yang jadi pembuka " +
      "workshop Paham AI dikelola dari sini. Lewat menu ini, Anda bisa " +
      "lihat dan kelola cerita bercabang yang membantu siswa belajar dengan " +
      "cara naratif: siswa membuat pilihan, dan ceritanya berkembang sesuai " +
      "keputusan mereka. Cocok untuk mengajar empati, pengambilan " +
      "keputusan, dan literasi digital.",
  },
  {
    num: 12,
    title: "Pesan, Analitik, Profil & Penutup",
    targetMs: 40_000,
    voScript:
      "Untuk komunikasi privat dengan siswa, gunakan menu Pesan. Sementara " +
      "menu Analitik kasih Bapak Ibu gambaran besar performa siswa dan " +
      "modul yang Anda ampu. Profil Saya untuk update foto, bio, dan " +
      "keahlian Anda. Itu tour fitur tutor Senopati Academy. Kalau butuh " +
      "bantuan, hubungi tim support kami di halo@asksenopati.com. Selamat " +
      "mengajar dan terima kasih sudah jadi bagian dari Senopati!",
  },
];

export const TOTAL_TARGET_MS = CHAPTERS.reduce((s, c) => s + c.targetMs, 0);
