export type Category = {
  slug: string;
  name: string;
  icon: "book" | "check" | "sparkles" | "pen" | "present";
  tagline: string;
  description: string;
  accent: "brand" | "accent" | "indigo" | "pink" | "blue";
};

export type Mentor = {
  slug: string;
  name: string;
  role: string;
  headline: string;
  bio: string;
  expertise: string[];
  moduleSlugs: string[];
  initials: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
};

export type Module = {
  slug: string;
  title: string;
  categorySlug: string;
  level: "Pemula" | "Menengah" | "Lanjutan";
  duration: string;
  topics: number;
  price: string;
  priceNumber: number;
  reviews: number;
  mentorSlug: string;
  excerpt: string;
  description: string;
  objectives: string[];
  syllabus: Array<{ title: string; summary: string }>;
  highlights: string[];
};

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  author: string;
  publishedAt: string;
  readingMinutes: number;
  body: string[];
};

export const CATEGORIES: Category[] = [
  {
    slug: "foundations",
    name: "Foundations",
    icon: "book",
    tagline: "Mulai dari sini — pahami AI dari nol",
    description:
      "Fondasi untuk siapa saja yang baru pertama kali dengar soal AI. Nggak perlu background teknis — kami mulai dari konsep dasar, sejarah, sampai contoh nyata di kehidupan sehari-hari.",
    accent: "brand"
  },
  {
    slug: "ethics-safety",
    name: "Ethics & Safety",
    icon: "check",
    tagline: "Gunakan AI dengan bijak dan bertanggung jawab",
    description:
      "AI powerful, tapi juga bisa disalahgunakan. Jalur ini membantumu memahami bias, privasi data, dan bagaimana jadi pengguna AI yang bertanggung jawab — terutama di konteks Indonesia.",
    accent: "accent"
  },
  {
    slug: "praktis",
    name: "Praktis",
    icon: "sparkles",
    tagline: "Langsung coba — AI untuk kehidupan nyata",
    description:
      "Modul hands-on untuk langsung dipraktikkan: nulis prompt, bikin presentasi, riset tugas, sampai produktivitas harian. Cocok buat yang pengen hasil cepat.",
    accent: "indigo"
  },
  {
    slug: "advanced-dev",
    name: "Advanced & Dev",
    icon: "pen",
    tagline: "Siap jadi pembuat AI, bukan sekadar pengguna",
    description:
      "Untuk yang pengen satu level lebih dalam — mulai dari API integration, membangun tools AI sendiri, sampai konsep fine-tuning. Butuh dasar Foundations sebelum masuk sini.",
    accent: "pink"
  },
  {
    slug: "teaching-training",
    name: "Teaching & Training",
    icon: "present",
    tagline: "Jadilah penggerak literasi AI di komunitasmu",
    description:
      "Kalau kamu ingin mengajar AI ke teman, adik, atau komunitas — jalur ini bahas cara desain workshop, teknik fasilitasi, dan membangun komunitas belajar AI.",
    accent: "blue"
  }
];

export const MENTORS: Mentor[] = [
  {
    slug: "arya-pratama",
    name: "[NAMA_MENTOR_1]",
    role: "Lead Mentor · Foundations Track",
    headline: "AI researcher yang fokus bikin konsep rumit jadi sederhana.",
    bio: "Mentor Foundations yang percaya belajar AI itu harus dimulai dari 'kenapa', bukan 'bagaimana'. Sebelum bergabung dengan Senopati Academy, ia aktif di riset AI Literacy di Senopati Strategic Institute dan menulis kolom rutin soal AI untuk pelajar Indonesia.",
    expertise: ["AI Fundamentals", "Machine Learning Concepts", "Literasi Digital"],
    moduleSlugs: [
      "introduction-to-ai",
      "how-ai-works",
      "history-of-ai",
      "ai-everyday-use-cases",
      "ai-vs-machine-learning"
    ],
    initials: "A",
    social: {
      twitter: "https://twitter.com",
      linkedin: "https://linkedin.com"
    }
  },
  {
    slug: "maya-hendrawan",
    name: "[NAMA_MENTOR_2]",
    role: "Mentor · Ethics & Safety Track",
    headline: "Peneliti kebijakan AI yang kritis soal bias dan privasi.",
    bio: "Mentor yang fokus ke sisi etis, kebijakan, dan dampak sosial AI. Kurikulumnya memasukkan konteks Indonesia — dari misinformation, deepfake, sampai privasi data pengguna remaja. Pengalaman riset kebijakan di Senopati Strategic Institute jadi bahan bakar utamanya.",
    expertise: ["AI Ethics", "Privacy & Data Governance", "Misinformation Studies"],
    moduleSlugs: [
      "ai-ethics-responsible-ai-use",
      "bias-in-ai",
      "privacy-and-data",
      "misinformation-and-deepfakes",
      "ai-in-indonesia-context"
    ],
    initials: "M",
    social: {
      linkedin: "https://linkedin.com"
    }
  },
  {
    slug: "reza-adityawan",
    name: "[NAMA_MENTOR_3]",
    role: "Mentor · Praktis Track",
    headline: "Praktisi AI tools yang kerjanya ngulik ratusan prompt setiap minggu.",
    bio: "Mentor paling produktif di Senopati Academy. Setiap modul Praktis yang ia bawakan datang langsung dari workflow kerjanya sendiri — dari menulis, riset, sampai bikin deck. Percaya bahwa belajar AI paling cepat ya dengan langsung dipakai di pekerjaan nyata.",
    expertise: ["Prompt Engineering", "AI for Productivity", "Content Workflow"],
    moduleSlugs: [
      "ai-prompts-101",
      "ai-for-writing",
      "ai-for-research",
      "ai-for-presentations",
      "ai-for-coding-basics",
      "ai-for-design",
      "ai-for-study-help",
      "ai-for-productivity",
      "ai-tools-comparison"
    ],
    initials: "R",
    social: {
      twitter: "https://twitter.com",
      linkedin: "https://linkedin.com",
      website: "https://asksenopati.com"
    }
  },
  {
    slug: "nadia-rizkya",
    name: "[NAMA_MENTOR_4]",
    role: "Mentor · Advanced & Dev Track",
    headline: "Engineer yang pernah build AI tooling internal untuk tim komunikasi strategis.",
    bio: "Mentor Advanced yang suka jembatani antara konsep AI dan implementasi nyata. Pernah bangun AI tooling internal yang dipakai tim editorial dan komunikasi strategis. Cocok buat kamu yang udah bisa sedikit ngoding dan mau naik level ke level pembuat.",
    expertise: ["API Integration", "AI App Prototyping", "Python"],
    moduleSlugs: [
      "building-your-first-ai-tool",
      "api-integration-basics",
      "fine-tuning-intro"
    ],
    initials: "N",
    social: {
      linkedin: "https://linkedin.com",
      website: "https://asksenopati.com"
    }
  },
  {
    slug: "cynthia-mahesa",
    name: "[NAMA_MENTOR_5]",
    role: "Mentor · Teaching & Training Track",
    headline: "Fasilitator literasi AI yang sering bawa workshop ke sekolah & komunitas.",
    bio: "Mentor yang percaya literasi AI harus menyebar, bukan cuma ada di satu tempat. Fokus ke kurikulum workshop, cara memfasilitasi diskusi, dan membangun komunitas belajar yang sustainable. Sudah puluhan kali membawakan workshop AI untuk pelajar SMP, SMA, dan mahasiswa.",
    expertise: ["Workshop Design", "Learning Facilitation", "Community Building"],
    moduleSlugs: [
      "teaching-ai-to-others",
      "creating-ai-workshops",
      "building-ai-communities"
    ],
    initials: "C",
    social: {
      linkedin: "https://linkedin.com"
    }
  }
];

