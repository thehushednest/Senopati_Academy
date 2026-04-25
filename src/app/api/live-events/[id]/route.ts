import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { requireUser } from "../../../../lib/session";
import { handleApiError, jsonError } from "../../../../lib/api-utils";
import { notify } from "../../../../lib/notify";
import { findModule } from "../../../../lib/content";

const updateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(4000).nullable().optional(),
  scheduledAt: z.string().datetime().optional(),
  durationMinutes: z.number().int().min(5).max(480).optional(),
  meetingUrl: z.string().url().nullable().optional(),
  recordingUrl: z.string().url().nullable().optional(),
  status: z.enum(["scheduled", "live", "ended", "cancelled"]).optional(),
  maxParticipants: z.number().int().min(1).max(10000).nullable().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await prisma.liveEvent.findUnique({
      where: { id },
      include: {
        host: { select: { id: true, name: true, avatarUrl: true } },
        rsvps: {
          include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
          orderBy: { rsvpAt: "asc" },
          take: 200,
        },
        _count: { select: { rsvps: true } },
      },
    });
    if (!event) return jsonError("Event tidak ditemukan", 404);
    return NextResponse.json({ event });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * PATCH — host (atau admin) update event. Trigger notif ke RSVPed kalau:
 *  - status berubah (mis. ended → trigger "Recording siap")
 *  - recordingUrl di-set (notif "Recording siap")
 *  - jadwal berubah signifikan (>15 menit)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = updateSchema.parse(await req.json());

    const existing = await prisma.liveEvent.findUnique({
      where: { id },
      include: { rsvps: { select: { userId: true } } },
    });
    if (!existing) return jsonError("Event tidak ditemukan", 404);

    if (user.role !== "admin" && existing.hostId !== user.id) {
      return jsonError("Hanya host atau admin yang bisa edit event ini", 403);
    }

    const updated = await prisma.liveEvent.update({
      where: { id },
      data: {
        title: body.title ?? undefined,
        description: body.description === null ? null : body.description ?? undefined,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
        durationMinutes: body.durationMinutes ?? undefined,
        meetingUrl: body.meetingUrl === null ? null : body.meetingUrl ?? undefined,
        recordingUrl: body.recordingUrl === null ? null : body.recordingUrl ?? undefined,
        status: body.status ?? undefined,
        maxParticipants:
          body.maxParticipants === null ? null : body.maxParticipants ?? undefined,
        // Auto-set status=ended kalau recordingUrl di-set tapi status masih live/scheduled
        ...(body.recordingUrl &&
        existing.status !== "ended" &&
        body.status === undefined
          ? { status: "ended" }
          : {}),
      },
    });

    // Trigger notif ke RSVPed
    const mod = updated.moduleSlug ? findModule(updated.moduleSlug) : null;
    const targets = existing.rsvps
      .map((r) => r.userId)
      .filter((uid) => uid !== user.id);

    if (body.recordingUrl && existing.recordingUrl !== body.recordingUrl) {
      // Recording baru → notify peserta
      await Promise.all(
        targets.map((uid) =>
          notify({
            userId: uid,
            title: `Recording siap: ${updated.title}`,
            body: `${mod?.title ?? "Live session"} — buka rekamannya kapan saja.`,
            href: `/live-session`,
          }),
        ),
      );
    } else if (body.status === "cancelled" && existing.status !== "cancelled") {
      await Promise.all(
        targets.map((uid) =>
          notify({
            userId: uid,
            title: `Live dibatalkan: ${updated.title}`,
            body: `${mod?.title ?? "Live session"} — host membatalkan jadwal.`,
            href: `/live-session`,
          }),
        ),
      );
    } else if (
      body.scheduledAt &&
      Math.abs(new Date(body.scheduledAt).getTime() - existing.scheduledAt.getTime()) >
        15 * 60 * 1000
    ) {
      const newDate = new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(body.scheduledAt));
      await Promise.all(
        targets.map((uid) =>
          notify({
            userId: uid,
            title: `Jadwal berubah: ${updated.title}`,
            body: `Sekarang ${newDate}`,
            href: `/live-session`,
          }),
        ),
      );
    }

    return NextResponse.json({ event: updated });
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
    const event = await prisma.liveEvent.findUnique({
      where: { id },
      include: { rsvps: { select: { userId: true } } },
    });
    if (!event) return jsonError("Event tidak ditemukan", 404);
    if (user.role !== "admin" && event.hostId !== user.id) {
      return jsonError("Hanya host atau admin yang bisa hapus event ini", 403);
    }
    await prisma.liveEvent.delete({ where: { id } });

    // Notif RSVPed bahwa event di-delete (kalau bukan host sendiri)
    const targets = event.rsvps.map((r) => r.userId).filter((uid) => uid !== user.id);
    await Promise.all(
      targets.map((uid) =>
        notify({
          userId: uid,
          title: `Live dibatalkan: ${event.title}`,
          body: "Event ini dihapus oleh host.",
          href: `/live-session`,
        }),
      ),
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
