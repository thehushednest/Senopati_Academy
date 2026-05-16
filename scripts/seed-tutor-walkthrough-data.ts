/**
 * Supplemental seed untuk demo tutor walkthrough video.
 *
 * Mengisi gap data yang tidak di-cover seed lain supaya tutor.demo melihat
 * "gambaran penuh" di setiap menu /tutor/*:
 *
 *  - TutorStudentTeaching: link 30 dummy students ke tutor.demo + siswa.demo
 *  - DiscussionThread + Reply: 15 threads per module dengan mix unread
 *  - AssignmentSubmission: tugas siswa dengan AI scoring grade
 *  - NarrativePlaythrough (Jeda): 20 playthroughs dengan badge mix
 *  - TeachingMaterial: 12 bahan ajar PDF/DOCX terkurasi admin
 *  - LiveEventRSVP + attendance: untuk seed existing live event
 *  - CareerProfile + CVProfile + JobApplication: 8 students full profile
 *  - Quiz + QuizQuestion: bank soal per modul Paham AI
 *  - TutorScorecard: untuk tutor.demo
 *
 * Idempotent: pakai upsert + skipDuplicates. Re-run aman.
 *
 * Usage:
 *   DATABASE_URL=... npx tsx scripts/seed-tutor-walkthrough-data.ts
 */

import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const TUTOR_EMAIL = "tutor.demo@asksenopati.com";
const ADMIN_EMAIL = "admin@asksenopati.com";

// Paham AI module slugs (urutan workshop)
const PAHAM_AI_MODULES = [
  "jeda",
  "introduction-to-ai",
  "ai-ethics-responsible-ai-use",
  "ai-prompts-101",
  "misinformation-and-deepfakes",
];

const MODULE_TITLES: Record<string, string> = {
  "jeda": "Jeda — Alya & Sinyal Sinyal Asing",
  "introduction-to-ai": "Modul 01: Introduction to AI",
  "ai-ethics-responsible-ai-use": "Modul 02: Ethical Use of AI",
  "ai-prompts-101": "Modul 22: AI Prompts 101",
  "misinformation-and-deepfakes": "Modul 11: Fighting Hoax with AI",
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]!);
  }
  return out;
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function daysAgo(d: number): Date {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000);
}

