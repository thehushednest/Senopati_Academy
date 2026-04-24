import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { requireUser } from "../../../../lib/session";
import { handleApiError } from "../../../../lib/api-utils";

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  school: z.string().max(200).nullable().optional(),
  grade: z.string().max(40).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export async function GET() {
  try {
    const user = await requireUser();
    const account = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        school: true,
        grade: true,
        emailVerified: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ account });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = updateSchema.parse(await req.json());

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: body.name ?? undefined,
        school: body.school === null ? null : body.school ?? undefined,
        grade: body.grade === null ? null : body.grade ?? undefined,
        avatarUrl: body.avatarUrl === null ? null : body.avatarUrl ?? undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        school: true,
        grade: true,
      },
    });

    return NextResponse.json({ account: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
