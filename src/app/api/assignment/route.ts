import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { requireUser } from "../../../lib/session";
import { handleApiError } from "../../../lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const moduleSlug = searchParams.get("moduleSlug");
    const sessionIndexRaw = searchParams.get("sessionIndex");
    const sessionIndex = sessionIndexRaw !== null ? Number.parseInt(sessionIndexRaw, 10) : null;

    const where: { studentId: string; moduleSlug?: string; sessionIndex?: number } = {
      studentId: user.id,
    };
    if (moduleSlug) where.moduleSlug = moduleSlug;
    if (sessionIndex !== null && !Number.isNaN(sessionIndex)) where.sessionIndex = sessionIndex;

    const submissions = await prisma.assignmentSubmission.findMany({
      where,
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({ submissions });
  } catch (err) {
    return handleApiError(err);
  }
}
