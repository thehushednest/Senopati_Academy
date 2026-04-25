"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  eventId: string;
  initialRsvped: boolean;
  status: "scheduled" | "live" | "ended" | "cancelled";
};

export function RsvpButton({ eventId, initialRsvped, status }: Props) {
  const router = useRouter();
  const [rsvped, setRsvped] = useState(initialRsvped);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "ended" || status === "cancelled") return null;

  const toggle = async () => {
    setBusy(true);
    setError(null);
    try {
      if (rsvped) {
        const res = await fetch(`/api/live-events/${eventId}/rsvp`, { method: "DELETE" });
        if (!res.ok) throw new Error("Gagal cancel RSVP");
        setRsvped(false);
      } else {
        const res = await fetch(`/api/live-events/${eventId}/rsvp`, { method: "POST" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: "Gagal RSVP" }));
          throw new Error(data.error ?? "Gagal RSVP");
        }
        setRsvped(true);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal");
    } finally {
      setBusy(false);
    }
  };

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 4, alignItems: "stretch" }}>
      <button
        type="button"
        className={rsvped ? "button button--secondary button--sm" : "button button--primary button--sm"}
        onClick={toggle}
        disabled={busy}
      >
        {busy ? "…" : rsvped ? "Batal RSVP" : "RSVP"}
      </button>
      {error ? <small style={{ color: "#c62828", fontSize: "0.7rem" }}>{error}</small> : null}
    </span>
  );
}
