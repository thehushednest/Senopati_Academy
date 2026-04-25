"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  materialId: string;
  versionId: string;
  versionLabel: string;
};

export function RollbackVersionButton({ materialId, versionId, versionLabel }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (busy) return;
    if (!window.confirm(`Aktifkan ${versionLabel} sebagai materi aktif? Versi sebelumnya tetap tersimpan di history.`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/materials/${materialId}/rollback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Gagal rollback" }));
        throw new Error(data.error ?? "Gagal rollback");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal rollback");
    } finally {
      setBusy(false);
    }
  };

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
      <button
        type="button"
        className="button button--secondary button--sm"
        onClick={handleClick}
        disabled={busy}
      >
        {busy ? "Mengaktifkan…" : "Aktifkan"}
      </button>
      {error ? <small style={{ color: "#c62828", fontSize: "0.7rem" }}>{error}</small> : null}
    </span>
  );
}
