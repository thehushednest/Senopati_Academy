import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../../lib/prisma";
import { requireUser } from "../../../../../lib/session";
import { handleApiError } from "../../../../../lib/api-utils";
import { notify } from "../../../../../lib/notify";

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

    // Bump thread updatedAt + ambil data untuk notifikasi.
    const thread = await prisma.discussionThread.update({
      where: { id },
      data: { updatedAt: new Date() },
      select: { authorId: true, title: true, moduleSlug: true },
    });

    // Notifikasi ke pemilik thread — kecuali dia sendiri yang bales.
    if (thread.authorId !== user.id) {
      const preview = body.body.length > 120 ? body.body.slice(0, 120) + "…" : body.body;
      await notify({
        userId: thread.authorId,
        title: `${user.name} membalas thread kamu`,
        body: `"${thread.title}" — ${preview}`,
        href: `/belajar/${thread.moduleSlug}/diskusi/${id}`,
      });
    }

    return NextResponse.json({ reply });
  } catch (err) {
    return handleApiError(err);
  }
}
