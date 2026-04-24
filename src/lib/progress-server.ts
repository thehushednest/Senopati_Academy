import { prisma } from "./prisma";
import { getCurrentUser } from "./session";
import type { AchievementItem, ActiveModuleSample } from "./content";
import { ACHIEVEMENTS, findModule, getActiveModuleProgress as getStaticSample, modulesByCategory } from "./content";
import { getStreak } from "./streak";

export type ModuleProgressView = ActiveModuleSample & { source: "db" | "sample" | "empty" };

/**
 * Ambil progress modul untuk user yang sedang login dari DB.
 * Fallback ke sample statis `ACTIVE_MODULES` bila user belum login atau belum punya record.
 * Halaman SSR memanggil ini untuk menghindari ketergantungan ke hardcoded sample.
 */
export async function resolveModuleProgress(moduleSlug: string): Promise<ModuleProgressView | null> {
  const mod = findModule(moduleSlug);
  if (!mod) return null;

  const user = await getCurrentUser();
  if (user) {
    const record = await prisma.moduleProgress.findUnique({
      where: { studentId_moduleSlug: { studentId: user.id, moduleSlug } },
    });
    if (record) {
      const total = record.totalSessions > 0 ? record.totalSessions : mod.topics;
      const completed = Math.min(record.completedSessions, total);
      const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
      const nextIdx = completed < total ? completed : total - 1;
      return {
        moduleSlug,
        completed,
        total,
        percent,
        nextSession: `Sesi ${String(nextIdx + 1).padStart(2, "0")} · ${mod.syllabus[nextIdx]?.title ?? ""}`,
        lastActivity: record.updatedAt.toISOString().slice(0, 10),
        estimatedFinish: completed >= total ? "Selesai" : `${Math.max(1, total - completed)} sesi tersisa`,
        source: "db",
      };
    }
  }

  // Fallback: kalau modul ini ada di sample ACTIVE_MODULES (untuk demo), pakai itu.
  const sample = getStaticSample(moduleSlug);
  if (sample) return { ...sample, source: "sample" };

  // Default: progress kosong.
  return {
    moduleSlug,
    completed: 0,
    total: mod.topics,
    percent: 0,
    nextSession: `Sesi 01 · ${mod.syllabus[0]?.title ?? ""}`,
    lastActivity: "-",
    estimatedFinish: `${mod.topics} sesi`,
    source: "empty",
  };
}

export async function hasPassedFinalExam(moduleSlug: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  const passed = await prisma.quizSubmission.findFirst({
    where: { studentId: user.id, moduleSlug, quizType: "final_exam", passed: true },
    select: { id: true },
  });
  return Boolean(passed);
}

export async function getLatestFinalExamResult(moduleSlug: string) {
  const user = await getCurrentUser();
  if (!user) return null;
  const attempt = await prisma.quizSubmission.findFirst({
    where: { studentId: user.id, moduleSlug, quizType: "final_exam" },
    orderBy: { submittedAt: "desc" },
  });
  return attempt;
}

export async function getExistingCertificate(moduleSlug: string) {
  const user = await getCurrentUser();
  if (!user) return null;
  return prisma.moduleCertificate.findUnique({
    where: { studentId_moduleSlug: { studentId: user.id, moduleSlug } },
  });
}

/**
 * Ambil semua modul yang sedang dikerjakan user (paling baru dulu).
 * Return format kompatibel dengan `ActiveModuleSample` (untuk drop-in ke dashboard).
 */
export async function getMyActiveModules(limit = 6): Promise<ModuleProgressView[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const records = await prisma.moduleProgress.findMany({
    where: { studentId: user.id },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });

  const views: ModuleProgressView[] = [];
  for (const record of records) {
    const mod = findModule(record.moduleSlug);
    if (!mod) continue;
    const total = record.totalSessions > 0 ? record.totalSessions : mod.topics;
    const completed = Math.min(record.completedSessions, total);
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    const nextIdx = completed < total ? completed : total - 1;
    views.push({
      moduleSlug: record.moduleSlug,
      completed,
      total,
      percent,
      nextSession: `Sesi ${String(nextIdx + 1).padStart(2, "0")} · ${mod.syllabus[nextIdx]?.title ?? ""}`,
      lastActivity: record.updatedAt.toISOString().slice(0, 10),
      estimatedFinish: completed >= total ? "Selesai" : `${Math.max(1, total - completed)} sesi tersisa`,
      source: "db",
    });
  }
  return views;
}

