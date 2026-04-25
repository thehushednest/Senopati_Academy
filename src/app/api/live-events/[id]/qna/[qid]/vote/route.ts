import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "../../../../../../../lib/prisma";
import { requireUser } from "../../../../../../../lib/session";
import { handleApiError, jsonError } from "../../../../../../../lib/api-utils";
import { publishToRoom } from "../../../../../../../lib/live-presenter-bus";

/**
 * POST — toggle upvote untuk Q&A. Author tidak boleh vote sendiri.
 * Atomic transaksi supaya counter konsisten dengan vote rows.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; qid: string }> }
) {
  try {
    const user = await requireUser();
    const { id, qid } = await params;

    const q = await prisma.liveEventQuestion.findUnique({
      where: { id: qid },
      select: { id: true, authorId: true, eventId: true, upvotes: true },
    });
    if (!q || q.eventId !== id) return jsonError("Q&A tidak ditemukan", 404);
    if (q.authorId === user.id) return jsonError("Tidak bisa vote pertanyaan sendiri", 400);

    const existing = await prisma.liveEventQuestionVote.findUnique({
      where: { questionId_userId: { questionId: qid, userId: user.id } },
    });

    let newUpvotes: number;
    let answered: boolean;

    try {
      if (existing) {
        const result = await prisma.$transaction([
          prisma.liveEventQuestionVote.delete({
            where: { questionId_userId: { questionId: qid, userId: user.id } },
          }),
          prisma.liveEventQuestion.update({
            where: { id: qid },
            data: { upvotes: { decrement: 1 } },
            select: { upvotes: true, answered: true },
          }),
        ]);
        newUpvotes = result[1].upvotes;
        answered = result[1].answered;
      } else {
        const result = await prisma.$transaction([
          prisma.liveEventQuestionVote.create({
            data: { questionId: qid, userId: user.id },
          }),
          prisma.liveEventQuestion.update({
            where: { id: qid },
            data: { upvotes: { increment: 1 } },
            select: { upvotes: true, answered: true },
          }),
        ]);
        newUpvotes = result[1].upvotes;
        answered = result[1].answered;
      }
    } catch (err) {
      // P2002 = unique constraint violated → race condition double-click. Re-fetch state.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        const fresh = await prisma.liveEventQuestion.findUnique({
          where: { id: qid },
          select: { upvotes: true, answered: true },
        });
        newUpvotes = fresh?.upvotes ?? q.upvotes;
        answered = fresh?.answered ?? false;
      } else {
        throw err;
      }
    }

    publishToRoom(id, {
      type: "qna_update",
      payload: { id: qid, upvotes: newUpvotes, answered },
    });

    return NextResponse.json({ upvotes: newUpvotes, votedByMe: !existing });
  } catch (err) {
    return handleApiError(err);
  }
}
