import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { requireUser } from "../../../../../lib/session";
import { handleApiError, jsonError } from "../../../../../lib/api-utils";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const event = await prisma.liveEvent.findUnique({
      where: { id },
      include: { _count: { select: { rsvps: true } } },
    });
    if (!event) return jsonError("Event tidak ditemukan", 404);
    if (event.status === "cancelled" || event.status === "ended") {
      return jsonError("Event sudah selesai atau dibatalkan", 400);
    }

    // Cap participants check
    if (event.maxParticipants && event._count.rsvps >= event.maxParticipants) {
      const existing = await prisma.liveEventRSVP.findUnique({
        where: { eventId_userId: { eventId: id, userId: user.id } },
      });
      // Reject hanya kalau user belum RSVP
      if (!existing) {
        return jsonError("RSVP penuh — kapasitas sudah tercapai", 400);
      }
    }

    const rsvp = await prisma.liveEventRSVP.upsert({
      where: { eventId_userId: { eventId: id, userId: user.id } },
      create: { eventId: id, userId: user.id },
      update: {}, // no-op kalau sudah ada
    });

    return NextResponse.json({ rsvp });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await prisma.liveEventRSVP.deleteMany({
      where: { eventId: id, userId: user.id },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
