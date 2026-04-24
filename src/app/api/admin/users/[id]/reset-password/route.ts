import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../../../lib/prisma";
import { requireAdmin } from "../../../../../../lib/session";
import { handleApiError, jsonError } from "../../../../../../lib/api-utils";

/**
 * Reset password user dengan password sementara acak. Admin kemudian bagikan
 * password baru ini ke user secara manual (email/WA) sampai SMTP wired.
 */
function generateTempPassword(): string {
  // 12 char, mix letter + digit, tanpa char membingungkan (0/O/1/l/I).
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let p = "";
  for (let i = 0; i < 12; i++) p += chars[Math.floor(Math.random() * chars.length)];
  return p;
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!user) return jsonError("User not found", 404);

    const tempPassword = generateTempPassword();
    const hash = await bcrypt.hash(tempPassword, 10);
    await prisma.user.update({ where: { id }, data: { passwordHash: hash } });

    // Return plaintext password sekali — admin salin dan bagikan langsung.
    // Password tidak pernah disimpan plaintext di DB.
    return NextResponse.json({ ok: true, tempPassword });
  } catch (err) {
    return handleApiError(err);
  }
}