const MODULE_TITLES: Record<string, string> = {
  "introduction-to-ai": "Introduction to AI",
  "how-ai-works": "How AI Works — Konsep di Balik Kotak Hitam",
  "history-of-ai": "History of AI — Dari Turing sampai ChatGPT",
  "ai-everyday-use-cases": "AI di Kehidupan Sehari-hari",
  "ai-vs-machine-learning": "AI vs Machine Learning — Apa Bedanya",
  "ai-ethics-responsible-ai-use": "AI Ethics & Responsible AI Use",
  "bias-in-ai": "Bias di AI — Kenapa Jawabannya Kadang Miring",
  "privacy-and-data": "Privacy & Data — Apa yang Dikasih ke AI",
  "misinformation-and-deepfakes": "Misinformation & Deepfakes",
  "ai-in-indonesia-context": "AI dalam Konteks Indonesia",
  "ai-prompts-101": "AI Prompts 101 — Cara Ngobrol yang Benar sama AI",
  "ai-for-writing": "AI untuk Menulis — Dari Blank Page ke Draft",
  "ai-for-research": "AI untuk Riset & Tugas Sekolah",
  "ai-for-presentations": "AI untuk Presentasi & Deck",
  "ai-for-coding-basics": "AI untuk Coding Dasar",
  "ai-for-design": "AI untuk Desain & Visual",
  "ai-for-study-help": "AI sebagai Teman Belajar",
  "ai-for-productivity": "AI untuk Produktivitas Harian",
  "ai-tools-comparison": "AI Tools Comparison — Pilih yang Pas",
  "building-your-first-ai-tool": "Building Your First AI Tool",
  "api-integration-basics": "API Integration Basics",
  "fine-tuning-intro": "Fine-tuning Intro — Kasih AI Gaya Kamu Sendiri",
  "teaching-ai-to-others": "Teaching AI to Others",
  "creating-ai-workshops": "Creating AI Workshops",
  "building-ai-communities": "Building AI Communities"
};

const LEVEL_MAP: Record<string, Module["level"]> = {
  "advanced-dev": "Lanjutan",
  "teaching-training": "Menengah",
  "ethics-safety": "Pemula",
  "praktis": "Pemula",
  "foundations": "Pemula"
};

const CATEGORY_MODULES: Record<string, string[]> = {
  foundations: [
    "introduction-to-ai",
    "how-ai-works",
    "history-of-ai",
    "ai-everyday-use-cases",
    "ai-vs-machine-learning"
  ],
  "ethics-safety": [
    "ai-ethics-responsible-ai-use",
    "bias-in-ai",
    "privacy-and-data",
    "misinformation-and-deepfakes",
    "ai-in-indonesia-context"
  ],
  praktis: [
    "ai-prompts-101",
    "ai-for-writing",
    "ai-for-research",
    "ai-for-presentations",
    "ai-for-coding-basics",
    "ai-for-design",
    "ai-for-study-help",
    "ai-for-productivity",
    "ai-tools-comparison"
  ],
  "advanced-dev": [
    "building-your-first-ai-tool",
    "api-integration-basics",
    "fine-tuning-intro"
  ],
  "teaching-training": [
    "teaching-ai-to-others",
    "creating-ai-workshops",
    "building-ai-communities"
  ]
};

