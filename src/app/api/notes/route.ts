import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { requireUser } from "../../../lib/session";
import { handleApiError, jsonError } from "../../../lib/api-utils";

const upsertSchema = z.object({
  moduleSlug: z.string().min(1).max(120),
  body: z.string().max(8000),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const moduleSlug = searchParams.get("moduleSlug");
    if (!moduleSlug) return jsonError("moduleSlug required", 400);

    const note = await prisma.note.findUnique({
      where: { studentId_moduleSlug: { studentId: user.id, moduleSlug } },
    });
    return NextResponse.json({ note });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = upsertSchema.parse(await req.json());

    const note = await prisma.note.upsert({
      where: { studentId_moduleSlug: { studentId: user.id, moduleSlug: body.moduleSlug } },
      create: {
        studentId: user.id,
        moduleSlug: body.moduleSlug,
        body: body.body,
      },
      update: { body: body.body },
    });
    return NextResponse.json({ note });
  } catch (err) {
    return handleApiError(err);
  }
}
