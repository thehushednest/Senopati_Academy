import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { requireUser } from "../../../../lib/session";
import { handleApiError } from "../../../../lib/api-utils";

const upsertSchema = z.object({
  nickname: z.string().max(40).optional(),
  learnerRole: z.enum(["smp", "sma", "kuliah", "guru", "umum"]).optional(),
  learningGoal: z
    .enum(["paham-dasar", "tugas-sekolah", "produktivitas", "bikin-tools", "ajarin-orang", "karir-ai"])
    .optional(),
  timeBudget: z.enum(["singkat", "sedang", "banyak"]).optional(),
  interests: z.array(z.string().max(60)).max(20).optional(),
});

export async function GET() {
  try {
    const user = await requireUser();
    const pref = await prisma.userPreference.findUnique({ where: { userId: user.id } });
    return NextResponse.json({ preference: pref });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = upsertSchema.parse(await req.json());

    const pref = await prisma.userPreference.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        nickname: body.nickname ?? null,
        learnerRole: body.learnerRole ?? null,
        learningGoal: body.learningGoal ?? null,
        timeBudget: body.timeBudget ?? null,
        interestsJson: body.interests ?? [],
        onboardedAt: new Date(),
      },
      update: {
        nickname: body.nickname ?? undefined,
        learnerRole: body.learnerRole ?? undefined,
        learningGoal: body.learningGoal ?? undefined,
        timeBudget: body.timeBudget ?? undefined,
        interestsJson: body.interests ?? undefined,
        onboardedAt: new Date(),
      },
    });

    return NextResponse.json({ preference: pref });
  } catch (err) {
    return handleApiError(err);
  }
}