const MENTOR_BY_MODULE: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const mentor of MENTORS) {
    for (const slug of mentor.moduleSlugs) {
      map[slug] = mentor.slug;
    }
  }
  return map;
})();

const EXCERPT_BASE: Record<string, string> = {
  "introduction-to-ai":
    "Nggak perlu background teknis. Modul ini jelasin apa itu AI, cara kerjanya, dan kenapa kamu perlu paham sekarang — bukan nanti.",
  "how-ai-works":
    "Apa sih yang sebenernya terjadi di 'dalam' AI? Modul ini bongkar konsep neural network, training, dan inference tanpa matematika yang bikin pusing.",
  "history-of-ai":
    "Dari mesin Turing sampai ChatGPT — perjalanan AI 70 tahun terakhir dirangkum dalam cerita yang gampang diikuti.",
  "ai-everyday-use-cases":
    "Spotify, Google Maps, sampai filter kamera Instagram — semua pakai AI. Modul ini buka mata kamu soal seberapa banyak AI yang udah kamu pakai tanpa sadar.",
  "ai-vs-machine-learning":
    "AI, Machine Learning, Deep Learning — istilah yang sering dicampur-campur. Modul ini jelasin bedanya dengan peta mental yang gampang diingat.",
  "ai-ethics-responsible-ai-use":
    "Belajar pakai AI dengan benar — kenali bias, pahami privasi data, dan jadi pengguna AI yang nggak gampang ditipu atau merugikan orang lain.",
  "bias-in-ai":
    "Kenapa jawaban AI kadang condong ke satu sisi? Modul ini bahas sumber bias di data training dan cara mengurangi dampaknya.",
  "privacy-and-data":
    "Setiap kali kamu ngetik ke ChatGPT, data kamu ke mana? Modul ini jawab pertanyaan privasi penting sebelum kamu terlalu nyaman pakai AI.",
  "misinformation-and-deepfakes":
    "AI bisa bikin foto, suara, dan video palsu yang mirip banget dengan aslinya. Modul ini ajarin cara mendeteksi dan nggak ikutan nyebar.",
  "ai-in-indonesia-context":
    "AI itu global, tapi dampaknya bisa beda di tiap negara. Modul ini bahas konteks AI untuk Indonesia — bahasa, budaya, sampai regulasi.",
  "ai-prompts-101":
    "Pelajari cara nulis instruksi ke AI yang hasilnya langsung berguna — bukan jawaban asal-asalan. Teknik zero-shot sampai chain-of-thought.",
  "ai-for-writing":
    "Cara pakai AI sebagai asisten menulis tanpa kehilangan suara kamu sendiri. Cocok buat penulis, jurnalis, atau siswa yang sering nulis esai.",
  "ai-for-research":
    "Bikin riset tugas atau proyek jadi lebih cepat tanpa kompromi kualitas. Teknik prompt untuk riset, summarization, dan cross-check sumber.",
  "ai-for-presentations":
    "Dari outline ke slide jadi dalam 30 menit. Modul ini ajarin alur pakai AI untuk bantu struktur deck, copy, dan bahkan visual suggestion.",
  "ai-for-coding-basics":
    "Buat yang baru mulai ngoding, AI bisa jadi tutor 24 jam. Modul ini ajarin cara minta bantuan coding ke AI tanpa jadi malas berpikir sendiri.",
  "ai-for-design":
    "Punya ide visual tapi nggak bisa gambar? AI bisa bantu. Modul ini eksplorasi tools image generation dan cara kasih brief yang jelas.",
  "ai-for-study-help":
    "Belajar topik sulit lebih cepat dengan AI sebagai guru privat. Teknik Feynman, quiz-generation, sampai spaced repetition dengan AI.",
  "ai-for-productivity":
    "Template prompt untuk bantu kelola inbox, jadwal, dan catatan harian. Bikin hari kamu lebih ringan tanpa jadi ketergantungan.",
  "ai-tools-comparison":
    "ChatGPT, Claude, Gemini, Copilot — mana yang paling pas buat kebutuhanmu? Modul ini kasih framework untuk bandingin secara objektif.",
  "building-your-first-ai-tool":
    "Langsung bikin AI tool kecil yang jalan: chatbot, summarizer, atau helper pribadi. Modul ini pakai no-code & low-code tooling.",
  "api-integration-basics":
    "Hubungin AI ke aplikasi kamu pakai API. Dasar autentikasi, request, dan handling response — dengan contoh Python sederhana.",
  "fine-tuning-intro":
    "Bikin AI yang ngerti gaya kamu sendiri. Modul ini kenalin konsep fine-tuning, kapan dipakai, dan kapan cukup pakai prompt saja.",
  "teaching-ai-to-others":
    "Struktur yang dipakai mentor Senopati Academy buat ngajarin AI ke pelajar SMP/SMA. Cocok buat guru, kakak kelas, atau fasilitator.",
  "creating-ai-workshops":
    "Desain workshop AI 2-jam atau full-day. Dari menentukan tujuan, ice breaker, sampai praktik yang bikin peserta aktif ngoding prompt.",
  "building-ai-communities":
    "Komunitas belajar AI yang sustainable butuh lebih dari sekadar grup WhatsApp. Modul ini bahas pola komunitas belajar yang sehat."
};

