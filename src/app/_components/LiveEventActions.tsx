"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  eventId: string;
  status: "scheduled" | "live" | "ended" | "cancelled";
  recordingUrl: string | null;
};

export function LiveEventActions({ eventId, status, recordingUrl }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [showRecording, setShowRecording] = useState(false);
  const [recordingDraft, setRecordingDraft] = useState(recordingUrl ?? "");
  const [error, setError] = useState<string | null>(null);

  const callPatch = async (body: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/live-events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Gagal" }));
        throw new Error(data.error ?? "Gagal");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal");
    } finally {
      setBusy(false);
    }
  };

  const cancelEvent = async () => {
    if (!window.confirm("Batalkan event ini? Semua RSVPed akan dapat notifikasi pembatalan.")) return;
    await callPatch({ status: "cancelled" });
  };

  const markLive = () => callPatch({ status: "live" });
  const markEnded = () => callPatch({ status: "ended" });

  const saveRecording = async () => {
    if (!recordingDraft.trim()) return;
    await callPatch({ recordingUrl: recordingDraft.trim(), status: "ended" });
    setShowRecording(false);
  };

  const removeRecording = () => callPatch({ recordingUrl: null });

  const deleteEvent = async () => {
    if (!window.confirm("Hapus event ini secara permanen? Tindakan tidak bisa di-undo.")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/live-events/${eventId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Gagal hapus" }));
        throw new Error(data.error ?? "Gagal hapus");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal hapus");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
      {status === "scheduled" ? (
        <>
          <button
            type="button"
            className="button button--primary button--sm"
            onClick={markLive}
            disabled={busy}
          >
            Tandai Live
          </button>
          <button
            type="button"
            className="button button--ghost button--sm"
            onClick={cancelEvent}
            disabled={busy}
            style={{ borderColor: "#b45309", color: "#b45309" }}
          >
            Batalkan
          </button>
        </>
      ) : null}

      {status === "live" ? (
        <button
          type="button"
          className="button button--secondary button--sm"
          onClick={markEnded}
          disabled={busy}
        >
          Tandai Selesai
        </button>
      ) : null}

      {status !== "cancelled" ? (
        <>
          {!showRecording ? (
            <button
              type="button"
              className="button button--ghost button--sm"
              onClick={() => setShowRecording(true)}
              disabled={busy}
            >
              {recordingUrl ? "Edit Recording" : "Tambah Recording"}
            </button>
          ) : (
            <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                type="url"
                className="form-input"
                placeholder="https://youtube.com/..."
                value={recordingDraft}
                onChange={(e) => setRecordingDraft(e.target.value)}
                style={{ minWidth: 260, padding: "6px 10px" }}
              />
              <button
                type="button"
                className="button button--primary button--sm"
                onClick={saveRecording}
                disabled={busy || !recordingDraft.trim()}
              >
                Simpan
              </button>
              <button
                type="button"
                className="button button--ghost button--sm"
                onClick={() => {
                  setShowRecording(false);
                  setRecordingDraft(recordingUrl ?? "");
                }}
              >
                Batal
              </button>
            </span>
          )}
          {recordingUrl && !showRecording ? (
            <button
              type="button"
              className="button button--ghost button--sm"
              onClick={removeRecording}
              disabled={busy}
              style={{ color: "#b45309" }}
            >
              Hapus Recording
            </button>
          ) : null}
        </>
      ) : null}

      <button
        type="button"
        className="button button--ghost button--sm"
        onClick={deleteEvent}
        disabled={busy}
        style={{ color: "#c62828", borderColor: "#c62828" }}
      >
        Hapus
      </button>
      {error ? <small style={{ color: "#c62828", flexBasis: "100%" }}>{error}</small> : null}
    </div>
  );
}
