import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { requireAdmin } from "../../../../../lib/session";
import { handleApiError, jsonError } from "../../../../../lib/api-utils";
import { auditLog } from "../../../../../lib/audit";

/**
 * Admin moderation: hapus thread (cascade replies + likes via Prisma).
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const thread = await prisma.discussionThread.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        moduleSlug: true,
        authorId: true,
        author: { select: { email: true } },
        _count: { select: { replies: true } },
      },
    });
    if (!thread) return jsonError("Thread not found", 404);

    await prisma.discussionThread.delete({ where: { id } });

    await auditLog({
      actorId: admin.id,
      action: "thread.delete",
      target: id,
      meta: {
        title: thread.title,
        moduleSlug: thread.moduleSlug,
        authorEmail: thread.author.email,
        repliesCount: thread._count.replies,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