function buildSyllabus(slug: string, topics: number): Module["syllabus"] {
  const baseTopics = topics;
  return Array.from({ length: baseTopics }).map((_, idx) => ({
    title: `Sesi ${String(idx + 1).padStart(2, "0")} · [JUDUL_SESI_${idx + 1}]`,
    summary:
      "[Deskripsi sesi akan diisi oleh tim editorial Senopati Academy. Mencakup tujuan, aktivitas, dan output yang diharapkan dari peserta.]"
  }));
}

function buildObjectives(slug: string): string[] {
  return [
    "Memahami konsep dasar dan istilah-istilah penting pada modul ini",
    "Bisa menerapkan teknik yang diajarkan di kasus nyata sehari-hari",
    "Mengenali kapan harus pakai AI dan kapan tidak",
    "Punya output nyata yang bisa ditambahkan ke portofolio belajar"
  ];
}

function buildHighlights(): string[] {
  return [
    "Akses seumur hidup ke materi modul",
    "Challenge praktik di setiap sesi",
    "Template dan contoh prompt siap pakai",
    "Q&A dengan mentor saat live session"
  ];
}

function topicsForCategory(slug: string): number {
  if (slug === "praktis") return 6;
  if (slug === "advanced-dev") return 8;
  if (slug === "teaching-training") return 5;
  if (slug === "ethics-safety") return 5;
  return 5;
}

export const MODULES: Module[] = Object.entries(CATEGORY_MODULES).flatMap(
  ([categorySlug, slugs]) =>
    slugs.map((slug, idx) => {
      const topics = topicsForCategory(categorySlug);
      return {
        slug,
        title: MODULE_TITLES[slug],
        categorySlug,
        level: LEVEL_MAP[categorySlug],
        duration: "[DURASI]",
        topics,
        price: "[HARGA]",
        priceNumber: 0,
        reviews: 18 + ((idx + 1) * 7) % 60,
        mentorSlug: MENTOR_BY_MODULE[slug],
        excerpt: EXCERPT_BASE[slug],
        description:
          EXCERPT_BASE[slug] +
          " Materi disusun supaya mudah dipahami walau belum punya background AI sebelumnya. Setiap sesi dilengkapi challenge praktik dan contoh nyata dari konteks Indonesia.",
        objectives: buildObjectives(slug),
        syllabus: buildSyllabus(slug, topics),
        highlights: buildHighlights()
      };
    })
);

