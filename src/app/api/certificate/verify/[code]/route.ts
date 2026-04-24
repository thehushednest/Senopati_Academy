import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { handleApiError, jsonError } from "../../../../../lib/api-utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const cert = await prisma.moduleCertificate.findUnique({
      where: { certCode: code },
      include: {
        student: { select: { name: true } },
      },
    });

    if (!cert) return jsonError("Sertifikat tidak ditemukan", 404);

    return NextResponse.json({
      valid: true,
      certificate: {
        certCode: cert.certCode,
        moduleSlug: cert.moduleSlug,
        issuedAt: cert.issuedAt,
        score: cert.score,
        studentName: cert.student.name,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