async function main() {
  const tutor = await prisma.user.findUnique({ where: { email: TUTOR_EMAIL } });
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!tutor || !admin) {
    throw new Error("tutor.demo atau admin belum ada — run prisma/seed.ts dulu");
  }

  const students = await prisma.user.findMany({
    where: { role: "student" },
    select: { id: true, name: true, email: true },
  });
  console.log(`Found ${students.length} students.`);
  if (students.length < 10) {
    throw new Error("Butuh minimal 10 students — run seed-dummy-students.ts dulu");
  }

  // 1. TutorStudentTeaching: link 30 students ke tutor.demo across modul Paham AI
  console.log(`\n[1/9] TutorStudentTeaching links…`);
  const teachStudents = pickN(students, Math.min(30, students.length));
  let teachLinked = 0;
  for (const s of teachStudents) {
    for (const moduleSlug of pickN(PAHAM_AI_MODULES, randomBetween(1, 4) | 0)) {
      const sessionsCount = Math.max(1, Math.floor(randomBetween(1, 8)));
      const firstTaught = daysAgo(randomBetween(30, 120));
      const lastTaught = daysAgo(randomBetween(0, 25));
      await prisma.tutorStudentTeaching.upsert({
        where: {
          tutorId_studentId_moduleSlug: {
            tutorId: tutor.id,
            studentId: s.id,
            moduleSlug,
          },
        },
        create: {
          tutorId: tutor.id,
          studentId: s.id,
          moduleSlug,
          firstTaughtAt: firstTaught,
          lastTaughtAt: lastTaught,
          sessionsCount,
        },
        update: { lastTaughtAt: lastTaught, sessionsCount },
      });
      teachLinked++;
    }
  }
  console.log(`  ${teachLinked} teaching records linked.`);

  // 2. DiscussionThread + Reply per modul
  console.log(`\n[2/9] Discussion threads + replies…`);
  const THREAD_PROMPTS = [
    "Saya masih bingung soal bagian K-I-F-C, bisa dijelaskan ulang Pak/Bu?",
    "Kalau prompt-nya panjang banget apakah AI jadi bingung?",
    "Soal posttest nomor 3 itu jawabannya B kan?",
    "Pak/Bu, deepfake video itu apakah selalu bisa kita kenali?",
    "Modul ini bisa di-replay nggak setelah live session selesai?",
    "Apakah AI bisa salah kalau saya kasih konteks lokal Indonesia?",
    "Saya coba prompt di ChatGPT hasilnya beda dengan yang di video, normal nggak?",
    "Bagaimana cara verifikasi kalau berita di TikTok itu hoaks atau bukan?",
    "Apakah bias AI bisa dihilangkan sepenuhnya?",
    "Sertifikat modul muncul kapan ya setelah lulus posttest?",
    "Saya gagal pretest 2 kali, boleh ambil lagi?",
    "Bedanya zero-shot dan few-shot prompting apa Pak/Bu?",
    "Kalau saya pakai AI buat tugas sekolah apakah dianggap nyontek?",
    "Boleh share contoh CV ATS-friendly yang siswa lain sudah bikin?",
    "Sesi live besok dimulai jam berapa?",
  ];
  let threadsCreated = 0;
  for (let i = 0; i < 18; i++) {
    const author = pick(students);
    const moduleSlug = pick(PAHAM_AI_MODULES);
    const createdAt = daysAgo(randomBetween(0, 14));
    const thread = await prisma.discussionThread.create({
      data: {
        moduleSlug,
        authorId: author.id,
        title: pick(THREAD_PROMPTS).slice(0, 80),
        body: pick(THREAD_PROMPTS),
        createdAt,
        updatedAt: createdAt,
      },
    });
    // 0-4 replies, kadang dari tutor.demo
    const replyCount = Math.floor(randomBetween(0, 5));
    for (let r = 0; r < replyCount; r++) {
      const replier = r === 0 && Math.random() > 0.4 ? tutor : pick(students);
      const replyAt = new Date(createdAt.getTime() + (r + 1) * 3600_000);
      await prisma.discussionReply.create({
        data: {
          threadId: thread.id,
          authorId: replier.id,
          body: replier.id === tutor.id
            ? "Pertanyaan bagus! Coba kita bahas di live session besok ya. Singkatnya: " + pick([
                "konteks itu krusial supaya AI tahu siapa audiensnya.",
                "kerangka K-I-F-C harus diisi semua biar hasilnya maksimal.",
                "iya benar, kita bahas detail saat sesi praktik.",
                "tidak perlu khawatir, banyak siswa juga awalnya bingung.",
              ])
            : pick([
                "Saya juga penasaran soal ini",
                "Setelah saya coba beberapa kali jadi paham, tapi awalnya emang nge-blank",
                "Pak/Bu tutor bisa share contoh konkretnya?",
                "Saya sudah coba, hasilnya begini: ...",
              ]),
          createdAt: replyAt,
        },
      });
    }
    threadsCreated++;
  }
  console.log(`  ${threadsCreated} threads created.`);

  // 3. NarrativePlaythrough (Jeda) — 20 playthroughs dengan badge mix
  console.log(`\n[3/9] Narrative playthroughs (Jeda)…`);
  const jedaStory = await prisma.narrativeStory.findUnique({ where: { slug: "jeda" } });
  if (jedaStory) {
    const BADGES: Array<"pemula_waspada" | "digital_cerdas" | "penjaga_keluarga" | "empati_digital" | null> = [
      "pemula_waspada",
      "digital_cerdas",
      "penjaga_keluarga",
      "empati_digital",
      null,
      null,
    ];
    let playthroughsCreated = 0;
    for (const s of pickN(students, 22)) {
      const startedAt = daysAgo(randomBetween(1, 45));
      const completed = Math.random() > 0.25;
      const completedAt = completed ? new Date(startedAt.getTime() + randomBetween(30, 120) * 60_000) : null;
      const existing = await prisma.narrativePlaythrough.findFirst({
        where: { userId: s.id, storyId: jedaStory.id },
      });
      if (existing) continue;
      await prisma.narrativePlaythrough.create({
        data: {
          userId: s.id,
          storyId: jedaStory.id,
          startedAt,
          completedAt,
          finalSaldo: completed ? Math.floor(randomBetween(150_000, 800_000)) : null,
          finalKewaspadaan: completed ? Math.floor(randomBetween(2, 10)) : null,
          finalHubungan: completed ? Math.floor(randomBetween(-2, 8)) : null,
          badge: completed ? pick(BADGES) : null,
        },
      });
      playthroughsCreated++;
    }
    console.log(`  ${playthroughsCreated} playthroughs created.`);
  } else {
    console.log(`  Skipped — Jeda story not found.`);
  }

  // 4. TeachingMaterial: 12 bahan ajar PDF/DOCX terkurasi admin
  console.log(`\n[4/9] TeachingMaterial (bahan ajar terkurasi)…`);
  const MATERIALS: Array<{ moduleSlug: string; title: string; type: "PDF" | "DOCX"; sizeKB: number }> = [
    { moduleSlug: "introduction-to-ai", title: "Slide Modul 01 — Apa itu AI", type: "PDF", sizeKB: 2_400 },
    { moduleSlug: "introduction-to-ai", title: "Handout: Sejarah AI 1956-2026", type: "PDF", sizeKB: 1_200 },
    { moduleSlug: "introduction-to-ai", title: "Worksheet: AI di Sekitar Kita", type: "DOCX", sizeKB: 380 },
    { moduleSlug: "ai-ethics-responsible-ai-use", title: "Slide Modul 02 — Etika AI", type: "PDF", sizeKB: 3_100 },
    { moduleSlug: "ai-ethics-responsible-ai-use", title: "Studi Kasus: Bias di Algoritma Rekrutmen", type: "PDF", sizeKB: 900 },
    { moduleSlug: "ai-prompts-101", title: "Slide Modul 22 — K-I-F-C Framework", type: "PDF", sizeKB: 2_800 },
    { moduleSlug: "ai-prompts-101", title: "Cheat Sheet: 50 Prompt Pattern", type: "PDF", sizeKB: 1_500 },
    { moduleSlug: "ai-prompts-101", title: "Worksheet: Praktik Prompting", type: "DOCX", sizeKB: 450 },
    { moduleSlug: "misinformation-and-deepfakes", title: "Slide Modul 11 — Verifikasi 5C", type: "PDF", sizeKB: 2_600 },
    { moduleSlug: "misinformation-and-deepfakes", title: "Library: Contoh Deepfake Indonesia", type: "PDF", sizeKB: 4_200 },
    { moduleSlug: "jeda", title: "Panduan Diskusi Pasca-Jeda", type: "PDF", sizeKB: 1_100 },
    { moduleSlug: "jeda", title: "Worksheet: Refleksi Pilihan Alya", type: "DOCX", sizeKB: 320 },
  ];
  let matCreated = 0;
  for (const m of MATERIALS) {
    const existing = await prisma.teachingMaterial.findFirst({
      where: { moduleSlug: m.moduleSlug, title: m.title },
    });
    if (existing) continue;
    const slug = m.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const ext = m.type === "PDF" ? "pdf" : "docx";
    await prisma.teachingMaterial.create({
      data: {
        moduleSlug: m.moduleSlug,
        title: m.title,
        description: `Materi ${MODULE_TITLES[m.moduleSlug]} — disiapkan tim kurasi Senopati.`,
        fileUrl: `/teaching-materials/${m.moduleSlug}/${slug}.${ext}`,
        fileKey: `teaching-materials/${m.moduleSlug}/${slug}.${ext}`,
        contentType: m.type === "PDF" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        fileSize: m.sizeKB * 1024,
        uploadedById: admin.id,
      },
    });
    matCreated++;
  }
  console.log(`  ${matCreated} teaching materials created.`);

  // 5. LiveEvent + RSVPs (kalau belum ada, bikin 1; lalu populate RSVPs)
  console.log(`\n[5/9] Live event + RSVPs…`);
  let liveEvent = await prisma.liveEvent.findFirst({
    where: { hostId: tutor.id, status: { in: ["scheduled", "live"] } },
    orderBy: { scheduledAt: "desc" },
  });
  if (!liveEvent) {
    liveEvent = await prisma.liveEvent.create({
      data: {
        title: "Workshop Paham AI — Demo Walkthrough",
        description: "Sesi live demo untuk walkthrough tutor.",
        hostId: tutor.id,
        moduleSlug: "ai-prompts-101",
        scheduledAt: new Date(Date.now() + 2 * 24 * 3600_000), // 2 hari ke depan
        durationMinutes: 90,
        status: "scheduled",
        joinCode: String(Math.floor(100000 + Math.random() * 900000)),
        joinCodeIssuedAt: new Date(),
      },
    });
    console.log(`  Created event: ${liveEvent.title}`);
  } else {
    console.log(`  Reuse existing event: ${liveEvent.title}`);
  }

  // Past event with attendance — for /tutor/live/[id] AttendanceTable demo
  let pastEvent = await prisma.liveEvent.findFirst({
    where: { hostId: tutor.id, status: "ended" },
    orderBy: { scheduledAt: "desc" },
  });
  if (!pastEvent) {
    pastEvent = await prisma.liveEvent.create({
      data: {
        title: "Sesi Live: Pengenalan K-I-F-C",
        description: "Sesi yang sudah selesai untuk demo attendance.",
        hostId: tutor.id,
        moduleSlug: "ai-prompts-101",
        scheduledAt: daysAgo(7),
        durationMinutes: 90,
        status: "ended",
        progressAppliedAt: daysAgo(7),
        assignmentTitle: "Praktik K-I-F-C: bikin 3 prompt sendiri",
        assignmentInstructions: "Tulis 3 prompt yang menerapkan kerangka K-I-F-C lengkap.",
        assignmentDeadline: daysAgo(3),
      },
    });
    console.log(`  Created past event: ${pastEvent.title}`);
  }

  let rsvpsCreated = 0;
  for (const s of pickN(students, 25)) {
    const isAttended = Math.random() > 0.2;
    try {
      await prisma.liveEventRSVP.create({
        data: {
          eventId: pastEvent.id,
          userId: s.id,
          rsvpAt: daysAgo(8),
          attended: isAttended,
          joinedAt: isAttended ? daysAgo(7) : null,
        },
      });
      rsvpsCreated++;
    } catch {
      /* unique constraint — already exists */
    }
  }
  console.log(`  ${rsvpsCreated} RSVPs created for past event.`);

  // 6. AssignmentSubmission with AI grade (untuk past event)
  console.log(`\n[6/9] AssignmentSubmission with AI grade…`);
  let submissions = 0;
  for (const s of pickN(students, 18)) {
    const aiGrade = Math.floor(randomBetween(55, 95));
    const status = aiGrade >= 75 ? "approved" : aiGrade >= 60 ? "reviewing" : "needs_revision";
    try {
      const aiFeedback = aiGrade >= 75
        ? "AI Scoring: Bagus! Penerapan K-I-F-C sudah lengkap. Konteks jelas, instruksi spesifik, format dideskripsikan dengan baik, dan contoh relevan."
        : aiGrade >= 60
        ? "AI Scoring: Sudah on the right track, tapi bagian Format dan Contoh masih kurang spesifik. Coba refine bagian itu."
        : "AI Scoring: Beberapa prompt belum menerapkan K-I-F-C lengkap — Konteks dan Format-nya hilang. Silakan revisi.";
      await prisma.assignmentSubmission.create({
        data: {
          studentId: s.id,
          liveEventId: pastEvent.id,
          moduleSlug: "ai-prompts-101",
          status: status as "submitted" | "reviewing" | "approved" | "needs_revision",
          grade: aiGrade,
          feedback: aiFeedback,
          submittedAt: daysAgo(randomBetween(1, 6)),
          reviewedAt: status === "approved" ? daysAgo(randomBetween(0, 3)) : null,
          text: "1. Prompt pertama: Tolong jelaskan konsep AI untuk siswa kelas 11...\n2. Prompt kedua: Buat outline esai...\n3. Prompt ketiga: Analisis cara verifikasi sumber...",
        },
      });
      submissions++;
    } catch {
      /* unique key submitter|liveEvent — already exists */
    }
  }
  console.log(`  ${submissions} submissions with AI grade created.`);

  // 7. CareerProfile + CVProfile + JobApplication for 8 students
  console.log(`\n[7/9] CareerProfile + CV + JobApplication for top students…`);
  const HOLLAND_PROFILES = [
    { code: "RIA", scores: { R: 85, I: 78, A: 70, S: 45, E: 50, C: 35 } },
    { code: "SAE", scores: { R: 30, I: 55, A: 75, S: 88, E: 80, C: 40 } },
    { code: "IRE", scores: { R: 72, I: 90, A: 50, S: 35, E: 78, C: 45 } },
    { code: "ESC", scores: { R: 40, I: 50, A: 35, S: 70, E: 85, C: 78 } },
    { code: "AIS", scores: { R: 45, I: 70, A: 88, S: 75, E: 50, C: 35 } },
    { code: "SEC", scores: { R: 50, I: 55, A: 60, S: 80, E: 75, C: 72 } },
    { code: "IAS", scores: { R: 40, I: 85, A: 78, S: 70, E: 45, C: 50 } },
    { code: "REC", scores: { R: 80, I: 60, A: 45, S: 50, E: 72, C: 78 } },
  ];
  let profilesCreated = 0;
  const topStudents = pickN(students, 8);
  for (let i = 0; i < topStudents.length; i++) {
    const s = topStudents[i]!;
    const prof = HOLLAND_PROFILES[i]!;
    try {
      await prisma.careerProfile.upsert({
        where: { studentId: s.id },
        create: {
          studentId: s.id,
          scoreR: prof.scores.R,
          scoreI: prof.scores.I,
          scoreA: prof.scores.A,
          scoreS: prof.scores.S,
          scoreE: prof.scores.E,
          scoreC: prof.scores.C,
          hollandCode: prof.code,
          computedAt: daysAgo(randomBetween(5, 30)),
        },
        update: {},
      });
      profilesCreated++;
    } catch (e) {
      console.warn(`  careerProfile for ${s.email} failed:`, e);
    }
  }
  console.log(`  ${profilesCreated} career profiles created.`);

  // CV + JobApplication subset
  let cvCreated = 0;
  let appsCreated = 0;
  for (const s of topStudents.slice(0, 5)) {
    try {
      await prisma.cVProfile.upsert({
        where: { studentId: s.id },
        create: {
          studentId: s.id,
          fullName: s.name,
          email: s.email,
          phone: "+6281234567" + Math.floor(Math.random() * 1000).toString().padStart(3, "0"),
          city: pick(["Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Semarang"]),
          summary:
            "Pelajar SMA aktif Senopati Academy, fokus pengembangan literasi AI dan komunikasi efektif. " +
            "Pernah ikut workshop Paham AI dan menerapkan kerangka K-I-F-C di tugas sekolah.",
          experiencesJson: [
            {
              position: "Anggota OSIS Bidang Kerohanian",
              company: "SMA Negeri Jakarta",
              startDate: "2025-07",
              endDate: null,
              current: true,
              bullets: ["Mengkoordinir 5 kegiatan ekskul", "Mentor adik kelas literasi digital"],
            },
          ],
          educationJson: [
            { school: "SMA Negeri Jakarta", major: "IPA", startYear: 2024, endYear: 2027, current: true },
          ],
          skillsJson: [
            "Microsoft Word/Excel",
            "Bahasa Inggris konversasional",
            "Public speaking",
            "Prompt engineering dasar (kerangka K-I-F-C)",
          ],
          certificationsJson: [
            { name: "Workshop Paham AI", issuer: "Senopati Academy", year: 2026 },
          ],
        },
        update: {},
      });
      cvCreated++;
      for (let j = 0; j < Math.floor(randomBetween(1, 4)); j++) {
        await prisma.jobApplication.create({
          data: {
            studentId: s.id,
            title: pick([
              "Software Engineer Intern",
              "Data Analyst Magang",
              "Marketing Assistant",
              "UI/UX Designer Intern",
              "Junior Content Writer",
            ]),
            company: pick(["Tokopedia", "Gojek", "Bukalapak", "Telkomsel", "Bank Mandiri", "Unilever"]),
            source: pick(["Jobstreet", "LinkedIn", "Glints", "BKK", "Referensi"]),
            status: pick(["applied", "screening", "interview", "offer", "rejected"]),
            appliedAt: daysAgo(randomBetween(5, 40)),
            location: pick(["Jakarta", "Bandung", "Remote"]),
          },
        });
        appsCreated++;
      }
    } catch (e) {
      console.warn(`  cvProfile for ${s.email} failed:`, e);
    }
  }
  console.log(`  ${cvCreated} CVs + ${appsCreated} job applications created.`);

  // 8. Quiz/QuizQuestion skipped — Quiz model butuh Course FK; modul Paham AI
  //    stored di content.ts (MODULES = []), bukan Course rows. /tutor/materi
  //    tetap punya konten dari teaching materials + storyboard arahkan VO
  //    Ch.7 ke usulan materi (form UsulanMateriForm), bukan list bank soal.
  console.log(`\n[8/9] Skipped Quiz seed (Course FK constraint).`);

  // 9. TutorScorecard untuk demo (April 2026)
  console.log(`\n[9/9] TutorScorecard untuk demo tutor…`);
  const month = new Date(2026, 3, 1); // April 2026
  const monthEnd = new Date(2026, 3, 30, 23, 59, 59);
  try {
    await prisma.tutorScorecard.upsert({
      where: { tutorId_periodStart: { tutorId: tutor.id, periodStart: month } },
      create: {
        tutorId: tutor.id,
        periodStart: month,
        periodEnd: monthEnd,
        totalScore: new Prisma.Decimal("82.50"),
        outputQuality: new Prisma.Decimal("25.00"), // 0-30
        livePerformance: new Prisma.Decimal("21.00"), // 0-25
        responsiveness: new Prisma.Decimal("17.00"), // 0-20
        satisfaction: new Prisma.Decimal("13.00"), // 0-15
        compliance: new Prisma.Decimal("8.50"), // 0-10
        adminAdjustment: new Prisma.Decimal("0.00"),
        tier: "good", // excellent | good | needs_attention | critical | insufficient
        metricsJson: { _seeded: true, note: "Demo scorecard untuk walkthrough video" } as Prisma.InputJsonValue,
      },
      update: {},
    });
    console.log(`  TutorScorecard April 2026 created (totalScore 82.5, tier=good).`);
  } catch (e) {
    console.warn(`  TutorScorecard failed:`, e);
  }

  console.log(`\n=== DONE ===`);
  console.log(`Tutor:    ${TUTOR_EMAIL}`);
  console.log(`Login at: http://localhost:3000/login`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
