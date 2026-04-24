import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { requireUser } from "../../../lib/session";
import { handleApiError, jsonError } from "../../../lib/api-utils";
import { headObject, publicUrl } from "../../../lib/storage";
import { findModule, modulesByMentor } from "../../../lib/content";
import { auditLog } from "../../../lib/audit";

const commitSchema = z.object({
  moduleSlug: z.string().min(1).max(120),
  sessionIndex: z.number().int().min(0).max(50),
  objectKey: z.string().min(3).max(500),
  pdfFilename: z.string().min(1).max(300),
  title: z.string().max(200).optional(),
  sourceFormat: z.enum(["pdf", "ppt", "pptx"]).default("pdf"),
  changeNote: z.string().max(500).optional(),
});

/**
 * GET: ambil material aktif untuk moduleSlug + sessionIndex tertentu.
 * Endpoint ini public-readable karena material memang dirancang publik
 * setelah upload (sesi belajar tidak butuh auth untuk sekadar preview).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const moduleSlug = searchParams.get("moduleSlug");
    const sessionIndexRaw = searchParams.get("sessionIndex");
    if (!moduleSlug || sessionIndexRaw === null) {
      return jsonError("moduleSlug & sessionIndex required", 400);
    }
    const sessionIndex = Number.parseInt(sessionIndexRaw, 10);
    if (Number.isNaN(sessionIndex)) return jsonError("sessionIndex invalid", 400);

    const material = await prisma.sessionMaterial.findUnique({
      where: { moduleSlug_sessionIndex: { moduleSlug, sessionIndex } },
      include: {
        uploadedBy: { select: { id: true, name: true } },
        versions: {
          orderBy: { uploadedAt: "desc" },
          take: 10,
          include: { uploadedBy: { select: { id: true, name: true } } },
        },
      },
    });

    return NextResponse.json({ material });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * POST: commit material setelah client selesai upload ke MinIO via presigned URL.
 * Verify object benar-benar ada + authorization ulang (tutor boleh modul miliknya
 * saja, admin boleh semua), lalu create SessionMaterial (atau update+add version
 * kalau sudah ada).
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = commitSchema.parse(await req.json());

    const mod = findModule(body.moduleSlug);
    if (!mod) return jsonError("Module not found", 404);
    if (body.sessionIndex >= mod.syllabus.length) {
      return jsonError("Session index out of range", 400);
    }

    // Authorization ulang — presigned URL tidak jamin caller sama.
    if (user.role !== "admin") {
      if (user.role !== "tutor") return jsonError("Forbidden", 403);
      const record = await prisma.user.findUnique({
        where: { id: user.id },
        select: { mentorSlug: true },
      });
      if (!record?.mentorSlug) return jsonError("Akunmu belum di-map ke mentor track", 403);
      const ownedSlugs = modulesByMentor(record.mentorSlug).map((m) => m.slug);
      if (!ownedSlugs.includes(body.moduleSlug)) {
        return jsonError("Modul ini tidak di-ampu oleh kamu", 403);
      }
    }

    // Verify file ada di MinIO
    const head = await headObject(body.objectKey);
    if (!head) return jsonError("File belum tersimpan di storage — coba upload ulang", 400);
    if (head.size > 50 * 1024 * 1024) {
      return jsonError("File melebihi batas 50MB", 400);
    }

    const existing = await prisma.sessionMaterial.findUnique({
      where: {
        moduleSlug_sessionIndex: {
          moduleSlug: body.moduleSlug,
          sessionIndex: body.sessionIndex,
        },
      },
    });

    const pdfUrl = publicUrl(body.objectKey);

    let material;
    if (existing) {
      // Update active + add version (tidak hapus file lama — tetap tersimpan sebagai history)
      material = await prisma.sessionMaterial.update({
        where: { id: existing.id },
        data: {
          pdfUrl,
          objectKey: body.objectKey,
          pdfFilename: body.pdfFilename,
          pdfSizeBytes: head.size,
          totalPages: null, // reset, client akan update setelah render
          sourceFormat: body.sourceFormat,
          title: body.title ?? existing.title,
          uploadedById: user.id,
          uploadedAt: new Date(),
          versions: {
            create: {
              pdfUrl,
              objectKey: body.objectKey,
              pdfFilename: body.pdfFilename,
              pdfSizeBytes: head.size,
              sourceFormat: body.sourceFormat,
              uploadedById: user.id,
              changeNote: body.changeNote ?? null,
            },
          },
        },
      });
    } else {
      material = await prisma.sessionMaterial.create({
        data: {
          moduleSlug: body.moduleSlug,
          sessionIndex: body.sessionIndex,
          title: body.title ?? null,
          pdfUrl,
          objectKey: body.objectKey,
          pdfFilename: body.pdfFilename,
          pdfSizeBytes: head.size,
          sourceFormat: body.sourceFormat,
          uploadedById: user.id,
          versions: {
            create: {
              pdfUrl,
              objectKey: body.objectKey,
              pdfFilename: body.pdfFilename,
              pdfSizeBytes: head.size,
              sourceFormat: body.sourceFormat,
              uploadedById: user.id,
              changeNote: body.changeNote ?? "Upload pertama",
            },
          },
        },
      });
    }

    await auditLog({
      actorId: user.id,
      action: existing ? "material.update" : "material.create",
      target: material.id,
      meta: {
        moduleSlug: body.moduleSlug,
        sessionIndex: body.sessionIndex,
        filename: body.pdfFilename,
        sizeBytes: head.size,
        sourceFormat: body.sourceFormat,
      },
    });

    return NextResponse.json({ material });
  } catch (err) {
    return handleApiError(err);
  }
}
