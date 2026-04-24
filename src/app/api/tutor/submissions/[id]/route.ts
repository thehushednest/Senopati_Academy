import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../../lib/prisma";
import { requireTutor } from "../../../../../lib/session";
import { handleApiError, jsonError } from "../../../../../lib/api-utils";
import { notify } from "../../../../../lib/notify";
import { findModule } from "../../../../../lib/content";

const reviewSchema = z.object({
  status: z.enum(["reviewing", "approved", "needs_revision"]),
  feedback: z.string().min(3).max(8000).optional().nullable(),
  grade: z.number().int().min(0).max(100).optional().nullable(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireTutor();
    const { id } = await params;
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, name: true, email: true, avatarUrl: true, school: true, grade: true } },
        reviewer: { select: { id: true, name: true } },
      },
    });
    if (!submission) return jsonError("Submission not found", 404);
    return NextResponse.json({ submission });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tutor = await requireTutor();
    const { id } = await params;
    const body = reviewSchema.parse(await req.json());

    const existing = await prisma.assignmentSubmission.findUnique({ where: { id } });
    if (!existing) return jsonError("Submission not found", 404);

    const updated = await prisma.assignmentSubmission.update({
      where: { id },
      data: {
        status: body.status,
        feedback: body.feedback ?? undefined,
        grade: body.grade ?? undefined,
        reviewerId: tutor.id,
        reviewedAt: body.status === "reviewing" ? null : new Date(),
      },
      include: {
        student: { select: { id: true, name: true } },
        reviewer: { select: { id: true, name: true } },
      },
    });

    // Kirim notifikasi ke student ketika review final (approved / needs_revision).
    if (body.status === "approved" || body.status === "needs_revision") {
      const mod = findModule(updated.moduleSlug);
      const moduleTitle = mod?.title ?? updated.moduleSlug;
      const sessionLabel = `Sesi ${String(updated.sessionIndex + 1).padStart(2, "0")}`;
      const verdict = body.status === "approved" ? "disetujui" : "perlu revisi";
      const gradeText = updated.grade !== null ? ` (nilai ${updated.grade})` : "";
      await notify({
        userId: updated.studentId,
        title: `Tugas ${sessionLabel} ${verdict}${gradeText}`,
        body: updated.feedback
          ? updated.feedback.slice(0, 160) + (updated.feedback.length > 160 ? "…" : "")
          : `${moduleTitle} — review oleh ${tutor.name}.`,
        href: `/belajar/${updated.moduleSlug}/sesi/${updated.sessionIndex}/tugas`,
      });
    }

    return NextResponse.json({ submission: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