export const ARTICLES: Article[] = [
  {
    slug: "ai-bukan-cuma-buat-programmer",
    title: "AI Bukan Cuma Buat Programmer — Kenapa Pelajar Juga Harus Tahu",
    excerpt:
      "Dulu AI identik dengan ruang kelas Ilmu Komputer. Sekarang, nggak paham AI sama aja kayak nggak bisa pakai Google di awal 2000-an.",
    tag: "Literasi",
    author: "[NAMA_PENULIS_1]",
    publishedAt: "2026-03-12",
    readingMinutes: 5,
    body: [
      "Lima tahun lalu, kalau kamu bilang akan belajar AI, orang akan langsung mikir kamu harus ngoding, pakai Python, dan mungkin baca banyak paper. Sekarang, AI sudah bukan lagi cuma urusan programmer.",
      "ChatGPT, Gemini, Claude — hampir semua pelajar SMA hari ini pernah dengar atau malah pakai salah satunya. Tapi pakai bukan berarti paham. Dan di sinilah masalahnya dimulai.",
      "Memahami AI bukan soal bisa bikin model sendiri. Ini soal tahu kapan percaya, kapan curiga, dan kapan harus double-check. Itu skill yang relevan buat semua orang — bukan cuma yang bakal jadi engineer.",
      "Senopati Academy didesain untuk memecahkan literasi ini jadi 25 modul yang bisa dicerna siapa saja: pelajar SMP, SMA, mahasiswa, bahkan guru. Tanpa gate teknis yang bikin orang merasa 'ini bukan buat saya'.",
      "Kalau hari ini kamu belum mulai paham AI, besok itu jadi PR yang makin berat. Mulai dari modul Foundations — gratis untuk dicoba 10 menit pertama."
    ]
  },
  {
    slug: "cara-nulis-prompt-biar-hasil-ai-relevan",
    title: "Cara Nulis Prompt Biar Hasil AI Relevan, Bukan Random",
    excerpt:
      "Prompt yang baik nggak harus panjang. Tapi harus punya 4 elemen ini — context, task, constraint, format.",
    tag: "Panduan",
    author: "[NAMA_PENULIS_2]",
    publishedAt: "2026-03-08",
    readingMinutes: 7,
    body: [
      "Salah satu keluhan paling sering tentang AI: 'Jawabannya asal-asalan, nggak sesuai maksud saya.' Ternyata, seringkali bukan AI-nya yang bodoh — promptnya yang kurang spesifik.",
      "Framework sederhana yang kami ajarkan di modul Prompts 101 punya empat komponen: Context, Task, Constraint, dan Format. Kami sebutnya CTCF.",
      "Context: kasih tahu AI siapa kamu, untuk siapa output ini, dan situasinya apa. Task: apa yang kamu mau AI kerjakan. Constraint: batasan — misal panjang, nada bahasa, atau apa yang harus dihindari. Format: output yang kamu mau — bullet points, tabel, paragraf, atau kode.",
      "Contoh sebelum CTCF: 'Tulis esai tentang pemanasan global.' Hasilnya? Generik. Contoh setelah CTCF: 'Saya pelajar SMA kelas 11. Tolong tulis esai tentang pemanasan global untuk lomba karya ilmiah tingkat kota. Maksimal 500 kata, bahasa formal tapi tidak kaku, hindari istilah yang terlalu teknis. Format: pembuka, 3 argumen utama, penutup.'",
      "Output kedua jauh lebih relevan karena AI punya gambaran lengkap. Coba sekarang — tulis ulang prompt terakhir kamu dengan CTCF dan lihat bedanya."
    ]
  },
  {
    slug: "bias-ai-dan-kenapa-penting-di-konteks-indonesia",
    title: "Bias AI dan Kenapa Ini Penting Banget di Konteks Indonesia",
    excerpt:
      "Data training AI didominasi konten berbahasa Inggris dari dunia barat. Efeknya bisa diam-diam memengaruhi cara kita berpikir.",
    tag: "Etika",
    author: "[NAMA_PENULIS_3]",
    publishedAt: "2026-02-28",
    readingMinutes: 6,
    body: [
      "Kalau kamu tanya ChatGPT soal makanan khas Indonesia, jawabannya mungkin lumayan. Tapi kalau kamu tanya soal nilai budaya daerah tertentu, jawabannya sering kali generic atau bahkan salah. Kenapa?",
      "Sederhananya: model AI belajar dari teks yang dia baca saat training. Mayoritas teks di internet berbahasa Inggris, ditulis oleh orang Amerika Utara dan Eropa. Perspektif Indonesia cuma sebagian kecil dari seluruh data itu.",
      "Ini bukan teori konspirasi — ini fakta teknis. Dan dampaknya terasa: rekomendasi yang kurang pas, contoh yang asing dengan budaya kita, bahkan stereotip halus yang nggak sengaja masuk ke jawaban AI.",
      "Modul Ethics & Safety Senopati Academy membedah bias AI dengan contoh konkret dari konteks Indonesia. Bukan untuk bikin kamu anti-AI, tapi biar kamu pakai dengan mata terbuka.",
      "Fondasinya sederhana: AI itu alat bantu, bukan oracle. Pertanyaan yang benar bukan 'apa kata AI?', tapi 'apa yang AI bilang dan apakah itu lengkap?'"
    ]
  },
  {
    slug: "5-cara-pakai-ai-untuk-tugas-sekolah-tanpa-jadi-malas",
    title: "5 Cara Pakai AI untuk Tugas Sekolah Tanpa Jadi Malas Berpikir",
    excerpt:
      "Bukan soal copy-paste jawaban. Ada teknik pakai AI yang justru bikin kamu lebih ngerti materi, bukan sebaliknya.",
    tag: "Panduan",
    author: "[NAMA_PENULIS_4]",
    publishedAt: "2026-02-20",
    readingMinutes: 5,
    body: [
      "Banyak orang tua dan guru khawatir AI bikin pelajar malas berpikir. Ketakutan yang wajar — tapi bisa dihindari kalau caranya benar.",
      "Pertama, pakai AI sebagai lawan debat. Minta AI bikin argumen menentang pendapat kamu di esai, lalu kamu bantah balik. Hasil akhirnya? Esai yang jauh lebih kuat.",
      "Kedua, pakai AI sebagai tutor. Setiap kali nggak ngerti, minta AI jelasin dengan analogi. Tapi jangan berhenti di situ — coba jelasin balik ke AI untuk mastiin kamu beneran paham.",
      "Ketiga, pakai AI sebagai pembuat kuis. Habis baca bab, minta AI bikin 10 pertanyaan, lalu jawab. Teknik ini disebut active recall, dan salah satu metode belajar paling efektif.",
      "Keempat, pakai AI untuk rangkum sebelum ujian. Kasih catatan kamu, minta AI susun ulang jadi peta konsep. Kelima, pakai AI untuk simulasi wawancara — cocok buat latihan presentasi atau beasiswa.",
      "Intinya: AI sebagai sparring partner, bukan pengganti otak. Modul AI for Study Help di Senopati Academy bahas lebih detail setiap teknik di atas."
    ]
  },
  {
    slug: "ai-dan-masa-depan-kerja-di-indonesia",
    title: "AI dan Masa Depan Kerja di Indonesia — Apa yang Perlu Disiapkan?",
    excerpt:
      "Beberapa pekerjaan berubah, sebagian hilang, banyak yang baru muncul. Pertanyaannya bukan 'apakah AI ngaruh' — tapi 'sudah siap belum?'",
    tag: "Karir",
    author: "[NAMA_PENULIS_5]",
    publishedAt: "2026-02-12",
    readingMinutes: 8,
    body: [
      "Laporan McKinsey, World Economic Forum, dan banyak lembaga lain konsisten menyebut: AI akan mengubah sebagian besar pekerjaan dalam 5-10 tahun ke depan. Pertanyaannya: apa yang perlu kamu siapkan mulai sekarang?",
      "Jawaban pertama bukan 'belajar ngoding semua'. Yang paling penting justru literasi dasar — pemahaman apa AI bisa dan tidak bisa. Kamu nggak harus bikin AI, tapi kamu harus tahu cara menggunakannya dengan efektif.",
      "Kedua: skill yang 'komplemen' dengan AI akan lebih bernilai. Berpikir kritis, kreativitas, komunikasi antar-manusia, domain expertise — semua ini justru naik nilainya karena AI bisa handle sisa pekerjaan yang lebih rutin.",
      "Ketiga: adaptasi cepat. Tools baru muncul tiap bulan. Yang penting bukan menguasai satu tool, tapi punya kerangka belajar yang cepat untuk adopsi tools baru.",
      "Keempat: konteks Indonesia. Banyak pekerjaan di Indonesia yang butuh pemahaman lokal — bahasa, budaya, hukum. Di sini posisi kamu kuat, karena AI global seringkali kurang ngerti konteks ini.",
      "Fondasi dari semua ini adalah literasi AI yang solid. Mulai dari modul Foundations, lalu lanjut ke jalur yang paling relevan dengan rencana karirmu."
    ]
  },
  {
    slug: "privasi-data-saat-pakai-ai-yang-perlu-kamu-tahu",
    title: "Privasi Data Saat Pakai AI — Yang Perlu Kamu Tahu Sebelum Terlalu Nyaman",
    excerpt:
      "Setiap kali kamu paste sesuatu ke ChatGPT, data kamu jadi bagian dari sesuatu. Ini cara pakai AI tanpa kehilangan privasi.",
    tag: "Etika",
    author: "[NAMA_PENULIS_6]",
    publishedAt: "2026-02-04",
    readingMinutes: 6,
    body: [
      "Semakin sering kita pakai AI, semakin banyak data pribadi yang kita kasih. Tapi pernah kepikiran nggak, data itu ke mana perginya?",
      "Sebagian besar layanan AI menyimpan conversation history untuk peningkatan model. Ada yang transparan soal ini, ada yang samar-samar. Kamu perlu tahu cara membedakannya.",
      "Aturan dasarnya: jangan paste data sensitif ke layanan AI konsumer. Termasuk nomor identitas, password, data medis, atau informasi rahasia perusahaan. Kalau memang harus, pakai mode private/incognito atau layanan enterprise dengan kontrak privasi.",
      "Untuk kebutuhan belajar dan kerja sehari-hari, biasanya tidak perlu data sensitif. Latih dirimu untuk abstract — ganti nama asli dengan placeholder, kode NIK jadi '[ID]', dst.",
      "Modul Privacy & Data di Senopati Academy bahas lebih dalam — termasuk cara baca privacy policy layanan AI yang suka panjang dan membingungkan."
    ]
  }
];

