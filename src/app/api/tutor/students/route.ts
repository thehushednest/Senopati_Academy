import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireTutor } from "../../../../lib/session";
import { handleApiError } from "../../../../lib/api-utils";

/**
 * List semua user dengan role=student + stats ringkas:
 *   modulesStarted, sessionsCompleted, lastActiveAt.
 * Query params: limit, q (search by name/email).
 */
export async function GET(req: NextRequest) {
  try {
    await requireTutor();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(200, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "100", 10) || 100));
    const q = (searchParams.get("q") ?? "").trim();

    const students = await prisma.user.findMany({
      where: {
        role: "student",
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        school: true,
        grade: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const studentIds = students.map((s) => s.id);
    if (studentIds.length === 0) {
      return NextResponse.json({ students: [] });
    }

    // Agregat progress per student dalam 1 query.
    const progresses = await prisma.moduleProgress.groupBy({
      by: ["studentId"],
      where: { studentId: { in: studentIds } },
      _sum: { completedSessions: true, totalSessions: true },
      _count: { _all: true },
      _max: { updatedAt: true },
    });
    const progressMap = new Map(progresses.map((p) => [p.studentId, p]));

    // Active modul paling baru per student (buat label "sedang belajar...").
    const latestActive = await prisma.moduleProgress.findMany({
      where: { studentId: { in: studentIds } },
      orderBy: { updatedAt: "desc" },
      distinct: ["studentId"],
      select: { studentId: true, moduleSlug: true, completedSessions: true, totalSessions: true },
    });
    const activeMap = new Map(latestActive.map((p) => [p.studentId, p]));

    const result = students.map((s) => {
      const agg = progressMap.get(s.id);
      const latest = activeMap.get(s.id);
      const completed = agg?._sum.completedSessions ?? 0;
      const total = agg?._sum.totalSessions ?? 0;
      const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
      const lastActiveAt = agg?._max.updatedAt ?? null;
      const now = Date.now();
      const daysSince = lastActiveAt
        ? Math.floor((now - new Date(lastActiveAt).getTime()) / (24 * 3600 * 1000))
        : null;
      const status: "active" | "stuck" | "inactive" =
        daysSince === null
          ? "inactive"
          : daysSince <= 2
          ? "active"
          : daysSince <= 7
          ? "stuck"
          : "inactive";
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        school: s.school,
        grade: s.grade,
        avatarUrl: s.avatarUrl,
        modulesStarted: agg?._count._all ?? 0,
        sessionsCompleted: completed,
        totalSessionsEnrolled: total,
        progressPercent,
        activeModuleSlug: latest?.moduleSlug ?? null,
        lastActiveAt: lastActiveAt ? lastActiveAt.toISOString() : null,
        status,
      };
    });

    return NextResponse.json({ students: result });
  } catch (err) {
    return handleApiError(err);
  }
}
