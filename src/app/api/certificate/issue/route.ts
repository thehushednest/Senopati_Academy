import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { requireUser } from "../../../../lib/session";
import { handleApiError, jsonError } from "../../../../lib/api-utils";

const issueSchema = z.object({
  moduleSlug: z.string().min(1).max(120),
});

function generateCertCode(moduleSlug: string) {
  const prefix = moduleSlug.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SENACAD-${prefix}-${rand}`;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = issueSchema.parse(await req.json());

    // Cek dulu: apakah siswa sudah lulus final exam untuk modul ini?
    const passedExam = await prisma.quizSubmission.findFirst({
      where: {
        studentId: user.id,
        moduleSlug: body.moduleSlug,
        quizType: "final_exam",
        passed: true,
      },
      orderBy: { submittedAt: "desc" },
    });

    if (!passedExam) {
      return jsonError("Belum lulus ujian akhir untuk modul ini", 403);
    }

    // Idempotent: kalau sertifikat sudah ada, return yang existing.
    const existing = await prisma.moduleCertificate.findUnique({
      where: { studentId_moduleSlug: { studentId: user.id, moduleSlug: body.moduleSlug } },
    });
    if (existing) return NextResponse.json({ certificate: existing });

    // Generate kode unik. Retry beberapa kali jika collision.
    let attempts = 0;
    let code = generateCertCode(body.moduleSlug);
    while (attempts < 5) {
      const dup = await prisma.moduleCertificate.findUnique({ where: { certCode: code } });
      if (!dup) break;
      code = generateCertCode(body.moduleSlug);
      attempts++;
    }

    const certificate = await prisma.moduleCertificate.create({
      data: {
        studentId: user.id,
        moduleSlug: body.moduleSlug,
        certCode: code,
        score: passedExam.score,
      },
    });

    return NextResponse.json({ certificate });
  } catch (err) {
    return handleApiError(err);
  }
}