/**
 * Hitung status achievement dari data real user.
 * Struktur (slug/title/description) tetap dari ACHIEVEMENTS di content.ts,
 * tapi `status` dan `progress` di-compute berdasarkan DB.
 */
export async function getMyAchievements(): Promise<AchievementItem[]> {
  const user = await getCurrentUser();
  if (!user) {
    // Untuk visitor anonim: return as-is dari content.ts (sample).
    return ACHIEVEMENTS;
  }

  const [progresses, certs, replies, streak] = await Promise.all([
    prisma.moduleProgress.findMany({
      where: { studentId: user.id },
      select: { moduleSlug: true, completedSessions: true, totalSessions: true, completedAt: true },
    }),
    prisma.moduleCertificate.findMany({
      where: { studentId: user.id },
      select: { moduleSlug: true },
    }),
    prisma.discussionReply.count({ where: { authorId: user.id } }),
    getStreak(user.id),
  ]);

  const firstSessionDone = progresses.some((p) => p.completedSessions > 0);

  const promptsRow = progresses.find((p) => p.moduleSlug === "ai-prompts-101");
  const promptsCompleted = Boolean(promptsRow?.completedAt);
  const promptsInProgress = promptsRow && promptsRow.completedSessions > 0 && !promptsCompleted;

  const foundationsSlugs = modulesByCategory("foundations").map((m) => m.slug);
  const foundationsDone = foundationsSlugs.filter((slug) =>
    certs.some((c) => c.moduleSlug === slug),
  );

  const aiBuilderSlug = "building-your-first-ai-tool";
  const aiBuilderCert = certs.some((c) => c.moduleSlug === aiBuilderSlug);
  const aiBuilderRow = progresses.find((p) => p.moduleSlug === aiBuilderSlug);
  const aiBuilderInProgress = Boolean(aiBuilderRow && !aiBuilderRow.completedAt);

  return ACHIEVEMENTS.map((item) => {
    switch (item.slug) {
      case "first-session":
        return { ...item, status: firstSessionDone ? "earned" : "in-progress", progress: undefined };
      case "prompt-master":
        if (promptsCompleted) return { ...item, status: "earned", progress: undefined };
        if (promptsInProgress && promptsRow) {
          return {
            ...item,
            status: "in-progress",
            progress: `${promptsRow.completedSessions}/${promptsRow.totalSessions} sesi`,
          };
        }
        return { ...item, status: "locked", progress: undefined };
      case "foundations-graduate":
        if (foundationsDone.length === foundationsSlugs.length) {
          return { ...item, status: "earned", progress: undefined };
        }
        return {
          ...item,
          status: foundationsDone.length > 0 ? "in-progress" : "locked",
          progress: `${foundationsDone.length}/${foundationsSlugs.length} modul`,
        };
      case "community-helper": {
        const target = 10;
        if (replies >= target) return { ...item, status: "earned", progress: undefined };
        if (replies > 0)
          return { ...item, status: "in-progress", progress: `${replies}/${target} balasan` };
        return { ...item, status: "locked", progress: undefined };
      }
      case "ai-builder":
        if (aiBuilderCert) return { ...item, status: "earned", progress: undefined };
        if (aiBuilderInProgress && aiBuilderRow) {
          return {
            ...item,
            status: "in-progress",
            progress: `${aiBuilderRow.completedSessions}/${aiBuilderRow.totalSessions} sesi`,
          };
        }
        return { ...item, status: "locked", progress: undefined };
      case "week-streak": {
        const target = 7;
        if (streak.currentStreak >= target || streak.longestStreak >= target) {
          return { ...item, status: "earned", progress: undefined };
        }
        const best = Math.max(streak.currentStreak, streak.longestStreak);
        if (best > 0) {
          return {
            ...item,
            status: "in-progress",
            progress: `${streak.currentStreak}/${target} hari (terpanjang ${streak.longestStreak})`,
          };
        }
        return { ...item, status: "locked", progress: undefined };
      }
      default:
        return item;
    }
  });
}

/**
 * Aktivitas terbaru user untuk dashboard "Aktivitas Terbaru".
 * Gabungan dari ModuleProgress (sesi selesai), QuizSubmission, AssignmentSubmission,
 * dan ModuleCertificate — lalu di-sort descending by time.
 */
export type LearnerActivity = {
  id: string;
  kind: "progress" | "quiz" | "assignment" | "certificate";
  moduleSlug: string;
  moduleTitle: string;
  message: string;
  href: string;
  at: Date;
};

