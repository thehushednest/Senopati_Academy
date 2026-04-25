import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../../lib/prisma";
import { requireUser } from "../../../../../lib/session";
import { handleApiError, jsonError } from "../../../../../lib/api-utils";
import { publishToRoom } from "../../../../../lib/live-presenter-bus";

const createSchema = z.object({
  body: z.string().trim().min(3).max(1000),
});

/**
 * GET — list Q&A untuk event ini, sorted by upvotes desc lalu createdAt asc.
 * Authenticated user (RSVPed atau bukan) boleh lihat.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const questions = await prisma.liveEventQuestion.findMany({
      where: { eventId: id },
      orderBy: [{ upvotes: "desc" }, { createdAt: "asc" }],
      include: {
        author: { select: { id: true, name: true } },
        votes: { where: { userId: user.id }, select: { userId: true } },
      },
      take: 200,
    });

    return NextResponse.json({
      questions: questions.map((q) => ({
        id: q.id,
        authorId: q.authorId,
        authorName: q.author.name,
        body: q.body,
        upvotes: q.upvotes,
        answered: q.answered,
        createdAt: q.createdAt.getTime(),
        votedByMe: q.votes.length > 0,
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * POST — submit pertanyaan baru. Persisted, broadcast via SSE.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = createSchema.parse(await req.json());

    const event = await prisma.liveEvent.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!event) return jsonError("Event tidak ditemukan", 404);
    if (event.status === "cancelled") {
      return jsonError("Event sudah cancelled", 400);
    }

    const created = await prisma.liveEventQuestion.create({
      data: {
        eventId: id,
        authorId: user.id,
        body: body.body,
      },
    });

    publishToRoom(id, {
      type: "qna_new",
      payload: {
        id: created.id,
        authorId: user.id,
        authorName: user.name,
        body: created.body,
        upvotes: 0,
        answered: false,
        createdAt: created.createdAt.getTime(),
      },
    });

    return NextResponse.json({ id: created.id });
  } catch (err) {
    return handleApiError(err);
  }
}
