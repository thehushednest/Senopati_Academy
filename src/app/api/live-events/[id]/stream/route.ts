import { NextRequest } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { requireUser } from "../../../../../lib/session";
import { handleApiError, jsonError } from "../../../../../lib/api-utils";
import {
  type PresenterState,
  subscribePresenter,
} from "../../../../../lib/live-presenter-bus";

// SSE harus Node runtime (ReadableStream + EventEmitter), bukan edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Server-Sent Events stream untuk slide presenter sync.
 * Kirim initial state dari DB saat connect, lalu push update setiap kali
 * presenter tekan tombol slide via /present API.
 *
 * Header X-Accel-Buffering: no buat disable nginx buffering — wajib supaya
 * event langsung ter-flush ke client tanpa nunggu chunk threshold.
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

    let initialState: PresenterState;
    if (event.presentMaterialId) {
      const material = await prisma.sessionMaterial.findUnique({
        where: { id: event.presentMaterialId },
      });
      initialState = {
        presenting: !!material,
        materialId: material?.id ?? null,
        pdfUrl: material?.pdfUrl ?? null,
        filename: material?.pdfFilename ?? null,
        slide: event.presentSlide ?? 0,
        startedAt: event.presentingSince?.getTime() ?? null,
      };
    } else {
      initialState = {
        presenting: false,
        materialId: null,
        pdfUrl: null,
        filename: null,
        slide: null,
        startedAt: null,
      };
    }

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
        const send = (data: PresenterState) => {
          safeEnqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        send(initialState);

        const unsub = subscribePresenter(id, (state) => send(state));

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
