import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { requireUser } from "../../../../lib/session";
import { handleApiError, jsonError } from "../../../../lib/api-utils";
import { getPresignedUploadUrl } from "../../../../lib/storage";
import { findModule } from "../../../../lib/content";

const schema = z.object({
  moduleSlug: z.string().min(1).max(120),
  sessionIndex: z.number().int().min(0).max(50),
  filename: z.string().min(1).max(300),
  contentType: z.string().min(1).max(120),
  sizeBytes: z.number().int().min(1).max(10 * 1024 * 1024), // 10MB cap
});

// Format yang umum dipakai murid untuk lampiran tugas:
// PDF, screenshot (PNG/JPG/WEBP), notes (TXT/MD).
const ALLOWED_CONTENT_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/plain",
  "text/markdown",
]);

const EXT_BY_TYPE: Record<string, string> = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "text/plain": "txt",
  "text/markdown": "md",
};

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = schema.parse(await req.json());

    if (!ALLOWED_CONTENT_TYPES.has(body.contentType)) {
      return jsonError("File harus PDF, PNG/JPG/WEBP, TXT, atau MD", 400);
    }

    const mod = findModule(body.moduleSlug);
    if (!mod) return jsonError("Module not found", 404);
    if (body.sessionIndex >= mod.syllabus.length) {
      return jsonError("Session index out of range", 400);
    }

    // Path: assignments/{moduleSlug}/{sessionIndex}/{versionId}.{ext}
    // Tidak include userId di path supaya tidak terbocor di URL.
    // Bucket public-read; URL tidak guessable karena UUID.
    const versionId = randomUUID();
    const ext = EXT_BY_TYPE[body.contentType] ?? "bin";
    const objectKey = `assignments/${body.moduleSlug}/${body.sessionIndex}/${versionId}.${ext}`;

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
