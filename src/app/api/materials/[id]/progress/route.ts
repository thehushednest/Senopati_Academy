import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../../lib/prisma";
import { requireUser } from "../../../../../lib/session";
import { handleApiError, jsonError } from "../../../../../lib/api-utils";

const upsertSchema = z.object({
  lastSlideIndex: z.number().int().min(0).max(5000),
  // Optional — kalau client tahu total pages dari pdf.js, sekalian update material.
  totalPages: z.number().int().min(1).max(5000).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const record = await prisma.slideProgress.findUnique({
      where: { studentId_materialId: { studentId: user.id, materialId: id } },
    });
    return NextResponse.json({ progress: record });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = upsertSchema.parse(await req.json());

    const material = await prisma.sessionMaterial.findUnique({
      where: { id },
      select: { id: true, totalPages: true },
    });
    if (!material) return jsonError("Material not found", 404);

    // Upsert dengan max-semantic: maxSlideIndex hanya naik, tidak pernah turun.
    const existing = await prisma.slideProgress.findUnique({
      where: { studentId_materialId: { studentId: user.id, materialId: id } },
    });

    const newMax = Math.max(existing?.maxSlideIndex ?? 0, body.lastSlideIndex);

    const progress = await prisma.slideProgress.upsert({
      where: { studentId_materialId: { studentId: user.id, materialId: id } },
      create: {
        studentId: user.id,
        materialId: id,
        lastSlideIndex: body.lastSlideIndex,
        maxSlideIndex: newMax,
      },
      update: {
        lastSlideIndex: body.lastSlideIndex,
        maxSlideIndex: newMax,
      },
    });

    // Opportunistic: kalau client kirim totalPages dan DB belum ada, update.
    if (body.totalPages && material.totalPages !== body.totalPages) {
      await prisma.sessionMaterial
        .update({
          where: { id },
          data: { totalPages: body.totalPages },
        })
        .catch(() => {
          // non-critical
        });
    }

    return NextResponse.json({ progress });
  } catch (err) {
    return handleApiError(err);
  }
}