export type SessionRow = {
  index: number;
  title: string;
  summary: string;
  durationMinutes: number;
  status: "done" | "active" | "locked";
};

export type ActiveModuleSample = {
  moduleSlug: string;
  completed: number;
  total: number;
  percent: number;
  nextSession: string;
  lastActivity: string;
  estimatedFinish: string;
};

export type DiscussionThread = {
  id: string;
  moduleSlug: string;
  sessionIndex?: number;
  author: string;
  initials: string;
  title: string;
  body: string;
  replies: number;
  likes: number;
  lastActivity: string;
};

export type AchievementItem = {
  slug: string;
  title: string;
  description: string;
  status: "earned" | "in-progress" | "locked";
  progress?: string;
};

export type DailyActivity = {
  day: string;
  minutes: number;
};

export function buildSessions(mod: Module, progressCount = 0): SessionRow[] {
  return mod.syllabus.map((row, idx) => {
    let status: SessionRow["status"] = "locked";
    if (idx < progressCount) status = "done";
    else if (idx === progressCount) status = "active";
    const durationMinutes = 14 + ((idx + mod.slug.length) % 4) * 4;
    return {
      index: idx,
      title: row.title,
      summary: row.summary,
      durationMinutes,
      status
    };
  });
}

export const ACTIVE_LEARNER_NAME = "[NAMA_PELAJAR]";

export const ACTIVE_MODULES: ActiveModuleSample[] = [
  {
    moduleSlug: "introduction-to-ai",
    completed: 3,
    total: 5,
    percent: 60,
    nextSession: "Sesi 04 · [JUDUL_SESI_4]",
    lastActivity: "2026-04-15",
    estimatedFinish: "3 hari lagi"
  },
  {
    moduleSlug: "ai-prompts-101",
    completed: 2,
    total: 6,
    percent: 33,
    nextSession: "Sesi 03 · [JUDUL_SESI_3]",
    lastActivity: "2026-04-13",
    estimatedFinish: "1 minggu lagi"
  },
  {
    moduleSlug: "ai-ethics-responsible-ai-use",
    completed: 1,
    total: 5,
    percent: 20,
    nextSession: "Sesi 02 · [JUDUL_SESI_2]",
    lastActivity: "2026-04-10",
    estimatedFinish: "2 minggu lagi"
  }
];

export function getActiveModuleProgress(slug: string) {
  return ACTIVE_MODULES.find((m) => m.moduleSlug === slug);
}

