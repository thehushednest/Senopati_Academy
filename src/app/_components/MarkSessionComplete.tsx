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
};

export function MarkSessionComplete({
  moduleSlug,
  sessionIndex,
  totalSessions,
  nextHref,
  label = "Tandai Selesai & Lanjut",
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
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
    <button
      type="button"
      className="button button--primary"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "Menyimpan…" : label}
      <ArrowRightIcon size={16} />
    </button>
  );
}
