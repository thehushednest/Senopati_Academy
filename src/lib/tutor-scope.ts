import { prisma } from "./prisma";
import { findMentor, findModule, modulesByMentor, type Module } from "./content";
import { getCurrentUser } from "./session";

export type TaughtModule = Module & {
  studentsCount: number;
  sessionsCompletedTotal: number;
  sessionsEnrolledTotal: number;
  averageCompletion: number;
  pendingReviews: number;
  unreadThreads: number;
  lastActivity: Date | null;
};

/**
 * Ambil mentorSlug tutor yang sedang login. Admin return null (akses semua).
 * Student juga null. Tutor tanpa mentorSlug (belum di-map) return null
 * — UI akan treat sebagai "no scope" dengan copy yang informatif.
 */
export async function getMyMentorSlug(): Promise<string | null> {
  const viewer = await getCurrentUser();
  if (!viewer) return null;
  if (viewer.role !== "tutor") return null;
  const record = await prisma.user.findUnique({
    where: { id: viewer.id },
    select: { mentorSlug: true },
  });
  return record?.mentorSlug ?? null;
}

/**
 * Slug-slug modul yang diampu tutor saat ini. Untuk admin return null (all).
 */
export async function getMyTaughtSlugs(): Promise<string[] | null> {
  const viewer = await getCurrentUser();
  if (!viewer) return [];
  if (viewer.role === "admin") return null; // null = all modules
  if (viewer.role !== "tutor") return [];

  const record = await prisma.user.findUnique({
    where: { id: viewer.id },
    select: { mentorSlug: true },
  });
  if (!record?.mentorSlug) return [];
  return modulesByMentor(record.mentorSlug).map((m) => m.slug);
}

/**
 * Lengkap: modul yang diampu tutor + stats agregat per modul.
 */
export async function getMyTaughtModules(): Promise<TaughtModule[]> {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "tutor") return [];

  const record = await prisma.user.findUnique({
    where: { id: viewer.id },
    select: { mentorSlug: true },
  });
  if (!record?.mentorSlug) return [];

  const mentor = findMentor(record.mentorSlug);
  if (!mentor) return [];

  const slugs = mentor.moduleSlugs;
  if (slugs.length === 0) return [];

  const [progresses, pendingSubs, threads] = await Promise.all([
    prisma.moduleProgress.findMany({
      where: { moduleSlug: { in: slugs } },
      select: {
        moduleSlug: true,
        studentId: true,
        completedSessions: true,
        totalSessions: true,
        updatedAt: true,
      },
    }),
    prisma.assignmentSubmission.groupBy({
      by: ["moduleSlug"],
      where: { moduleSlug: { in: slugs }, status: "submitted" },
      _count: { _all: true },
    }),
    prisma.discussionThread.findMany({
      where: { moduleSlug: { in: slugs } },
      select: {
        moduleSlug: true,
        _count: { select: { replies: true } },
      },
    }),
  ]);

  return slugs
    .map((slug) => {
      const mod = findModule(slug);
      if (!mod) return null;

      const moduleProgresses = progresses.filter((p) => p.moduleSlug === slug);
      const uniqueStudents = new Set(moduleProgresses.map((p) => p.studentId)).size;
      const sessionsCompletedTotal = moduleProgresses.reduce(
        (sum, p) => sum + p.completedSessions,
        0,
      );
      const sessionsEnrolledTotal = moduleProgresses.reduce((sum, p) => sum + p.totalSessions, 0);
      const averageCompletion =
        sessionsEnrolledTotal > 0
          ? Math.round((sessionsCompletedTotal / sessionsEnrolledTotal) * 100)
          : 0;
      const lastActivity =
        moduleProgresses.length > 0
          ? new Date(
              Math.max(...moduleProgresses.map((p) => new Date(p.updatedAt).getTime())),
            )
          : null;
      const pendingReviews = pendingSubs.find((ps) => ps.moduleSlug === slug)?._count._all ?? 0;
      const unreadThreads = threads.filter(
        (t) => t.moduleSlug === slug && t._count.replies === 0,
      ).length;

      return {
        ...mod,
        studentsCount: uniqueStudents,
        sessionsCompletedTotal,
        sessionsEnrolledTotal,
        averageCompletion,
        pendingReviews,
        unreadThreads,
        lastActivity,
      } satisfies TaughtModule;
    })
    .filter((x): x is TaughtModule => x !== null);
}
