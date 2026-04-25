import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../../lib/prisma";
import { requireUser } from "../../../../../lib/session";
import { handleApiError, jsonError } from "../../../../../lib/api-utils";
import { publishPresenterState } from "../../../../../lib/live-presenter-bus";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("start"), materialId: z.string().uuid() }),
  z.object({ action: z.literal("slide"), slide: z.number().int().min(0).max(2000) }),
  z.object({ action: z.literal("end") }),
]);

/**
 * Presenter control: host (atau admin) kontrol slide sync untuk event ini.
 * "start" set materialId + slide=0 + status=live.
 * "slide" advance current slide.
 * "end" clear present state (status tetap live — tutor bisa "Tandai Selesai" terpisah).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = schema.parse(await req.json());

    const event = await prisma.liveEvent.findUnique({ where: { id } });
    if (!event) return jsonError("Event tidak ditemukan", 404);
    if (user.role !== "admin" && event.hostId !== user.id) {
      return jsonError("Hanya host atau admin yang bisa present", 403);
    }
    if (event.status === "cancelled" || event.status === "ended") {
      return jsonError("Event sudah selesai/cancelled", 400);
    }

    if (body.action === "start") {
      const material = await prisma.sessionMaterial.findUnique({
        where: { id: body.materialId },
      });
      if (!material) return jsonError("Material tidak ditemukan", 404);
      // Kalau event scoped ke modul, materinya harus dari modul itu juga.
      if (event.moduleSlug && material.moduleSlug !== event.moduleSlug) {
        return jsonError("Material bukan dari modul event ini", 400);
      }

      const updated = await prisma.liveEvent.update({
        where: { id },
        data: {
          presentMaterialId: material.id,
          presentSlide: 0,
          presentingSince: new Date(),
          status: event.status === "scheduled" ? "live" : event.status,
        },
      });

      publishPresenterState(id, {
        presenting: true,
        materialId: material.id,
        pdfUrl: material.pdfUrl,
        filename: material.pdfFilename,
        slide: 0,
        startedAt: updated.presentingSince!.getTime(),
      });

      return NextResponse.json({
        ok: true,
        material: {
          id: material.id,
          pdfUrl: material.pdfUrl,
          filename: material.pdfFilename,
        },
      });
    }

    if (body.action === "slide") {
      if (!event.presentMaterialId) {
        return jsonError("Belum ada material yang di-present", 400);
      }
      await prisma.liveEvent.update({
        where: { id },
        data: { presentSlide: body.slide },
      });

      const material = await prisma.sessionMaterial.findUnique({
        where: { id: event.presentMaterialId },
      });
      publishPresenterState(id, {
        presenting: true,
        materialId: event.presentMaterialId,
        pdfUrl: material?.pdfUrl ?? null,
        filename: material?.pdfFilename ?? null,
        slide: body.slide,
        startedAt: event.presentingSince?.getTime() ?? null,
      });

      return NextResponse.json({ ok: true });
    }

    // action === "end"
    await prisma.liveEvent.update({
      where: { id },
      data: { presentMaterialId: null, presentSlide: null, presentingSince: null },
    });
    publishPresenterState(id, {
      presenting: false,
      materialId: null,
      pdfUrl: null,
      filename: null,
      slide: null,
      startedAt: null,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
