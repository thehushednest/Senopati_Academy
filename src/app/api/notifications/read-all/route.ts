import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireUser } from "../../../../lib/session";
import { handleApiError } from "../../../../lib/api-utils";

export async function POST() {
  try {
    const user = await requireUser();
    const now = new Date();
    await prisma.notification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: now },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
