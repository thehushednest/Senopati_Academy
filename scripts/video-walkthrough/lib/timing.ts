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
      "paling aktif dipelajari beserta statistiknya, dan thread diskusi " +
      "terbaru dari siswa yang menunggu balasan. Untuk jadwal live session, " +
      "ada menu khusus di sebelah kiri yang akan kita kunjungi nanti. " +
      "Semuanya dirancang biar Bapak Ibu langsung tahu siapa yang butuh " +
      "perhatian.",
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
    title: "Modul Saya: Pantau Modul yang Anda Ampu",
    targetMs: 50_000,
    voScript:
      "Di menu Modul Saya, Bapak Ibu bisa lihat semua modul yang Anda ampu, " +
      "lengkap dengan statistik di bagian atas: total modul, siswa yang " +
      "aktif, tugas yang menunggu review, dan rata-rata penyelesaian " +
      "siswa. Klik salah satu modul untuk masuk ke detail — Anda dapat " +
      "lihat siapa saja siswa yang sedang mengerjakan modul itu, progress " +
      "mereka per sesi, thread diskusi yang muncul, dan tugas yang sudah " +
      "masuk. Konten modul — materi bacaan, kuis, urutan sesi — dikurasi " +
      "oleh tim pusat Senopati, jadi Bapak Ibu bisa fokus mengajar dan " +
      "mendampingi tanpa harus pusing soal pengelolaan konten. Kalau Anda " +
      "menemukan kebutuhan materi baru saat mengajar, ada menu khusus " +
      "untuk submit usulan ke tim kurasi yang akan kita lihat di chapter " +
      "berikutnya.",
  },
  {
    num: 6,
    title: "Bahan Ajar: Library Kurasi Tim Pusat",
    targetMs: 30_000,
    voScript:
      "Menu Bahan Ajar adalah library slide, PDF, dan handout yang sudah " +
      "disiapkan tim kurasi Senopati untuk modul yang Bapak Ibu ampu. " +
      "Tinggal download yang Anda perlukan untuk persiapan live session — " +
      "semua sudah konsisten dengan kurikulum resmi. Kalau Bapak Ibu " +
      "menemukan ada slide atau handout yang menurut Anda perlu di-update " +
      "atau ditambah berdasarkan pengalaman mengajar, kabari tim kurasi " +
      "lewat halo@asksenopati.com — mereka yang akan upload versi baru " +
      "dan kelola versioning-nya.",
  },
  {
    num: 7,
    title: "Materi & Soal: Usulan Materi ke Kurasi",
    targetMs: 40_000,
    voScript:
      "Menu Materi dan Soal adalah tempat Bapak Ibu lihat bank soal yang " +
      "sudah tersedia untuk modul Anda — pretest untuk cek pengetahuan " +
      "awal siswa, posttest untuk evaluasi akhir, dan kuis di tengah sesi " +
      "yang dipakai live. Soal-soal ini dikurasi oleh tim Senopati supaya " +
      "konsisten di seluruh angkatan Paham AI. Kalau Bapak Ibu menemukan " +
      "kebutuhan soal baru saat mengajar — misalnya konteks lokal yang " +
      "belum tercover atau topik yang sering bikin siswa bingung — klik " +
      "tombol Tambah Materi untuk submit usulan. Tim kurasi yang akan " +
      "menulis, review, dan publish jadi soal aktif.",
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
      "Di menu Siswa, Anda lihat semua siswa yang Bapak Ibu bimbing " +
      "beserta tier scorecard mereka — Pelajar Unggulan, Aktif, " +
      "Berkembang, atau Sedang Memulai. Klik nama siswa untuk profil " +
      "lengkap: breakdown lima kategori scorecard, riwayat modul " +
      "interaktif Jeda yang siswa mainkan, tugas-tugas terbaru, hasil " +
      "RIASEC untuk eksplorasi karir, ringkasan CV, dan tracker lamaran " +
      "kerja kalau siswa sudah mulai melamar. Anda juga bisa download CV " +
      "mereka langsung untuk feedback. Untuk komunikasi privat sama " +
      "siswa, ada menu Pesan yang akan kita bahas di akhir tour ini.",
  },
  {
    num: 10,
    title: "Live Session: Schedule, Presenter Room, End Session",
    targetMs: 75_000,
    voScript:
      "Sekarang bagian paling seru — Live Session. Dari menu Live Session, " +
      "klik Buat Live Session Baru, isi judul, pilih modul yang akan " +
      "diajar, set tanggal dan durasi, plus link meeting eksternal seperti " +
      "Zoom atau Google Meet kalau perlu. Saat tiba waktunya, Anda masuk " +
      "ke ruang presenter dengan join code enam digit yang sudah " +
      "digenerate otomatis untuk siswa. " +
      "Di ruang presenter, slide tampil di tengah dengan navigasi panah, " +
      "dan panel kanan punya chat live, tab tanya-jawab dengan voting " +
      "pertanyaan dari siswa, dan daftar kehadiran real-time. Mau kasih " +
      "kuis di tengah pelajaran? Tekan Push Quiz, pilih bank soal yang " +
      "sudah disiapkan, kirim — siswa di ruang yang sama langsung dapat " +
      "kuisnya muncul di layar mereka. " +
      "Setelah sesi selesai, klik Akhiri Sesi. Sistem otomatis catat " +
      "kehadiran siswa dan menaikkan progress modul mereka. Kalau Anda " +
      "merekam sesi via Zoom atau platform lain, Bapak Ibu bisa input " +
      "link rekamannya di halaman detail event nanti supaya siswa bisa " +
      "nonton ulang. Sertifikat modul terbit otomatis untuk siswa yang " +
      "nantinya lulus posttest — terpisah dari live session.",
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
      "Untuk komunikasi privat dengan siswa, gunakan menu Pesan. Menu " +
      "Analitik kasih Bapak Ibu gambaran besar performa: rata-rata nilai " +
      "ujian akhir siswa per modul, completion rate, dan tren keterlibatan " +
      "siswa. Profil Saya untuk update foto, bio, dan keahlian Anda — " +
      "informasi ini juga muncul di card mentor di halaman katalog modul. " +
      "Itu tour lengkap fitur tutor Senopati Academy. Kalau butuh bantuan " +
      "atau punya usulan materi, hubungi tim support kami di " +
      "halo@asksenopati.com. Selamat mengajar dan terima kasih sudah jadi " +
      "bagian dari Senopati!",
  },
];

export const TOTAL_TARGET_MS = CHAPTERS.reduce((s, c) => s + c.targetMs, 0);
