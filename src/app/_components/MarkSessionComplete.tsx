"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRightIcon } from "./Icon";

type Props = {
  moduleSlug: string;
  sessionIndex: number;
  totalSessions: number;
  nextHref: string;
  label?: string;
  /** Kalau true, tombol di-disable. Pakai bersama `disabledReason`. */
  disabled?: boolean;
  /** Tooltip yang muncul di hover + pesan di bawah tombol saat disabled. */
  disabledReason?: string;
};

export function MarkSessionComplete({
  moduleSlug,
  sessionIndex,
  totalSessions,
  nextHref,
  label = "Tandai Selesai & Lanjut",
  disabled,
  disabledReason,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading || disabled) return;
    setLoading(true);
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleSlug, sessionIndex, totalSessions }),
      });
    } catch {
      // Tetap navigate walaupun save gagal — kita tidak mau mengunci user.
    }
    router.push(nextHref);
    router.refresh();
  };

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
      <button
        type="button"
        className="button button--primary"
        onClick={handleClick}
        disabled={loading || disabled}
        title={disabled ? disabledReason : undefined}
      >
        {loading ? "Menyimpan…" : label}
        <ArrowRightIcon size={16} />
      </button>
      {disabled && disabledReason ? (
        <small style={{ color: "var(--muted)", fontSize: "0.76rem" }}>{disabledReason}</small>
      ) : null}
    </div>
  );
}
