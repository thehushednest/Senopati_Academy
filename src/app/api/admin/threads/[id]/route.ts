import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { requireAdmin } from "../../../../../lib/session";
import { handleApiError, jsonError } from "../../../../../lib/api-utils";

/**
 * Admin moderation: hapus thread (cascade replies + likes via Prisma).
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const thread = await prisma.discussionThread.findUnique({ where: { id }, select: { id: true } });
    if (!thread) return jsonError("Thread not found", 404);
    await prisma.discussionThread.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
