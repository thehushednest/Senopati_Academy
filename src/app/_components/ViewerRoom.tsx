"use client";

import { useEffect, useState } from "react";
import { RoomSlideCanvas } from "./RoomSlideCanvas";

type State = {
  presenting: boolean;
  pdfUrl: string | null;
  filename: string | null;
  slide: number | null;
};

type Props = {
  eventId: string;
  initialState: State;
};

export function ViewerRoom({ eventId, initialState }: Props) {
  const [state, setState] = useState<State>(initialState);
  const [connected, setConnected] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  useEffect(() => {
    const es = new EventSource(`/api/live-events/${eventId}/stream`);
    es.onopen = () => setConnected(true);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as State;
        setState(data);
      } catch {
        // ignore malformed
      }
    };
    es.onerror = () => {
      setConnected(false);
      // EventSource auto-reconnect built-in; just track attempts buat indikator UI.
      setReconnectAttempt((n) => n + 1);
    };
    return () => es.close();
  }, [eventId]);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: "0.78rem",
            color: connected ? "var(--brand-strong)" : "#b45309",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: 999,
              background: connected ? "#18c29c" : "#b45309",
            }}
          />
          {connected
            ? "Mengikuti presenter"
            : reconnectAttempt > 0
              ? "Menyambungkan kembali…"
              : "Menghubungkan…"}
        </span>
        {state.presenting && state.slide !== null ? (
          <small style={{ color: "var(--muted)" }}>Slide {state.slide + 1}</small>
        ) : null}
      </div>

      {state.presenting && state.pdfUrl && state.slide !== null ? (
        <RoomSlideCanvas pdfUrl={state.pdfUrl} slide={state.slide} />
      ) : (
        <div
          style={{
            padding: 36,
            background: "rgba(15, 23, 42, 0.04)",
            border: "1px dashed rgba(15, 23, 42, 0.15)",
            borderRadius: 14,
            textAlign: "center",
            color: "var(--muted)",
          }}
        >
          <p style={{ margin: 0 }}>
            Tutor belum mulai present. Halaman ini akan otomatis update saat slide
            ditampilkan.
          </p>
        </div>
      )}
    </div>
  );
}
