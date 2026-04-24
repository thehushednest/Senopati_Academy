import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";
import { requireTutor } from "../../../../lib/session";
import { handleApiError } from "../../../../lib/api-utils";
import { getMyTaughtSlugs } from "../../../../lib/tutor-scope";

const STATUS_VALUES = ["submitted", "reviewing", "approved", "needs_revision"] as const;
type Status = (typeof STATUS_VALUES)[number];

function isStatus(v: string | null): v is Status {
  return v !== null && (STATUS_VALUES as readonly string[]).includes(v);
}

export async function GET(req: NextRequest) {
  try {
    const tutor = await requireTutor();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const moduleSlug = searchParams.get("moduleSlug");
    const scope = searchParams.get("scope") ?? "mine"; // mine | all
    const limit = Math.min(100, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "50", 10) || 50));

    // Guard: tutor tidak melihat submission miliknya sendiri (tidak self-review).
    // Admin tetap boleh lihat semua.
    const excludeOwn =
      tutor.role === "tutor" ? { NOT: { studentId: tutor.id } } : {};

    // Scope: default "mine" — hanya modul yang tutor ampu.
    const taughtSlugs = await getMyTaughtSlugs();
    const scopeFilter =
      scope === "mine" && Array.isArray(taughtSlugs) && taughtSlugs.length > 0
        ? { moduleSlug: { in: taughtSlugs } }
        : {};

    const where: Prisma.AssignmentSubmissionWhereInput = { ...excludeOwn, ...scopeFilter };
    if (isStatus(status)) where.status = status;
    if (moduleSlug) where.moduleSlug = moduleSlug;

    const [items, counts] = await Promise.all([
      prisma.assignmentSubmission.findMany({
        where,
        orderBy: { submittedAt: "desc" },
        take: limit,
        include: {
          student: { select: { id: true, name: true, email: true, avatarUrl: true, school: true, grade: true } },
        },
      }),
      prisma.assignmentSubmission.groupBy({
        by: ["status"],
        where: { ...excludeOwn, ...scopeFilter },
        _count: { _all: true },
      }),
    ]);

    const byStatus: Record<string, number> = {
      submitted: 0,
      reviewing: 0,
      approved: 0,
      needs_revision: 0,
    };
    for (const c of counts) byStatus[c.status] = c._count._all;

    return NextResponse.json({ submissions: items, counts: byStatus });
  } catch (err) {
    return handleApiError(err);
  }
}
