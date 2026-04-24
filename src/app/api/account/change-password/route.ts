import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";
import { requireUser } from "../../../../lib/session";
import { handleApiError, jsonError } from "../../../../lib/api-utils";

const changeSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(200),
    confirmPassword: z.string().min(8).max(200),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password baru dan konfirmasi tidak sama",
    path: ["confirmPassword"],
  });

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = changeSchema.parse(await req.json());

    const record = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });

    if (!record?.passwordHash) {
      return jsonError(
        "Akun ini login via OAuth (Google) dan belum punya password lokal. Set password baru lewat admin dulu.",
        400,
      );
    }

    const ok = await bcrypt.compare(body.currentPassword, record.passwordHash);
    if (!ok) return jsonError("Password saat ini salah", 401);

    if (body.currentPassword === body.newPassword) {
      return jsonError("Password baru harus berbeda dari password saat ini", 400);
    }

    const newHash = await bcrypt.hash(body.newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
