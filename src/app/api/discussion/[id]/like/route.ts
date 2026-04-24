import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { requireUser } from "../../../../../lib/session";
import { handleApiError } from "../../../../../lib/api-utils";

// Toggle like: create if not exists, delete if exists.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const existing = await prisma.discussionLike.findUnique({
      where: { threadId_userId: { threadId: id, userId: user.id } },
    });

    if (existing) {
      await prisma.discussionLike.delete({ where: { id: existing.id } });
    } else {
      await prisma.discussionLike.create({
        data: { threadId: id, userId: user.id },
      });
    }

    const count = await prisma.discussionLike.count({ where: { threadId: id } });
    return NextResponse.json({ liked: !existing, count });
  } catch (err) {
    return handleApiError(err);
  }
}
