import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { requireUser } from "../../../../lib/session";
import { handleApiError } from "../../../../lib/api-utils";

const submitSchema = z.object({
  moduleSlug: z.string().min(1).max(120),
  sessionIndex: z.number().int().min(0).max(50),
  text: z.string().min(30).max(8000),
  attachmentUrl: z.string().url().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = submitSchema.parse(await req.json());

    const submission = await prisma.assignmentSubmission.create({
      data: {
        studentId: user.id,
        moduleSlug: body.moduleSlug,
        sessionIndex: body.sessionIndex,
        text: body.text,
        attachmentUrl: body.attachmentUrl ?? null,
        status: "submitted",
      },
    });

    return NextResponse.json({ submission });
  } catch (err) {
    return handleApiError(err);
  }
}
