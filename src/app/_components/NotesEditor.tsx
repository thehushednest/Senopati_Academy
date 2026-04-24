"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckIcon } from "./Icon";

type Props = {
  moduleSlug: string;
  placeholder?: string;
};

type SavedState = "idle" | "saving" | "saved" | "offline";

const MAX_LENGTH = 4000;
const DEBOUNCE_MS = 700;

function storageKey(slug: string) {
  return `senopati-academy::notes::${slug}`;
}

export function NotesEditor({ moduleSlug, placeholder }: Props) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<SavedState>("idle");
  const [hydrated, setHydrated] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Load catatan: prioritas server, fallback ke localStorage kalau request gagal atau belum login.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      let serverBody: string | null = null;
      try {
        const res = await fetch(`/api/notes?moduleSlug=${encodeURIComponent(moduleSlug)}`);
        if (res.ok) {
          const data = await res.json();
          serverBody = data.note?.body ?? null;
        }
      } catch {
        // abaikan — fallback ke localStorage
      }
      if (cancelled) return;

      if (serverBody !== null) {
        setValue(serverBody);
      } else {
        try {
          const stored = window.localStorage.getItem(storageKey(moduleSlug));
          if (stored) setValue(stored);
        } catch {}
      }
      setHydrated(true);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [moduleSlug]);

  // Debounced save: server → localStorage fallback saat gagal.
  useEffect(() => {
    if (!hydrated) return;
    setStatus("saving");
    const handle = window.setTimeout(async () => {
      // Write ke localStorage selalu sebagai backup.
      try {
        window.localStorage.setItem(storageKey(moduleSlug), value);
      } catch {}

      try {
        const res = await fetch("/api/notes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moduleSlug, body: value }),
        });
        if (!mountedRef.current) return;
        setStatus(res.ok ? "saved" : "offline");
      } catch {
        if (!mountedRef.current) return;
        setStatus("offline");
      }
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [value, moduleSlug, hydrated]);

  const charsLeft = MAX_LENGTH - value.length;

  const preview = useMemo(() => {
    return value
      .split(/\n{2,}/)
      .map((block, idx) => <p key={idx}>{block}</p>);
  }, [value]);

  const handleClear = async () => {
    if (!window.confirm("Yakin ingin hapus seluruh catatan untuk modul ini?")) return;
    setValue("");
    try {
      window.localStorage.removeItem(storageKey(moduleSlug));
    } catch {}
    // Kirim body kosong ke server — upsert akan overwrite.
    try {
      await fetch("/api/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleSlug, body: "" }),
      });
    } catch {}
  };

  return (
    <div className="notes-editor">
      <div className="notes-editor__meta">
        <span className="notes-editor__status">
          {status === "saved" ? (
            <>
              <CheckIcon size={14} /> Tersinkron ke akun kamu
            </>
          ) : status === "saving" ? (
            <>Menyimpan…</>
          ) : status === "offline" ? (
            <>Offline — tersimpan di perangkat saja</>
          ) : (
            <>Siap ditulis</>
          )}
        </span>
        <span className="notes-editor__counter">
          {charsLeft.toLocaleString("id-ID")} karakter tersisa
        </span>
      </div>
      <textarea
        className="notes-editor__textarea"
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, MAX_LENGTH))}
        placeholder={placeholder ?? "Tulis catatan bebas di sini — ringkasan sesi, ide prompt, atau pertanyaan untuk ditanyakan ke mentor."}
        rows={10}
      />
      <div className="notes-editor__actions">
        <button type="button" className="button button--secondary button--sm" onClick={handleClear}>
          Hapus Semua
        </button>
      </div>
      {value.trim() ? (
        <div className="notes-editor__preview">
          <strong>Preview</strong>
          <div className="notes-editor__preview-body">{preview}</div>
        </div>
      ) : null}
    </div>
  );
}
