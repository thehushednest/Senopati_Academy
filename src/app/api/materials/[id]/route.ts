import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { requireUser } from "../../../../lib/session";
import { handleApiError, jsonError } from "../../../../lib/api-utils";
import { deleteObject } from "../../../../lib/storage";
import { modulesByMentor } from "../../../../lib/content";
import { auditLog } from "../../../../lib/audit";

const updateSchema = z.object({
  title: z.string().max(200).nullable().optional(),
  totalPages: z.number().int().min(1).max(5000).optional(),
});

/**
 * PATCH: update metadata — biasanya totalPages diisi client setelah pdf.js render.
 * Authorization sama dengan upload.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = updateSchema.parse(await req.json());

    const existing = await prisma.sessionMaterial.findUnique({ where: { id } });
    if (!existing) return jsonError("Material not found", 404);

    if (user.role !== "admin") {
      if (user.role !== "tutor") return jsonError("Forbidden", 403);
      const record = await prisma.user.findUnique({
        where: { id: user.id },
        select: { mentorSlug: true },
      });
      if (!record?.mentorSlug) return jsonError("Akunmu belum di-map ke mentor track", 403);
      const ownedSlugs = modulesByMentor(record.mentorSlug).map((m) => m.slug);
      if (!ownedSlugs.includes(existing.moduleSlug)) {
        return jsonError("Modul ini tidak di-ampu oleh kamu", 403);
      }
    }

    const updated = await prisma.sessionMaterial.update({
      where: { id },
      data: {
        title: body.title === null ? null : body.title ?? undefined,
        totalPages: body.totalPages ?? undefined,
      },
    });

    return NextResponse.json({ material: updated });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * DELETE: hapus material aktif + semua versi + semua slide progress.
 * Juga delete semua object di MinIO (iterasi versions).
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const existing = await prisma.sessionMaterial.findUnique({
      where: { id },
      include: { versions: { select: { objectKey: true } } },
    });
    if (!existing) return jsonError("Material not found", 404);

    if (user.role !== "admin") {
      if (user.role !== "tutor") return jsonError("Forbidden", 403);
      const record = await prisma.user.findUnique({
        where: { id: user.id },
        select: { mentorSlug: true },
      });
      if (!record?.mentorSlug) return jsonError("Akunmu belum di-map ke mentor track", 403);
      const ownedSlugs = modulesByMentor(record.mentorSlug).map((m) => m.slug);
      if (!ownedSlugs.includes(existing.moduleSlug)) {
        return jsonError("Modul ini tidak di-ampu oleh kamu", 403);
      }
    }

    // Hapus semua versi di storage — best effort, kalau gagal tetap lanjut.
    const keysToDelete = new Set<string>([existing.objectKey]);
    for (const v of existing.versions) keysToDelete.add(v.objectKey);
    for (const key of keysToDelete) {
      await deleteObject(key);
    }

    await prisma.sessionMaterial.delete({ where: { id } });

    await auditLog({
      actorId: user.id,
      action: "material.delete",
      target: id,
      meta: {
        moduleSlug: existing.moduleSlug,
        sessionIndex: existing.sessionIndex,
        filename: existing.pdfFilename,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
