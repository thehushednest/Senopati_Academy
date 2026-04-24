import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { handleApiError, jsonError } from "../../../../lib/api-utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const thread = await prisma.discussionThread.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        replies: {
          orderBy: { createdAt: "asc" },
          include: { author: { select: { id: true, name: true, avatarUrl: true } } },
        },
        _count: { select: { likes: true } },
      },
    });
    if (!thread) return jsonError("Thread not found", 404);
    return NextResponse.json({ thread });
  } catch (err) {
    return handleApiError(err);
  }
}
