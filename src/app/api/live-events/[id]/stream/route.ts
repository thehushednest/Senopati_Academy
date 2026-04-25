import { NextRequest } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { requireUser } from "../../../../../lib/session";
import { handleApiError, jsonError } from "../../../../../lib/api-utils";
import {
  type RoomEvent,
  type PresenterState,
  getChatBacklog,
  subscribeRoom,
} from "../../../../../lib/live-presenter-bus";

// SSE harus Node runtime (ReadableStream + EventEmitter), bukan edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * SSE stream untuk slide-room. Mengirim typed events:
 *   - "slide": presenter state changes
 *   - "chat": chat message baru
 *   - "qna_new": Q&A baru
 *   - "qna_update": vote / answered update
 *   - "qna_delete": Q&A dihapus
 *
 * Saat connect, kirim initial state slide + chat backlog. Q&A list di-fetch
 * client via /qna GET endpoint (terlalu besar untuk SSE initial — sortable
 * + paginatable di-future).
 *
 * X-Accel-Buffering: no — wajib supaya nginx tidak buffer event chunks.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireUser();
    const { id } = await params;
    const event = await prisma.liveEvent.findUnique({ where: { id } });
    if (!event) return jsonError("Event tidak ditemukan", 404);

    let initialSlide: PresenterState;
    if (event.presentMaterialId) {
      const material = await prisma.sessionMaterial.findUnique({
        where: { id: event.presentMaterialId },
      });
      initialSlide = {
        presenting: !!material,
        materialId: material?.id ?? null,
        pdfUrl: material?.pdfUrl ?? null,
        filename: material?.pdfFilename ?? null,
        slide: event.presentSlide ?? 0,
        startedAt: event.presentingSince?.getTime() ?? null,
      };
    } else {
      initialSlide = {
        presenting: false,
        materialId: null,
        pdfUrl: null,
        filename: null,
        slide: null,
        startedAt: null,
      };
    }

    const backlog = getChatBacklog(id);

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        let closed = false;
        const safeEnqueue = (chunk: Uint8Array) => {
          if (closed) return;
          try {
            controller.enqueue(chunk);
          } catch {
            closed = true;
          }
        };
        const sendTyped = (eventName: string, data: unknown) => {
          safeEnqueue(
            encoder.encode(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`),
          );
        };

        // Initial state push
        sendTyped("slide", initialSlide);
        for (const msg of backlog) {
          sendTyped("chat", msg);
        }

        const unsub = subscribeRoom(id, (evt: RoomEvent) => {
          sendTyped(evt.type, evt.payload);
        });

        // Heartbeat tiap 25s — comment line, di-ignore client tapi keep proxies alive.
        const hb = setInterval(() => {
          safeEnqueue(encoder.encode(`: hb\n\n`));
        }, 25000);

        const cleanup = () => {
          if (closed) return;
          closed = true;
          unsub();
          clearInterval(hb);
          try {
            controller.close();
          } catch {
            // already closed
          }
        };
        req.signal.addEventListener("abort", cleanup);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