export async function getMyRecentActivity(limit = 6): Promise<LearnerActivity[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const [progresses, quizzes, assignments, certs] = await Promise.all([
    prisma.moduleProgress.findMany({
      where: { studentId: user.id, lastSessionIndex: { not: null } },
      orderBy: { updatedAt: "desc" },
      take: limit,
    }),
    prisma.quizSubmission.findMany({
      where: { studentId: user.id },
      orderBy: { submittedAt: "desc" },
      take: limit,
    }),
    prisma.assignmentSubmission.findMany({
      where: { studentId: user.id },
      orderBy: { submittedAt: "desc" },
      take: limit,
    }),
    prisma.moduleCertificate.findMany({
      where: { studentId: user.id },
      orderBy: { issuedAt: "desc" },
      take: limit,
    }),
  ]);

  const items: LearnerActivity[] = [];

  for (const p of progresses) {
    const mod = findModule(p.moduleSlug);
    if (!mod || p.lastSessionIndex === null) continue;
    items.push({
      id: `p-${p.id}`,
      kind: "progress",
      moduleSlug: p.moduleSlug,
      moduleTitle: mod.title,
      message: `Sesi ${String(p.lastSessionIndex + 1).padStart(2, "0")} ditandai selesai`,
      href: `/belajar/${p.moduleSlug}`,
      at: p.updatedAt,
    });
  }

  for (const q of quizzes) {
    const mod = findModule(q.moduleSlug);
    if (!mod) continue;
    const label =
      q.quizType === "final_exam"
        ? `Ujian akhir — skor ${q.score}${q.passed ? " (lulus)" : " (belum lulus)"}`
        : `Kuis sesi ${q.sessionIndex !== null ? String(q.sessionIndex + 1).padStart(2, "0") : ""} — skor ${q.score}`;
    items.push({
      id: `q-${q.id}`,
      kind: "quiz",
      moduleSlug: q.moduleSlug,
      moduleTitle: mod.title,
      message: label,
      href: q.quizType === "final_exam"
        ? `/belajar/${q.moduleSlug}/ujian/hasil`
        : `/belajar/${q.moduleSlug}`,
      at: q.submittedAt,
    });
  }

  for (const a of assignments) {
    const mod = findModule(a.moduleSlug);
    if (!mod) continue;
    items.push({
      id: `a-${a.id}`,
      kind: "assignment",
      moduleSlug: a.moduleSlug,
      moduleTitle: mod.title,
      message: `Tugas sesi ${String(a.sessionIndex + 1).padStart(2, "0")} dikirim (${a.status})`,
      href: `/belajar/${a.moduleSlug}/sesi/${a.sessionIndex}/tugas`,
      at: a.submittedAt,
    });
  }

  for (const c of certs) {
    const mod = findModule(c.moduleSlug);
    if (!mod) continue;
    items.push({
      id: `c-${c.id}`,
      kind: "certificate",
      moduleSlug: c.moduleSlug,
      moduleTitle: mod.title,
      message: `Sertifikat modul diterbitkan · ${c.certCode}`,
      href: `/belajar/${c.moduleSlug}/sertifikat`,
      at: c.issuedAt,
    });
  }

  items.sort((a, b) => b.at.getTime() - a.at.getTime());
  return items.slice(0, limit);
}

/**
 * Aggregate stats untuk halaman /progress.
 */
export async function getLearnerStats() {
  const user = await getCurrentUser();
  if (!user) {
    return {
      sessionsCompleted: 0,
      totalSessions: 0,
      modulesStarted: 0,
      modulesCompleted: 0,
      certificatesEarned: 0,
      currentStreak: 0,
      longestStreak: 0,
    };
  }

  const [allProgress, certsCount, streak] = await Promise.all([
    prisma.moduleProgress.findMany({
      where: { studentId: user.id },
      select: { completedSessions: true, totalSessions: true, completedAt: true },
    }),
    prisma.moduleCertificate.count({ where: { studentId: user.id } }),
    getStreak(user.id),
  ]);

  const sessionsCompleted = allProgress.reduce((sum, p) => sum + p.completedSessions, 0);
  const totalSessions = allProgress.reduce((sum, p) => sum + p.totalSessions, 0);
  const modulesCompleted = allProgress.filter((p) => p.completedAt !== null).length;

  return {
    sessionsCompleted,
    totalSessions,
    modulesStarted: allProgress.length,
    modulesCompleted,
    certificatesEarned: certsCount,
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
  };
}
