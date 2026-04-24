import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { requireUser } from "../../../../lib/session";
import { handleApiError } from "../../../../lib/api-utils";

const answerSchema = z.record(z.string(), z.number().int());

const submitSchema = z.object({
  moduleSlug: z.string().min(1).max(120),
  sessionIndex: z.number().int().min(0).max(50).optional(),
  quizType: z.enum(["session", "final_exam"]),
  answers: answerSchema,
  score: z.number().int().min(0).max(100),
  maxScore: z.number().int().min(1),
  passed: z.boolean(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = submitSchema.parse(await req.json());

    const submission = await prisma.quizSubmission.create({
      data: {
        studentId: user.id,
        moduleSlug: body.moduleSlug,
        sessionIndex: body.sessionIndex ?? null,
        quizType: body.quizType,
        score: body.score,
        maxScore: body.maxScore,
        passed: body.passed,
        answersJson: body.answers,
      },
    });

    // Kalau final_exam dan lulus, tandai ModuleProgress.finalExamPassed.
    if (body.quizType === "final_exam" && body.passed) {
      await prisma.moduleProgress.upsert({
        where: { studentId_moduleSlug: { studentId: user.id, moduleSlug: body.moduleSlug } },
        create: {
          studentId: user.id,
          moduleSlug: body.moduleSlug,
          totalSessions: 0,
          completedSessions: 0,
          finalExamPassed: true,
          completedAt: new Date(),
        },
        update: {
          finalExamPassed: true,
          completedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ submission });
  } catch (err) {
    return handleApiError(err);
  }
}
