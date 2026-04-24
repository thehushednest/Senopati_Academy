import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { requireUser } from "../../../lib/session";
import { handleApiError, jsonError } from "../../../lib/api-utils";
import { notifyRoles } from "../../../lib/notify";
import { findModule } from "../../../lib/content";

const createSchema = z.object({
  moduleSlug: z.string().min(1).max(120),
  sessionIndex: z.number().int().min(0).max(50).optional().nullable(),
  title: z.string().min(3).max(160),
  body: z.string().min(5).max(4000),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const moduleSlug = searchParams.get("moduleSlug");
    if (!moduleSlug) return jsonError("moduleSlug required", 400);

    const threads = await prisma.discussionThread.findMany({
      where: { moduleSlug },
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { replies: true, likes: true } },
      },
    });

    return NextResponse.json({ threads });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = createSchema.parse(await req.json());

    const thread = await prisma.discussionThread.create({
      data: {
        authorId: user.id,
        moduleSlug: body.moduleSlug,
        sessionIndex: body.sessionIndex ?? null,
        title: body.title,
        body: body.body,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { replies: true, likes: true } },
      },
    });

    // Notifikasi tutor/admin: thread baru butuh perhatian. Skip kalau author
    // sendiri tutor/admin supaya tidak mengirim notif ke diri sendiri.
    if (user.role !== "tutor" && user.role !== "admin") {
      const mod = findModule(body.moduleSlug);
      await notifyRoles({
        roles: ["tutor", "admin"],
        excludeUserId: user.id,
        title: `Thread baru dari ${user.name}`,
        body: `${mod?.title ?? body.moduleSlug} — "${body.title.slice(0, 100)}${body.title.length > 100 ? "…" : ""}"`,
        href: `/belajar/${body.moduleSlug}/diskusi/${thread.id}`,
      });
    }

    return NextResponse.json({ thread });
  } catch (err) {
    return handleApiError(err);
  }
}
