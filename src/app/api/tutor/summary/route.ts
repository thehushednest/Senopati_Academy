import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireTutor } from "../../../../lib/session";
import { handleApiError } from "../../../../lib/api-utils";

/**
 * Summary stats untuk tutor dashboard. Non-scoped (cross-modul) karena
 * current schema belum mengikat tutor ke specific moduleSlug di AssignmentSubmission.
 */
export async function GET() {
  try {
    await requireTutor();

    const [studentCount, pendingReviews, reviewingReviews, totalSubmissions, recentEnrollments, discussionThreads] =
      await Promise.all([
        prisma.user.count({ where: { role: "student" } }),
        prisma.assignmentSubmission.count({ where: { status: "submitted" } }),
        prisma.assignmentSubmission.count({ where: { status: "reviewing" } }),
        prisma.assignmentSubmission.count(),
        prisma.moduleProgress.findMany({
          orderBy: { startedAt: "desc" },
          take: 5,
          select: {
            moduleSlug: true,
            startedAt: true,
            student: { select: { id: true, name: true, avatarUrl: true } },
          },
        }),
        prisma.discussionThread.findMany({
          orderBy: { updatedAt: "desc" },
          take: 6,
          include: {
            author: { select: { id: true, name: true, avatarUrl: true } },
            _count: { select: { replies: true } },
          },
        }),
      ]);

    // Identify threads yang belum dibalas sama sekali (0 replies) atau butuh perhatian.
    const pendingThreads = discussionThreads.filter((t) => t._count.replies === 0);

    return NextResponse.json({
      studentCount,
      pendingReviews,
      reviewingReviews,
      totalSubmissions,
      recentEnrollments,
      pendingThreads,
      recentThreads: discussionThreads,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
