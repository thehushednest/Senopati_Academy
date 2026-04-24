import { prisma } from "./prisma";
import { getCurrentUser } from "./session";
import type { ActiveModuleSample } from "./content";
import { findModule, getActiveModuleProgress as getStaticSample } from "./content";

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
    };
  }

  const [allProgress, certsCount] = await Promise.all([
    prisma.moduleProgress.findMany({
      where: { studentId: user.id },
      select: { completedSessions: true, totalSessions: true, completedAt: true },
    }),
    prisma.moduleCertificate.count({ where: { studentId: user.id } }),
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
  };
}