export const DISCUSSION_THREADS: DiscussionThread[] = [
  {
    id: "t-1",
    moduleSlug: "introduction-to-ai",
    sessionIndex: 1,
    author: "[NAMA_PELAJAR_1]",
    initials: "R",
    title: "Bingung bedanya AI dan automation — ada yang bisa jelasin?",
    body: "Di sesi 02 disebutkan AI bukan sekadar automation, tapi saya masih belum nangkep perbedaannya di praktek. Ada contoh konkret yang gampang dipahami?",
    replies: 5,
    likes: 12,
    lastActivity: "3 jam lalu"
  },
  {
    id: "t-2",
    moduleSlug: "introduction-to-ai",
    sessionIndex: 2,
    author: "[NAMA_PELAJAR_2]",
    initials: "S",
    title: "Challenge sesi 02 jawabannya tergantung konteks?",
    body: "Saya coba challenge kedua, tapi jawaban AI-nya berubah-ubah walaupun promptnya sama. Ini normal nggak?",
    replies: 3,
    likes: 7,
    lastActivity: "Kemarin"
  },
  {
    id: "t-3",
    moduleSlug: "introduction-to-ai",
    author: "[NAMA_PELAJAR_3]",
    initials: "M",
    title: "Saran resource tambahan buat yang mau lanjut setelah Foundations?",
    body: "Setelah selesai Foundations, idealnya lanjut ke Ethics atau Praktis? Apakah tergantung tujuan?",
    replies: 8,
    likes: 18,
    lastActivity: "2 hari lalu"
  }
];

export function threadsForModule(slug: string) {
  return DISCUSSION_THREADS.filter((t) => t.moduleSlug === slug);
}

export const DASHBOARD_STATS = {
  sessionsCompleted: 12,
  totalSessions: 32,
  hoursLearned: 8.5,
  currentStreak: 6,
  weeklyMinutes: [
    { day: "Sen", minutes: 45 },
    { day: "Sel", minutes: 30 },
    { day: "Rab", minutes: 60 },
    { day: "Kam", minutes: 20 },
    { day: "Jum", minutes: 75 },
    { day: "Sab", minutes: 0 },
    { day: "Min", minutes: 40 }
  ] as DailyActivity[]
};

export const ACHIEVEMENTS: AchievementItem[] = [
  {
    slug: "first-session",
    title: "Sesi Pertama",
    description: "Selesaikan sesi pertama di modul apa pun.",
    status: "earned"
  },
  {
    slug: "prompt-master",
    title: "Prompt Master",
    description: "Selesaikan modul AI Prompts 101.",
    status: "in-progress",
    progress: "2/6 sesi"
  },
  {
    slug: "week-streak",
    title: "7 Hari Beruntun",
    description: "Belajar 7 hari berturut-turut.",
    status: "in-progress",
    progress: "6/7 hari"
  },
  {
    slug: "foundations-graduate",
    title: "Foundations Graduate",
    description: "Tuntaskan seluruh 5 modul di jalur Foundations.",
    status: "in-progress",
    progress: "1/5 modul"
  },
  {
    slug: "community-helper",
    title: "Community Helper",
    description: "Bantu 10 orang di halaman diskusi.",
    status: "locked"
  },
  {
    slug: "ai-builder",
    title: "AI Builder",
    description: "Selesaikan challenge akhir di modul Building Your First AI Tool.",
    status: "locked"
  }
];

export const CATEGORY_PROGRESS = [
  { slug: "foundations", percent: 60 },
  { slug: "ethics-safety", percent: 20 },
  { slug: "praktis", percent: 22 },
  { slug: "advanced-dev", percent: 0 },
  { slug: "teaching-training", percent: 0 }
];

export const QUIZ_SAMPLE = [
  {
    id: "q1",
    question: "Apa perbedaan mendasar AI dengan program biasa?",
    options: [
      "AI selalu lebih cepat daripada program biasa",
      "AI belajar dari data, program biasa mengikuti aturan statis",
      "AI hanya bekerja di internet",
      "Program biasa tidak butuh listrik"
    ],
    correct: 1,
    explanation:
      "AI dilatih dari data dan bisa menghasilkan output yang tidak diprogram secara eksplisit. Program biasa mengikuti aturan statis yang ditulis manusia."
  },
  {
    id: "q2",
    question: "Manakah contoh penggunaan AI dalam kehidupan sehari-hari?",
    options: [
      "Autocomplete email",
      "Rekomendasi video di platform streaming",
      "Face unlock di smartphone",
      "Semua jawaban benar"
    ],
    correct: 3,
    explanation:
      "Semua contoh di atas menggunakan teknologi AI — dari NLP, sistem rekomendasi, sampai computer vision."
  },
  {
    id: "q3",
    question: "Kenapa bias bisa muncul di hasil AI?",
    options: [
      "AI punya opini sendiri",
      "Data training AI mencerminkan pola di data — termasuk bias di dalamnya",
      "Internet dirancang bias",
      "Developer AI selalu bias"
    ],
    correct: 1,
    explanation:
      "AI belajar dari data. Kalau data training punya bias, model akan mereproduksi bias tersebut. Bukan AI yang 'punya opini', tapi pola dari datanya."
  },
  {
    id: "q4",
    question: "Apa gunanya memahami cara AI bekerja, bukan hanya memakainya?",
    options: [
      "Supaya bisa jadi programmer",
      "Supaya tahu batas, risiko, dan kapan percaya jawabannya",
      "Biar bisa bikin AI sendiri tanpa belajar coding",
      "Tidak ada gunanya"
    ],
    correct: 1,
    explanation:
      "Memahami cara kerja AI membantu kita tahu kapan output-nya bisa dipercaya, kapan harus curiga, dan bagaimana mendapatkan hasil yang lebih baik."
  }
];

export type ExamQuestion = {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  weight?: number;
};

