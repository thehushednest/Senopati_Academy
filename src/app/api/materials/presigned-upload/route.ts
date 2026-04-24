import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { requireUser } from "../../../../lib/session";
import { handleApiError, jsonError } from "../../../../lib/api-utils";
import { getPresignedUploadUrl } from "../../../../lib/storage";
import { findModule, modulesByMentor } from "../../../../lib/content";
import { prisma } from "../../../../lib/prisma";

const schema = z.object({
  moduleSlug: z.string().min(1).max(120),
  sessionIndex: z.number().int().min(0).max(50),
  filename: z.string().min(1).max(300),
  contentType: z.string().min(1).max(120),
  sizeBytes: z.number().int().min(1).max(50 * 1024 * 1024), // hard cap 50MB
});

// Content-type yang diizinkan untuk upload. PDF primary; PPT/PPTX diterima
// untuk Fase 3 (auto-convert). Selain ini, tolak di sini.
const ALLOWED_CONTENT_TYPES = new Set([
  "application/pdf",
  "application/vnd.ms-powerpoint", // .ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
]);

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = schema.parse(await req.json());

    if (!ALLOWED_CONTENT_TYPES.has(body.contentType)) {
      return jsonError("File harus PDF, PPT, atau PPTX", 400);
    }

    // Validasi modul ada di content.ts
    const mod = findModule(body.moduleSlug);
    if (!mod) return jsonError("Module not found", 404);
    if (body.sessionIndex >= mod.syllabus.length) {
      return jsonError("Session index out of range", 400);
    }

    // Authorization: admin boleh semua; tutor hanya kalau modul ini diampu
    // (mentorSlug cocok dengan mod.mentorSlug).
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

    // Generate object key dengan versionId random — tidak clash dengan upload lama.
    const versionId = randomUUID();
    const ext = body.contentType === "application/pdf" ? "pdf" : body.contentType.includes("presentationml") ? "pptx" : "ppt";
    const objectKey = `modules/${body.moduleSlug}/sessions/${body.sessionIndex}/${versionId}.${ext}`;

    const presigned = await getPresignedUploadUrl({
      objectKey,
      contentType: body.contentType,
    });

    return NextResponse.json({
      objectKey,
      uploadUrl: presigned.url,
      publicUrl: presigned.publicUrl,
      expiresAt: presigned.expiresAt.toISOString(),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
