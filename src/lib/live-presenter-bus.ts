import { EventEmitter } from "node:events";

/**
 * In-memory pub/sub buat presenter slide-sync. Single-process: cocok untuk
 * deployment systemd 1-node sekarang. Kalau scale ke cluster, ganti ke
 * Postgres LISTEN/NOTIFY atau Redis pub/sub.
 *
 * Pakai globalThis biar survive Next.js dev HMR (module re-eval bikin
 * EventEmitter baru kalau bukan global).
 */
const globalForBus = globalThis as unknown as { __presenterBus?: EventEmitter };

export const presenterBus =
  globalForBus.__presenterBus ?? (globalForBus.__presenterBus = new EventEmitter());

// Generous limit — tiap viewer = 1 listener. Asumsi <500 concurrent per event.
presenterBus.setMaxListeners(1000);

export type PresenterState = {
  presenting: boolean;
  materialId: string | null;
  pdfUrl: string | null;
  filename: string | null;
  slide: number | null;
  startedAt: number | null;
};

const channel = (eventId: string) => `live:${eventId}`;

export function publishPresenterState(eventId: string, state: PresenterState): void {
  presenterBus.emit(channel(eventId), state);
}

export function subscribePresenter(
  eventId: string,
  cb: (state: PresenterState) => void,
): () => void {
  const ch = channel(eventId);
  presenterBus.on(ch, cb);
  return () => {
    presenterBus.off(ch, cb);
  };
}
