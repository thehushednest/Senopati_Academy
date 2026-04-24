import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { requireUser } from "../../../lib/session";
import { handleApiError, jsonError } from "../../../lib/api-utils";

const createSchema = z.object({
  moduleSlug: z.string().min(1).max(120),
  rating: z.number().int().min(1).max(5),
  experience: z.string().max(40).optional(),
  tags: z.array(z.string().max(60)).max(20).optional(),
  body: z.string().min(20).max(4000),
  anonymous: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const moduleSlug = searchParams.get("moduleSlug");
    if (!moduleSlug) return jsonError("moduleSlug required", 400);

    const reviews = await prisma.moduleReview.findMany({
      where: { moduleSlug },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        student: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    // Sanitize anonymous reviews
    const sanitized = reviews.map((r) =>
      r.anonymous
        ? { ...r, student: { id: "anon", name: "Anonim", avatarUrl: null } }
        : r
    );

    return NextResponse.json({ reviews: sanitized });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = createSchema.parse(await req.json());

    const review = await prisma.moduleReview.upsert({
      where: { studentId_moduleSlug: { studentId: user.id, moduleSlug: body.moduleSlug } },
      create: {
        studentId: user.id,
        moduleSlug: body.moduleSlug,
        rating: body.rating,
        experience: body.experience ?? null,
        tagsJson: body.tags ?? [],
        body: body.body,
        anonymous: body.anonymous ?? false,
      },
      update: {
        rating: body.rating,
        experience: body.experience ?? null,
        tagsJson: body.tags ?? [],
        body: body.body,
        anonymous: body.anonymous ?? false,
      },
    });

    return NextResponse.json({ review });
  } catch (err) {
    return handleApiError(err);
  }
}
