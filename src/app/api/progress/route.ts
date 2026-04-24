import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { requireUser } from "../../../lib/session";
import { handleApiError, jsonError } from "../../../lib/api-utils";

const upsertSchema = z.object({
  moduleSlug: z.string().min(1).max(120),
  sessionIndex: z.number().int().min(0).max(50),
  totalSessions: z.number().int().min(1).max(50),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const moduleSlug = searchParams.get("moduleSlug");

    if (moduleSlug) {
      const progress = await prisma.moduleProgress.findUnique({
        where: { studentId_moduleSlug: { studentId: user.id, moduleSlug } },
      });
      return NextResponse.json({ progress });
    }

    const all = await prisma.moduleProgress.findMany({
      where: { studentId: user.id },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ progresses: all });
  } catch (err) {
    return handleApiError(err);
  }
}

// POST upserts progress: menandai sesi N selesai, increment completedSessions jika sesi ini baru.
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = upsertSchema.parse(await req.json());

    if (body.sessionIndex >= body.totalSessions) {
      return jsonError("sessionIndex >= totalSessions", 400);
    }

    const existing = await prisma.moduleProgress.findUnique({
      where: { studentId_moduleSlug: { studentId: user.id, moduleSlug: body.moduleSlug } },
    });

    // completedSessions tracks jumlah sesi yang sudah complete. Index 0 selesai → completedSessions=1.
    const newCompleted = Math.max(existing?.completedSessions ?? 0, body.sessionIndex + 1);

    const progress = await prisma.moduleProgress.upsert({
      where: { studentId_moduleSlug: { studentId: user.id, moduleSlug: body.moduleSlug } },
      create: {
        studentId: user.id,
        moduleSlug: body.moduleSlug,
        totalSessions: body.totalSessions,
        completedSessions: newCompleted,
        lastSessionIndex: body.sessionIndex,
      },
      update: {
        totalSessions: body.totalSessions,
        completedSessions: newCompleted,
        lastSessionIndex: body.sessionIndex,
      },
    });

    return NextResponse.json({ progress });
  } catch (err) {
    return handleApiError(err);
  }
}
