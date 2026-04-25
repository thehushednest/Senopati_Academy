import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { requireUser } from "../../../lib/session";
import { handleApiError, jsonError } from "../../../lib/api-utils";
import { findModule, modulesByMentor } from "../../../lib/content";
import { notifyRoles, notify } from "../../../lib/notify";

const createSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(4000).optional(),
  moduleSlug: z.string().min(1).max(120).optional().nullable(),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().int().min(5).max(480).default(60),
  meetingUrl: z.string().url(),
  maxParticipants: z.number().int().min(1).max(10000).optional().nullable(),
});

/**
 * GET — list events. Query params:
 *   - upcoming=1 (default): hanya event scheduled atau live
 *   - moduleSlug: filter ke modul
 *   - hostId: filter ke host (tutor view "events saya")
 *   - includeEnded=1: include status ended/cancelled
 *
 * Public-readable — semua user bisa lihat list event upcoming.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const moduleSlug = searchParams.get("moduleSlug");
    const hostId = searchParams.get("hostId");
    const includeEnded = searchParams.get("includeEnded") === "1";
    const limit = Math.min(100, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "50", 10) || 50));

    const where: Prisma.LiveEventWhereInput = {};
    if (moduleSlug) where.moduleSlug = moduleSlug;
    if (hostId) where.hostId = hostId;
    if (!includeEnded) where.status = { in: ["scheduled", "live"] };

    const events = await prisma.liveEvent.findMany({
      where,
      orderBy: { scheduledAt: "asc" },
      take: limit,
      include: {
        host: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { rsvps: true } },
      },
    });

    return NextResponse.json({ events });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * POST — host (tutor/admin) buat event baru.
 * Tutor hanya boleh buat event di modul yang dia ampu (atau no scope).
 * Trigger notifikasi ke semua student kalau ada moduleSlug, atau ke
 * tutor/admin lain kalau platform-wide (skip masal student supaya tidak spam).
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    if (user.role !== "tutor" && user.role !== "admin") {
      return jsonError("Hanya tutor/admin yang bisa buat live event", 403);
    }

    const body = createSchema.parse(await req.json());

    // Validasi modul ada di content.ts kalau di-set
    if (body.moduleSlug) {
      const mod = findModule(body.moduleSlug);
      if (!mod) return jsonError("Modul tidak ditemukan di katalog", 400);

      // Tutor scope check
      if (user.role === "tutor") {
        const record = await prisma.user.findUnique({
          where: { id: user.id },
          select: { mentorSlug: true },
        });
        if (!record?.mentorSlug) return jsonError("Akunmu belum di-map ke mentor track", 403);
        const ownedSlugs = modulesByMentor(record.mentorSlug).map((m) => m.slug);
        if (!ownedSlugs.includes(body.moduleSlug)) {
          return jsonError("Modul ini tidak di-ampu oleh kamu", 403);
        }
      }
    }

    const scheduledAt = new Date(body.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) {
      return jsonError("Tanggal tidak valid", 400);
    }
    if (scheduledAt.getTime() < Date.now() - 60 * 1000) {
      return jsonError("Jadwal tidak boleh di masa lalu", 400);
    }

    const event = await prisma.liveEvent.create({
      data: {
        title: body.title,
        description: body.description ?? null,
        hostId: user.id,
        moduleSlug: body.moduleSlug ?? null,
        scheduledAt,
        durationMinutes: body.durationMinutes,
        meetingUrl: body.meetingUrl,
        maxParticipants: body.maxParticipants ?? null,
      },
      include: {
        host: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    // Notifikasi:
    //  - Kalau ada moduleSlug → notify semua student yang punya
    //    ModuleProgress di modul ini (paling relevan)
    //  - Kalau platform-wide → notify semua student (mass-notify, gunakan
    //    hati-hati). Untuk MVP, skip mass notify; tutor/admin bisa share
    //    link manual via channel mereka.
    const dateLabel = new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(scheduledAt);

    if (body.moduleSlug) {
      const mod = findModule(body.moduleSlug);
      const enrolledStudents = await prisma.moduleProgress.findMany({
        where: { moduleSlug: body.moduleSlug },
        select: { studentId: true },
        distinct: ["studentId"],
      });
      // Send notif satu-satu (small N expected; gunakan createMany untuk efisiensi)
      await Promise.all(
        enrolledStudents
          .filter((s) => s.studentId !== user.id)
          .map((s) =>
            notify({
              userId: s.studentId,
              title: `Live session baru: ${event.title}`,
              body: `${mod?.title ?? body.moduleSlug} — ${dateLabel} oleh ${user.name}`,
              href: `/live-session`,
            }),
          ),
      );
    } else {
      // Platform-wide event → notif tutor/admin lain saja, biar mereka
      // bisa promote ke murid mereka.
      await notifyRoles({
        roles: ["tutor", "admin"],
        excludeUserId: user.id,
        title: `Live session platform-wide: ${event.title}`,
        body: `${dateLabel} oleh ${user.name} — bantu sebar ke murid kamu`,
        href: `/tutor/live`,
      });
    }

    return NextResponse.json({ event });
  } catch (err) {
    return handleApiError(err);
  }
}
