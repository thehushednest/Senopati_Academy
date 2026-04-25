import { EventEmitter } from "node:events";

/**
 * In-memory pub/sub buat slide-room realtime channels:
 *   - "slide": presenter slide state changes
 *   - "chat": ephemeral chat messages (tidak persisted di DB)
 *   - "qna_new": Q&A baru di-submit
 *   - "qna_update": upvote / mark-answered update
 *   - "qna_delete": Q&A di-hapus
 *
 * Single-process, cocok untuk deployment systemd 1-node sekarang. Kalau
 * scale ke cluster, ganti backbone ke Postgres LISTEN/NOTIFY atau Redis.
 *
 * Pakai globalThis biar survive Next.js dev HMR (module re-eval bikin
 * EventEmitter baru kalau bukan global).
 */
const globalForBus = globalThis as unknown as {
  __presenterBus?: EventEmitter;
  __chatRing?: Map<string, ChatMessage[]>;
};

export const presenterBus =
  globalForBus.__presenterBus ?? (globalForBus.__presenterBus = new EventEmitter());

// Generous limit — tiap viewer = 1 listener per channel.
presenterBus.setMaxListeners(5000);

export type PresenterState = {
  presenting: boolean;
  materialId: string | null;
  pdfUrl: string | null;
  filename: string | null;
  slide: number | null;
  startedAt: number | null;
};

export type ChatMessage = {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  ts: number;
};

export type QnaQuestion = {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  upvotes: number;
  answered: boolean;
  createdAt: number;
};

export type RoomEvent =
  | { type: "slide"; payload: PresenterState }
  | { type: "chat"; payload: ChatMessage }
  | { type: "qna_new"; payload: QnaQuestion }
  | { type: "qna_update"; payload: { id: string; upvotes: number; answered: boolean } }
  | { type: "qna_delete"; payload: { id: string } };

const channel = (eventId: string) => `live:${eventId}`;

export function publishToRoom(eventId: string, evt: RoomEvent): void {
  presenterBus.emit(channel(eventId), evt);
}

export function subscribeRoom(
  eventId: string,
  cb: (evt: RoomEvent) => void,
): () => void {
  const ch = channel(eventId);
  presenterBus.on(ch, cb);
  return () => {
    presenterBus.off(ch, cb);
  };
}

// === Backwards-compat shim untuk slide presenter API yang ada ===

export function publishPresenterState(eventId: string, state: PresenterState): void {
  publishToRoom(eventId, { type: "slide", payload: state });
}

// === Chat: ephemeral ring buffer per event (last 50 messages) ===
// Late-joiner dapat backlog ini saat connect, tanpa hit DB.

const RING_SIZE = 50;
const chatRing: Map<string, ChatMessage[]> =
  globalForBus.__chatRing ?? (globalForBus.__chatRing = new Map());

export function pushChatMessage(eventId: string, msg: ChatMessage): void {
  const arr = chatRing.get(eventId) ?? [];
  arr.push(msg);
  if (arr.length > RING_SIZE) arr.splice(0, arr.length - RING_SIZE);
  chatRing.set(eventId, arr);
  publishToRoom(eventId, { type: "chat", payload: msg });
}

export function getChatBacklog(eventId: string): ChatMessage[] {
  return chatRing.get(eventId)?.slice() ?? [];
}
