import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { prisma } from "../../../../../lib/prisma";
import { requireUser } from "../../../../../lib/session";
import { handleApiError, jsonError } from "../../../../../lib/api-utils";
import { pushChatMessage } from "../../../../../lib/live-presenter-bus";

const schema = z.object({
  text: z.string().trim().min(1).max(500),
});

// Rate limit sederhana in-memory per user — max 5 msg / 10 detik.
const RATE_WINDOW_MS = 10_000;
const RATE_MAX = 5;
const globalRate = globalThis as unknown as {
  __chatRate?: Map<string, number[]>;
};
const rateMap: Map<string, number[]> =
  globalRate.__chatRate ?? (globalRate.__chatRate = new Map());

function rateLimitOk(userId: string): boolean {
  const now = Date.now();
  const arr = rateMap.get(userId) ?? [];
  const recent = arr.filter((t: number) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    rateMap.set(userId, recent);
    return false;
  }
  recent.push(now);
  rateMap.set(userId, recent);
  return true;
}

/**
 * POST chat message. Ephemeral — di-broadcast via SSE bus + disimpan di
 * ring buffer 50 pesan terakhir per event (untuk late-joiner). Tidak
 * persisted di DB — chat hilang saat server restart.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = schema.parse(await req.json());

    const event = await prisma.liveEvent.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!event) return jsonError("Event tidak ditemukan", 404);
    if (event.status === "cancelled" || event.status === "ended") {
      return jsonError("Event sudah selesai", 400);
    }

    if (!rateLimitOk(user.id)) {
      return jsonError("Terlalu banyak pesan. Coba lagi sebentar.", 429);
    }

    pushChatMessage(id, {
      id: randomUUID(),
      authorId: user.id,
      authorName: user.name,
      text: body.text,
      ts: Date.now(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
