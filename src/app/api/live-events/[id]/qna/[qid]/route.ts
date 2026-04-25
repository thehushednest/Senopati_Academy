import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../../../lib/prisma";
import { requireUser } from "../../../../../../lib/session";
import { handleApiError, jsonError } from "../../../../../../lib/api-utils";
import { publishToRoom } from "../../../../../../lib/live-presenter-bus";

const patchSchema = z.object({
  answered: z.boolean(),
});

/**
 * PATCH — host (atau admin) tandai pertanyaan sudah dijawab / un-mark.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; qid: string }> }
) {
  try {
    const user = await requireUser();
    const { id, qid } = await params;
    const body = patchSchema.parse(await req.json());

    const event = await prisma.liveEvent.findUnique({
      where: { id },
      select: { hostId: true },
    });
    if (!event) return jsonError("Event tidak ditemukan", 404);
    if (user.role !== "admin" && event.hostId !== user.id) {
      return jsonError("Hanya host atau admin yang bisa tandai answered", 403);
    }

    const updated = await prisma.liveEventQuestion.update({
      where: { id: qid },
      data: {
        answered: body.answered,
        answeredAt: body.answered ? new Date() : null,
      },
      select: { id: true, upvotes: true, answered: true, eventId: true },
    });

    if (updated.eventId !== id) return jsonError("Q&A bukan dari event ini", 400);

    publishToRoom(id, {
      type: "qna_update",
      payload: { id: updated.id, upvotes: updated.upvotes, answered: updated.answered },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * DELETE — host/admin atau author sendiri boleh hapus.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; qid: string }> }
) {
  try {
    const user = await requireUser();
    const { id, qid } = await params;

    const q = await prisma.liveEventQuestion.findUnique({
      where: { id: qid },
      select: { id: true, authorId: true, eventId: true, event: { select: { hostId: true } } },
    });
    if (!q || q.eventId !== id) return jsonError("Q&A tidak ditemukan", 404);

    const isHost = q.event.hostId === user.id;
    const isAuthor = q.authorId === user.id;
    if (!isHost && !isAuthor && user.role !== "admin") {
      return jsonError("Tidak boleh hapus Q&A orang lain", 403);
    }

    await prisma.liveEventQuestion.delete({ where: { id: qid } });

    publishToRoom(id, { type: "qna_delete", payload: { id: qid } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
