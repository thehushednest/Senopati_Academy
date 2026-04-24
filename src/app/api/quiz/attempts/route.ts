import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireUser } from "../../../../lib/session";
import { handleApiError } from "../../../../lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const moduleSlug = searchParams.get("moduleSlug");
    const quizType = searchParams.get("quizType") as "session" | "final_exam" | null;

    const where: { studentId: string; moduleSlug?: string; quizType?: "session" | "final_exam" } = {
      studentId: user.id,
    };
    if (moduleSlug) where.moduleSlug = moduleSlug;
    if (quizType === "session" || quizType === "final_exam") where.quizType = quizType;

    const attempts = await prisma.quizSubmission.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ attempts });
  } catch (err) {
    return handleApiError(err);
  }
}
