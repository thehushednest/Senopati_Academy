import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../../lib/prisma";
import { requireUser } from "../../../../../lib/session";
import { handleApiError } from "../../../../../lib/api-utils";

const replySchema = z.object({
  body: z.string().min(2).max(4000),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = replySchema.parse(await req.json());

    const reply = await prisma.discussionReply.create({
      data: {
        threadId: id,
        authorId: user.id,
        body: body.body,
      },
      include: { author: { select: { id: true, name: true, avatarUrl: true } } },
    });

    // Bump thread updatedAt
    await prisma.discussionThread.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ reply });
  } catch (err) {
    return handleApiError(err);
  }
}
