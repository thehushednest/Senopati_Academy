"use client";

import { useState } from "react";
import { CheckIcon } from "./Icon";

type CopyButtonProps = {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
};

export function CopyButton({
  value,
  label = "Salin",
  copiedLabel = "Tersalin",
  className = "button button--primary"
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button type="button" className={className} onClick={handleCopy} aria-live="polite">
      {copied ? (
        <>
          <CheckIcon size={16} />
          {copiedLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}
