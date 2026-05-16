"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CHAPTERS, SECTIONS, TOTAL_DURATION_SEC, formatDuration } from "./chapters";

type Tab = "overview" | "transcript" | "resources" | "tentang";

export function PanduanTutorPlayer() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [tab, setTab] = useState<Tab>("overview");
  const videoRef = useRef<HTMLVideoElement>(null);

  const active = CHAPTERS[activeIdx]!;

  // Restore progress from localStorage.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("panduan-tutor-progress");
      if (raw) {
        const data = JSON.parse(raw) as { completed?: number[]; lastIdx?: number };
        if (Array.isArray(data.completed)) setCompleted(new Set(data.completed));
        if (typeof data.lastIdx === "number") setActiveIdx(data.lastIdx);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Persist progress on change.
  useEffect(() => {
    try {
      localStorage.setItem(
        "panduan-tutor-progress",
        JSON.stringify({ completed: [...completed], lastIdx: activeIdx }),
      );
    } catch {
      /* ignore */
    }
  }, [completed, activeIdx]);

  // Reset playback when chapter changes.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.load();
    void v.play().catch(() => {});
  }, [activeIdx]);

  const onEnded = () => {
    setCompleted((prev) => new Set([...prev, active.num]));
    // Auto-advance.
    if (activeIdx < CHAPTERS.length - 1) {
      setTimeout(() => setActiveIdx(activeIdx + 1), 800);
    }
  };

  const completedCount = completed.size;
  const progressPct = Math.round((completedCount / CHAPTERS.length) * 100);

  return (
    <div className="panduan-shell">
      <header className="panduan-header">
        <Link href="/" className="panduan-back">
          ← Beranda
        </Link>
        <div className="panduan-title-bar">
          <strong>Panduan Tutor Senopati Academy</strong>
          <small>
            Chapter {active.num}/{CHAPTERS.length} · {active.title}
          </small>
        </div>
        <div className="panduan-progress">
          <small>{progressPct}% selesai</small>
          <div className="panduan-progress-bar">
            <div className="panduan-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </header>

      <div className="panduan-grid">
        {/* Main content (player + tabs) */}
        <main className="panduan-main">
          <div className="panduan-video-wrap">
            <video
              ref={videoRef}
              className="panduan-video"
              src={active.src}
              controls
              autoPlay
              playsInline
              onEnded={onEnded}
              key={active.src}
              poster=""
            >
              <track kind="captions" srcLang="id" label="Indonesia" default />
              Browser Anda tidak mendukung HTML5 video.
            </video>
          </div>

          <nav className="panduan-tabs" role="tablist">
            {(
              [
                ["overview", "Ringkasan"],
                ["transcript", "Transkrip"],
                ["resources", "Sumber Daya"],
                ["tentang", "Tentang"],
              ] as const
            ).map(([k, l]) => (
              <button
                key={k}
                role="tab"
                className={tab === k ? "panduan-tab panduan-tab--active" : "panduan-tab"}
                onClick={() => setTab(k)}
              >
                {l}
              </button>
            ))}
          </nav>

          <section className="panduan-tab-content">
            {tab === "overview" && (
              <div>
                <h1 style={{ marginTop: 0 }}>{active.title}</h1>
                <div className="panduan-meta">
                  <span>
                    <strong>Chapter {active.num}</strong> dari 12
                  </span>
                  <span>·</span>
                  <span>{formatDuration(active.durationSec)}</span>
                  <span>·</span>
                  <span>Total kursus: {formatDuration(TOTAL_DURATION_SEC)}</span>
                </div>
                <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
                  Panduan ini dibawakan oleh <strong>Elsya</strong>, pemandu virtual
                  Senopati Academy, untuk membantu Bapak Ibu tutor memahami seluruh
                  fitur platform — dari dashboard sampai live session. Setiap chapter
                  fokus ke satu menu, jadi Anda bisa langsung lompat ke fitur yang
                  ingin diperdalam, atau menonton berurutan dari Chapter 1.
                </p>
                <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
                  Progress tontonan Anda otomatis tersimpan di browser ini — kembali
                  kapan saja dan lanjutkan dari chapter terakhir.
                </p>
              </div>
            )}
            {tab === "transcript" && (
              <div>
                <h2 style={{ marginTop: 0 }}>Transkrip Chapter {active.num}</h2>
                <p style={{ color: "var(--muted)" }}>
                  Caption ditanam langsung pada video (burnt-in). Untuk SRT
                  terpisah, hubungi tim Senopati di{" "}
                  <a href="mailto:halo@asksenopati.com">halo@asksenopati.com</a>.
                </p>
              </div>
            )}
            {tab === "resources" && (
              <div>
                <h2 style={{ marginTop: 0 }}>Sumber Daya</h2>
                <ul style={{ lineHeight: 1.8 }}>
                  <li>
                    <a href="/program/paham-ai">
                      Halaman Program Paham AI — overview workshop 1 hari, 5 modul
                    </a>
                  </li>
                  <li>
                    <a href="/login">Login akun tutor</a> — untuk mengakses fitur
                    yang ditunjukkan dalam video
                  </li>
                  <li>
                    Support: <a href="mailto:halo@asksenopati.com">halo@asksenopati.com</a>
                  </li>
                </ul>
              </div>
            )}
            {tab === "tentang" && (
              <div>
                <h2 style={{ marginTop: 0 }}>Tentang Panduan Ini</h2>
                <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
                  Panduan walkthrough tutor terdiri dari{" "}
                  <strong>{CHAPTERS.length} chapter</strong> dengan total durasi
                  sekitar <strong>{formatDuration(TOTAL_DURATION_SEC)}</strong>.
                  Disusun oleh tim Senopati Academy untuk onboarding tutor baru
                  maupun review fitur bagi tutor existing.
                </p>
                <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
                  Tidak perlu login untuk menonton — silakan share link halaman
                  ini ke calon tutor lain.
                </p>
              </div>
            )}
          </section>
        </main>

        {/* Sidebar: course content */}
        <aside className="panduan-sidebar" aria-label="Daftar chapter">
          <header className="panduan-sidebar-header">
            <strong>Daftar Isi</strong>
            <small>
              {completedCount}/{CHAPTERS.length} · {formatDuration(TOTAL_DURATION_SEC)}
            </small>
          </header>
          <div className="panduan-sections">
            {SECTIONS.map((section) => {
              const secCompleted = section.chapters.filter((c) => completed.has(c.num)).length;
              const secTotalSec = section.chapters.reduce((s, c) => s + c.durationSec, 0);
              return (
                <details key={section.title} className="panduan-section" open>
                  <summary className="panduan-section-summary">
                    <div>
                      <strong>{section.title}</strong>
                      <small>
                        {secCompleted}/{section.chapters.length} · {formatDuration(secTotalSec)}
                      </small>
                    </div>
                  </summary>
                  <ol className="panduan-chapter-list">
                    {section.chapters.map((c) => {
                      const isActive = c.num === active.num;
                      const isDone = completed.has(c.num);
                      return (
                        <li
                          key={c.num}
                          className={
                            "panduan-chapter" +
                            (isActive ? " panduan-chapter--active" : "") +
                            (isDone ? " panduan-chapter--done" : "")
                          }
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setActiveIdx(CHAPTERS.findIndex((x) => x.num === c.num))
                            }
                          >
                            <span className="panduan-chapter-check" aria-hidden>
                              {isDone ? "✓" : isActive ? "▶" : ""}
                            </span>
                            <span className="panduan-chapter-text">
                              <strong>
                                {c.num}. {c.title}
                              </strong>
                              <small>{formatDuration(c.durationSec)}</small>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </details>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