export const FINAL_EXAM_SAMPLE: ExamQuestion[] = [
  {
    id: "e1",
    question: "Mana yang paling tepat menggambarkan definisi AI?",
    options: [
      "Robot yang bisa bergerak sendiri",
      "Sistem yang belajar dari data untuk mengerjakan tugas yang biasanya butuh kecerdasan manusia",
      "Komputer yang sangat cepat",
      "Algoritma yang selalu menghasilkan jawaban benar"
    ],
    correct: 1,
    explanation:
      "AI adalah sistem yang belajar dari data untuk mengerjakan tugas yang biasanya memerlukan kecerdasan manusia — seperti memahami bahasa, mengenali gambar, atau mengambil keputusan.",
    weight: 10
  },
  {
    id: "e2",
    question: "Apa yang dimaksud dengan training data dalam konteks AI?",
    options: [
      "Data yang dipakai untuk menguji kecepatan komputer",
      "Kumpulan contoh yang dipakai untuk 'mengajari' model AI mengenali pola",
      "Data rahasia yang tidak boleh dilihat publik",
      "File konfigurasi sistem"
    ],
    correct: 1,
    explanation:
      "Training data adalah kumpulan contoh yang dipakai untuk melatih model AI mengenali pola. Kualitas dan keberagaman data ini sangat mempengaruhi hasil model.",
    weight: 10
  },
  {
    id: "e3",
    question: "Kenapa prompt yang spesifik menghasilkan output AI yang lebih baik?",
    options: [
      "AI bisa membaca pikiran jika promptnya detail",
      "Prompt spesifik memberi AI konteks yang lebih jelas untuk menentukan output",
      "Prompt panjang selalu lebih baik",
      "Tidak ada bedanya"
    ],
    correct: 1,
    explanation:
      "Prompt spesifik memberi konteks lebih jelas: siapa kamu, tujuannya apa, format output yang diinginkan, dan batasan-batasan yang harus dipatuhi.",
    weight: 10
  },
  {
    id: "e4",
    question: "Bias di AI utamanya berasal dari…",
    options: [
      "Keputusan pribadi developer",
      "Pola yang ada di data training",
      "Sistem operasi yang dipakai",
      "Cuaca saat model dilatih"
    ],
    correct: 1,
    explanation:
      "Model AI belajar dari pola di data. Kalau data training punya bias (misal: over-representasi satu grup demografi), model akan mereproduksi bias tersebut.",
    weight: 10
  },
  {
    id: "e5",
    question: "Apa prinsip paling penting saat pakai AI untuk tugas sekolah?",
    options: [
      "Copy-paste jawaban langsung dari AI",
      "Gunakan AI sebagai tutor — verifikasi dan pahami, jangan sekadar pakai outputnya mentah-mentah",
      "Jangan pernah pakai AI",
      "Minta AI mengerjakan semua"
    ],
    correct: 1,
    explanation:
      "AI paling bermanfaat ketika dipakai sebagai tutor atau sparring partner: pahami konsepnya, verifikasi jawabannya, dan bangun pemahaman kamu sendiri.",
    weight: 10
  },
  {
    id: "e6",
    question: "Apa yang harus kamu lakukan sebelum paste data pribadi ke layanan AI publik?",
    options: [
      "Langsung paste — tidak ada risiko",
      "Baca privacy policy layanan dan pertimbangkan anonimisasi data",
      "Tulis di blog terlebih dahulu",
      "Minta izin ke AI"
    ],
    correct: 1,
    explanation:
      "Sebelum paste data sensitif, baca privacy policy. Untuk data yang sangat pribadi (ID, password, data medis), lebih baik dianonimkan atau jangan di-paste sama sekali.",
    weight: 10
  },
  {
    id: "e7",
    question: "Mana yang bukan karakteristik chain-of-thought prompting?",
    options: [
      "Meminta AI menjelaskan langkah berpikirnya",
      "Cocok untuk problem yang butuh reasoning bertahap",
      "Selalu menghasilkan jawaban paling singkat",
      "Bisa meningkatkan akurasi untuk soal logika"
    ],
    correct: 2,
    explanation:
      "Chain-of-thought justru meminta AI menunjukkan langkah berpikirnya, sehingga outputnya biasanya lebih panjang — bukan lebih singkat. Trade-off ini sepadan untuk soal yang butuh penalaran.",
    weight: 10
  },
  {
    id: "e8",
    question: "Kapan kamu HARUS mempertimbangkan untuk tidak memakai AI?",
    options: [
      "Saat butuh verifikasi fakta yang kritikal tanpa sumber pembanding",
      "Saat brainstorming ide",
      "Saat menulis draft pertama",
      "Saat butuh ringkasan cepat"
    ],
    correct: 0,
    explanation:
      "Untuk fakta kritikal (misal: info medis, hukum, data yang dipakai keputusan penting), AI bisa salah (halusinasi). Selalu verifikasi dengan sumber pembanding yang kredibel.",
    weight: 10
  }
];

export function findCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function findMentor(slug: string) {
  return MENTORS.find((m) => m.slug === slug);
}

export function findModule(slug: string) {
  return MODULES.find((m) => m.slug === slug);
}

export function findArticle(slug: string) {
  return ARTICLES.find((a) => a.slug === slug);
}

export function modulesByCategory(slug: string) {
  return MODULES.filter((m) => m.categorySlug === slug);
}

export function modulesByMentor(slug: string) {
  return MODULES.filter((m) => m.mentorSlug === slug);
}
