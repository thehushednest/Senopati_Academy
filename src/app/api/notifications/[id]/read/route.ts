import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { requireUser } from "../../../../../lib/session";
import { handleApiError, jsonError } from "../../../../../lib/api-utils";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    // Validasi ownership: user hanya bisa mark-read notifikasinya sendiri.
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== user.id) {
      return jsonError("Notification not found", 404);
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { readAt: notif.readAt ?? new Date() },
    });
    return NextResponse.json({ notification: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
