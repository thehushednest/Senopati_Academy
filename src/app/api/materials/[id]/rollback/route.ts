import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../../lib/prisma";
import { requireUser } from "../../../../../lib/session";
import { handleApiError, jsonError } from "../../../../../lib/api-utils";
import { modulesByMentor } from "../../../../../lib/content";
import { auditLog } from "../../../../../lib/audit";

const schema = z.object({
  versionId: z.string().min(1),
});

/**
 * Rollback SessionMaterial ke versi tertentu (dari history).
 * Update SessionMaterial.pdfUrl/objectKey/etc ke nilai versi target,
 * lalu add new entry di SessionMaterialVersion sebagai marker rollback
 * (supaya history tetap forward-only — tidak ada delete versi).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = schema.parse(await req.json());

    const material = await prisma.sessionMaterial.findUnique({
      where: { id },
      include: {
        versions: {
          where: { id: body.versionId },
          take: 1,
        },
      },
    });
    if (!material) return jsonError("Material not found", 404);

    const targetVersion = material.versions[0];
    if (!targetVersion) return jsonError("Versi tidak ditemukan", 404);
    if (targetVersion.objectKey === material.objectKey) {
      return jsonError("Versi ini sudah aktif", 400);
    }

    // Authorization sama dengan upload — admin atau tutor yang ampu modul.
    if (user.role !== "admin") {
      if (user.role !== "tutor") return jsonError("Forbidden", 403);
      const record = await prisma.user.findUnique({
        where: { id: user.id },
        select: { mentorSlug: true },
      });
      if (!record?.mentorSlug) return jsonError("Akunmu belum di-map ke mentor track", 403);
      const ownedSlugs = modulesByMentor(record.mentorSlug).map((m) => m.slug);
      if (!ownedSlugs.includes(material.moduleSlug)) {
        return jsonError("Modul ini tidak di-ampu oleh kamu", 403);
      }
    }

    const previousObjectKey = material.objectKey;

    // Update active pointer + tambah versi marker rollback.
    const updated = await prisma.sessionMaterial.update({
      where: { id },
      data: {
        pdfUrl: targetVersion.pdfUrl,
        objectKey: targetVersion.objectKey,
        pdfFilename: targetVersion.pdfFilename,
        pdfSizeBytes: targetVersion.pdfSizeBytes,
        sourceFormat: targetVersion.sourceFormat,
        // totalPages reset — bisa beda antar versi, biar client re-detect
        totalPages: null,
        uploadedById: user.id,
        uploadedAt: new Date(),
        versions: {
          create: {
            pdfUrl: targetVersion.pdfUrl,
            objectKey: targetVersion.objectKey,
            pdfFilename: targetVersion.pdfFilename,
            pdfSizeBytes: targetVersion.pdfSizeBytes,
            sourceFormat: targetVersion.sourceFormat,
            uploadedById: user.id,
            changeNote: `Rollback ke versi sebelumnya (${targetVersion.pdfFilename})`,
          },
        },
      },
    });

    await auditLog({
      actorId: user.id,
      action: "material.rollback",
      target: id,
      meta: {
        moduleSlug: material.moduleSlug,
        sessionIndex: material.sessionIndex,
        rolledBackTo: targetVersion.id,
        previousObjectKey,
      },
    });

    return NextResponse.json({ material: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
