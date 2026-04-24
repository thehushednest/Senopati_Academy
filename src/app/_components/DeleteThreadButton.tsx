"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  threadId: string;
};

export function DeleteThreadButton({ threadId }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Hapus thread ini? Semua balasan & like ikut terhapus. Tindakan tidak dapat di-undo.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/threads/${threadId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Gagal hapus thread" }));
        window.alert(data.error ?? "Gagal hapus thread");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className="button button--ghost button--sm"
      onClick={handleDelete}
      disabled={busy}
      style={{ borderColor: "#c62828", color: "#c62828" }}
    >
      {busy ? "Menghapus…" : "Hapus"}
    </button>
  );
}
