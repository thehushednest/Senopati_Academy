import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { requireUser } from "../../../lib/session";
import { handleApiError } from "../../../lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const limitRaw = searchParams.get("limit");
    const limit = Math.min(50, Math.max(1, Number.parseInt(limitRaw ?? "20", 10) || 20));
    const unreadOnly = searchParams.get("unread") === "1";

    const where = unreadOnly
      ? { userId: user.id, readAt: null }
      : { userId: user.id };

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({ where: { userId: user.id, readAt: null } }),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (err) {
    return handleApiError(err);
  }
}
