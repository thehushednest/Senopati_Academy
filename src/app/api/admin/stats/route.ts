import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireAdmin } from "../../../../lib/session";
import { handleApiError } from "../../../../lib/api-utils";

/**
 * Platform-level counts untuk dashboard admin / pengaturan.
 */
export async function GET() {
  try {
    await requireAdmin();

    const [
      userCount,
      studentCount,
      tutorCount,
      adminCount,
      moduleProgressCount,
      completedModuleCount,
      certificateCount,
      assignmentCount,
      pendingReviewCount,
      threadCount,
      notificationCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "student" } }),
      prisma.user.count({ where: { role: "tutor" } }),
      prisma.user.count({ where: { role: "admin" } }),
      prisma.moduleProgress.count(),
      prisma.moduleProgress.count({ where: { completedAt: { not: null } } }),
      prisma.moduleCertificate.count(),
      prisma.assignmentSubmission.count(),
      prisma.assignmentSubmission.count({ where: { status: "submitted" } }),
      prisma.discussionThread.count(),
      prisma.notification.count(),
    ]);

    return NextResponse.json({
      users: {
        total: userCount,
        students: studentCount,
        tutors: tutorCount,
        admins: adminCount,
      },
      learning: {
        modulesStarted: moduleProgressCount,
        modulesCompleted: completedModuleCount,
        certificatesIssued: certificateCount,
      },
      engagement: {
        assignments: assignmentCount,
        pendingReviews: pendingReviewCount,
        discussionThreads: threadCount,
        notifications: notificationCount,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
