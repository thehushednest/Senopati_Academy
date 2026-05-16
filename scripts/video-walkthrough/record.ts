/**
 * Playwright recorder for the tutor walkthrough video.
 *
 * Drives a browser through the storyboard's 12 chapter action sequences and
 * emits two outputs:
 *   - screen/recording.webm   — full 1920×1080 screen capture
 *   - timestamps.json         — chapter marks + per-event timing for compose.py
 *
 * Run:
 *   tsx scripts/video-walkthrough/record.ts
 *
 * Env:
 *   RECORD_BASE_URL          default http://localhost:3000
 *   RECORD_TUTOR_PASSWORD    required (don't commit)
 *   SENOPATI_RECORD_REVIEW   "1" → include Chapter 8 (Review Tugas/IELTS)
 *   RECORD_HEADLESS          "1" → run headless (default headed for debugging)
 */

import { chromium, Browser, BrowserContext, Page } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { CURSOR_INJECT_SCRIPT } from "./lib/cursor";
import { CHAPTERS, ChapterSpec } from "./lib/timing";

const BASE_URL = process.env.RECORD_BASE_URL ?? "http://localhost:3000";
const TUTOR_EMAIL = "tutor.demo@asksenopati.com";
const TUTOR_PASSWORD = process.env.RECORD_TUTOR_PASSWORD ?? "";
const INCLUDE_REVIEW = process.env.SENOPATI_RECORD_REVIEW === "1";
const HEADLESS = process.env.RECORD_HEADLESS === "1";

const OUT_DIR = path.resolve(__dirname);
const SCREEN_DIR = path.join(OUT_DIR, "screen");
const TIMESTAMPS_PATH = path.join(OUT_DIR, "timestamps.json");

type Event = { at: number; type: string; payload?: Record<string, unknown> };
type ChapterMark = {
  num: number;
  title: string;
  startMs: number;
  endMs: number;
  targetMs: number;
  events: Event[];
};

class ChapterCtx {
  private startedAt: number;
  events: Event[] = [];

  constructor(public page: Page, public spec: ChapterSpec, public runStart: number) {
    this.startedAt = Date.now();
  }

  /** Milliseconds since the chapter started. */
  elapsed(): number {
    return Date.now() - this.startedAt;
  }

  /** Milliseconds since the entire run started — what compose.py wants. */
  absMs(): number {
    return Date.now() - this.runStart;
  }

  /** Emit a typed marker tied to the global recording timeline. */
  mark(type: string, payload?: Record<string, unknown>): void {
    this.events.push({ at: this.absMs(), type, payload });
  }

  /** Move the synthetic cursor smoothly (so the recording shows the path). */
  async moveTo(selector: string, opts: { steps?: number; pulse?: boolean } = {}): Promise<void> {
    const el = await this.page.locator(selector).first();
    const box = await el.boundingBox();
    if (!box) return;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await this.page.mouse.move(x, y, { steps: opts.steps ?? 18 });
    if (opts.pulse) {
      await this.page.evaluate(
        ([cx, cy]: [number, number]) => (window as any).__pulseCursor?.(cx, cy),
        [x, y],
      );
    }
  }

  /** Hover with a teal-border highlight, used heavily in Chapter 3. */
  async hoverHighlight(selector: string, durationMs = 1800): Promise<void> {
    try {
      await this.moveTo(selector, { pulse: true });
      await this.page.evaluate(
        ([sel, dur]: [string, number]) => (window as any).__highlightElement?.(sel, dur),
        [selector, durationMs],
      );
      await this.page.waitForTimeout(durationMs);
    } catch (err) {
      console.warn(`[ch${this.spec.num}] hoverHighlight failed for ${selector}:`, err);
    }
  }

  /** Pad until the chapter has consumed its target duration. */
  async padToTarget(): Promise<void> {
    const remaining = this.spec.targetMs - this.elapsed();
    if (remaining > 0) {
      await this.page.waitForTimeout(remaining);
    } else if (remaining < -2000) {
      console.warn(
        `[ch${this.spec.num}] overran target by ${-remaining}ms (target=${this.spec.targetMs}ms)`,
      );
    }
  }
}

// ----------------- chapter implementations -----------------

async function chapter01(ctx: ChapterCtx): Promise<void> {
  ctx.mark("chapter-start");
  await ctx.page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await ctx.page.waitForTimeout(1000);
  ctx.mark("landing-loaded");

  // Action sequence: logo fade-in is overlaid in compose.py; recorder just
  // shows the landing page during 0:00-0:30 while Elsya monologues.
  await ctx.page.waitForTimeout(8000);

  // Move cursor near the "Masuk" button to seed Chapter 2's open.
  try {
    await ctx.moveTo('a[href="/login"], a:has-text("Masuk"), button:has-text("Masuk")');
    ctx.mark("cursor-on-masuk");
  } catch {
    /* landing page selector may have changed; non-fatal */
  }

  await ctx.padToTarget();
}

async function chapter02(ctx: ChapterCtx): Promise<void> {
  ctx.mark("chapter-start");
  await ctx.page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });

  const emailInput = ctx.page.locator('input[type="email"], input[name="email"]').first();
  await emailInput.click();
  await emailInput.type(TUTOR_EMAIL, { delay: 130 });

  const pwInput = ctx.page.locator('input[type="password"], input[name="password"]').first();
  await pwInput.click();
  await pwInput.type(TUTOR_PASSWORD, { delay: 80 });

  ctx.mark("credentials-typed");

  await ctx.page
    .locator('button[type="submit"], button:has-text("Masuk"), button:has-text("Sign in")')
    .first()
    .click();
  await ctx.page.waitForURL(/\/tutor/, { timeout: 15_000 }).catch(() => {});
  ctx.mark("dashboard-loaded");
  await ctx.page.waitForTimeout(2000);

  // Hover the dashboard's headline cards in turn.
  const dashboardTargets = [
    '[data-card="modul-aktif"], :text("Modul aktif"), :text("Modul Aktif")',
    '[data-card="thread-terbaru"], :text("Thread terbaru"), :text("Diskusi terbaru")',
    '[data-card="live-mendatang"], :text("Live mendatang"), :text("Live session")',
  ];
  for (const sel of dashboardTargets) {
    await ctx.moveTo(sel, { pulse: true }).catch(() => {});
    await ctx.page.waitForTimeout(1500);
  }

  // Zoom marker at 0:25-0:30 of chapter (= absolute 0:55-1:00).
  ctx.mark("zoom-modul-aktif", { factor: 1.2, durationMs: 5000, focus: "card-modul-aktif" });

  await ctx.padToTarget();
}

const SIDEBAR_MENUS: Array<{ label: string; selector: string; conditional?: boolean }> = [
  { label: "Modul Saya", selector: 'a[href="/tutor/modul"]' },
  { label: "Bahan Ajar", selector: 'a[href="/tutor/bahan-ajar"]' },
  { label: "Review Tugas", selector: 'a[href="/tutor/review"]', conditional: true },
  { label: "Review IELTS Writing", selector: 'a[href="/tutor/review/writing"]' },
  { label: "Live Session", selector: 'a[href="/tutor/live"]' },
  { label: "Pesan", selector: 'a[href="/pesan"]' },
  { label: "Siswa & Diskusi", selector: 'a[href="/tutor/siswa"]' },
  { label: "Materi & Soal", selector: 'a[href="/tutor/materi"]' },
  { label: "Analitik", selector: 'a[href="/tutor/analitik"]' },
  { label: "Cerita Interaktif", selector: 'a[href="/tutor/cerita"]' },
  { label: "Profil Saya", selector: 'a[href="/tutor/profil"]' },
];

async function chapter03(ctx: ChapterCtx): Promise<void> {
  ctx.mark("chapter-start");
  await ctx.page.goto(`${BASE_URL}/tutor`, { waitUntil: "domcontentloaded" });
  await ctx.page.waitForTimeout(1200);

  for (const menu of SIDEBAR_MENUS) {
    if (menu.conditional && !INCLUDE_REVIEW) continue;
    ctx.mark("sidebar-hover", { label: menu.label });
    await ctx.hoverHighlight(menu.selector, 1700);
  }

  await ctx.padToTarget();
}

async function chapter04(ctx: ChapterCtx): Promise<void> {
  ctx.mark("chapter-start");
  // Pakai halaman program publik — sumber kebenaran struktur Paham AI
  // (5 modul: Jeda + 4 akademis). /tutor/modul hanya scope mentor.
  await ctx.page.goto(`${BASE_URL}/program/paham-ai`, { waitUntil: "domcontentloaded" });
  await ctx.page.waitForTimeout(2000);

  ctx.mark("zoom-stat-5modul", { factor: 1.3, durationMs: 4000, focus: "hero-stat-modul" });
  await ctx.moveTo(':text("5 modul"), :text("Jeda + 4 modul akademis")', { pulse: true }).catch(() => {});
  await ctx.page.waitForTimeout(3000);

  // Scroll ke section Kurikulum.
  const kurikulum = ctx.page.locator('#kurikulum, :text("Kurikulum")').first();
  if (await kurikulum.count()) {
    await kurikulum.scrollIntoViewIfNeeded();
  } else {
    await ctx.page.mouse.wheel(0, 600);
  }
  await ctx.page.waitForTimeout(1500);

  ctx.mark("zoom-jeda-card", { factor: 1.4, durationMs: 4000, focus: "modul-jeda" });
  await ctx.hoverHighlight('a[href*="/cerita/jeda"], :text("Jeda — Alya")', 1800).catch(() => {});

  // Hover the 4 academic module cards in workshop order.
  const moduleAnchors = [
    'a[href*="modul-01-introduction-to-ai"]',
    'a[href*="modul-02-ethical-use-0f-ai"]',
    'a[href*="modul-22-ai-prompts-101"]',
    'a[href*="modul-11-fighting-hoax-with-ai"]',
  ];
  ctx.mark("zoom-kurikulum-grid", { factor: 1.5, durationMs: 4500, focus: "modul-grid" });
  for (const sel of moduleAnchors) {
    await ctx.hoverHighlight(sel, 1400).catch(() => {});
  }

  await ctx.padToTarget();
}

async function chapter05(ctx: ChapterCtx): Promise<void> {
  ctx.mark("chapter-start");
  await ctx.page.goto(`${BASE_URL}/tutor/modul`, { waitUntil: "domcontentloaded" });
  await ctx.page.waitForTimeout(1500);

  ctx.mark("zoom-stat-strip", { factor: 1.3, durationMs: 4000, focus: "stat-strip" });

  // Hover stat strip — labels accurate to actual UI.
  const statCards = ['text=Total Modul', 'text=Siswa Aktif', 'text=Pending Review', 'text=Avg Completion'];
  for (const s of statCards) {
    await ctx.moveTo(s).catch(() => {});
    await ctx.page.waitForTimeout(900);
  }

  // Open detail page — read-only insight, NOT editor.
  const moduleLink = ctx.page.locator('a[href*="/tutor/modul/"]').first();
  if (await moduleLink.count()) {
    await moduleLink.click();
    await ctx.page.waitForLoadState("domcontentloaded");
    ctx.mark("module-detail-opened");
    await ctx.page.waitForTimeout(2000);
  }

  // Show siswa progress per sesi + diskusi muncul.
  ctx.mark("zoom-siswa-progress", { factor: 1.4, durationMs: 4000, focus: "siswa-progress" });
  await ctx.page.mouse.wheel(0, 400);
  await ctx.page.waitForTimeout(2500);

  // Subtle hover ke CTA Review / Diskusi (yang ADA — bukan Tambah Materi).
  await ctx.hoverHighlight(
    ':text("Lihat Diskusi"), :text("Review Tugas"), a[href*="/tutor/review"]',
    1500,
  ).catch(() => {});

  await ctx.padToTarget();
}

async function chapter06(ctx: ChapterCtx): Promise<void> {
  ctx.mark("chapter-start");
  await ctx.page.goto(`${BASE_URL}/tutor/bahan-ajar`, { waitUntil: "domcontentloaded" });
  await ctx.page.waitForTimeout(1500);

  // Tutor read-only — hover cards untuk perlihatkan badge tipe + size,
  // bukan Upload button (tidak ada di sisi tutor).
  const cards = ctx.page.locator('[data-testid="bahan-card"], article:has(:text("PDF")), article:has(:text("DOCX"))');
  const count = await cards.count().catch(() => 0);
  for (let i = 0; i < Math.min(count, 3); i++) {
    await cards.nth(i).hover().catch(() => {});
    await ctx.page.waitForTimeout(800);
  }

  ctx.mark("zoom-bahan-card", { factor: 1.3, durationMs: 4000, focus: "bahan-card-detail" });
  await ctx.hoverHighlight('a:has-text("Download"), button:has-text("Download")', 1500).catch(() => {});

  await ctx.padToTarget();
}

async function chapter07(ctx: ChapterCtx): Promise<void> {
  ctx.mark("chapter-start");
  await ctx.page.goto(`${BASE_URL}/tutor/materi`, { waitUntil: "domcontentloaded" });
  await ctx.page.waitForTimeout(1500);

  // List bank soal yang tersedia per modul tutor (read-only).
  ctx.mark("zoom-soal-list", { factor: 1.3, durationMs: 3500, focus: "soal-list" });
  await ctx.page.mouse.wheel(0, 300);
  await ctx.page.waitForTimeout(1500);

  // Klik Tambah Materi → form Usulan Materi (BUKAN create soal langsung).
  const newBtn = ctx.page.locator('a[href*="/tutor/materi/baru"], button:has-text("Tambah Materi")').first();
  await newBtn.click().catch(() => {});
  await ctx.page.waitForLoadState("domcontentloaded");
  ctx.mark("usulan-form-opened");
  await ctx.page.waitForTimeout(1500);

  // Demo hover field konteks + usulan + alasan. Tidak submit (demo only).
  const fields = [
    'textarea[name*="konteks"], input[name*="konteks"]',
    'textarea[name*="usulan"], input[name*="usulan"]',
    'textarea[name*="alasan"], input[name*="alasan"]',
  ];
  for (const sel of fields) {
    await ctx.moveTo(sel).catch(() => {});
    await ctx.page.waitForTimeout(900);
  }

  ctx.mark("zoom-usulan-form", { factor: 1.4, durationMs: 4000, focus: "usulan-form" });
  await ctx.hoverHighlight('button:has-text("Kirim Usulan"), button[type="submit"]', 1500).catch(() => {});

  await ctx.padToTarget();
}

async function chapter08(ctx: ChapterCtx): Promise<void> {
  ctx.mark("chapter-start");

  // Phase A: review tugas umum
  await ctx.page.goto(`${BASE_URL}/tutor/review`, { waitUntil: "domcontentloaded" });
  await ctx.page.waitForTimeout(1500);
  ctx.mark("review-list-loaded");

  const firstReview = ctx.page.locator('a[href*="/tutor/review/"]').first();
  if (await firstReview.count()) {
    await firstReview.click();
    await ctx.page.waitForLoadState("domcontentloaded");
    ctx.mark("review-detail-opened");
    await ctx.page.waitForTimeout(2500);
    ctx.mark("zoom-rubric", { factor: 1.4, durationMs: 4000, focus: "rubric" });
  }

  // Phase B: IELTS writing
  await ctx.page.goto(`${BASE_URL}/tutor/review/writing`, { waitUntil: "domcontentloaded" });
  await ctx.page.waitForTimeout(1500);
  ctx.mark("ielts-list-loaded");

  const firstIelts = ctx.page.locator('a[href*="/tutor/review/writing/"]').first();
  if (await firstIelts.count()) {
    await firstIelts.click();
    await ctx.page.waitForLoadState("domcontentloaded");
    ctx.mark("ielts-detail-opened");
    await ctx.page.waitForTimeout(2500);
    ctx.mark("zoom-band-score", { factor: 1.5, durationMs: 4000, focus: "band-scores" });
  }

  await ctx.padToTarget();
}

async function chapter09(ctx: ChapterCtx): Promise<void> {
  ctx.mark("chapter-start");
  await ctx.page.goto(`${BASE_URL}/tutor/siswa`, { waitUntil: "domcontentloaded" });
  await ctx.page.waitForTimeout(1500);

  // Open Alya's detail by name match.
  const alyaLink = ctx.page
    .locator('a[href*="/tutor/siswa/"]:has-text("Alya"), a[href*="/tutor/siswa/"]')
    .first();
  if (await alyaLink.count()) {
    await alyaLink.click();
    await ctx.page.waitForLoadState("domcontentloaded");
    ctx.mark("siswa-detail-opened");
    await ctx.page.waitForTimeout(2000);
  }

  // Scroll through biodata → scorecard → eksplorasi karir → riwayat
  for (let i = 0; i < 4; i++) {
    await ctx.page.mouse.wheel(0, 500);
    await ctx.page.waitForTimeout(1500);
  }
  ctx.mark("zoom-eksplorasi-karir", { factor: 1.4, durationMs: 4000, focus: "riasec-block" });

  await ctx.moveTo(':text("Download CV"), button:has-text("Download CV PDF")', { pulse: true }).catch(() => {});
  ctx.mark("pulse-download-cv");

  await ctx.page.mouse.wheel(0, -2000);
  await ctx.page.waitForTimeout(800);
  await ctx.moveTo(':text("Diskusi"), [role="tab"]:has-text("Diskusi")').catch(() => {});
  await ctx.page.locator(':text("Diskusi"), [role="tab"]:has-text("Diskusi")').first().click().catch(() => {});
  ctx.mark("diskusi-tab");

  await ctx.padToTarget();
}

async function chapter10(ctx: ChapterCtx): Promise<void> {
  ctx.mark("chapter-start");

  // Phase A: schedule via /tutor/live + CreateLiveEventForm.
  await ctx.page.goto(`${BASE_URL}/tutor/live`, { waitUntil: "domcontentloaded" });
  await ctx.page.waitForTimeout(1500);

  const scheduleBtn = ctx.page
    .locator('button:has-text("Buat Live Session"), button:has-text("Jadwalkan"), a:has-text("Buat Live")')
    .first();
  if (await scheduleBtn.count()) {
    await scheduleBtn.click();
    await ctx.page.waitForTimeout(1500);
    ctx.mark("jadwal-form-opened");

    // Form fields actual: title, description, moduleSlug, scheduledAt,
    // durationMinutes, meetingUrl, maxParticipants. NO tipe sesi.
    const titleInput = ctx.page.locator('input[name*="title"], input[placeholder*="judul" i]').first();
    if (await titleInput.count()) {
      await titleInput.click();
      await titleInput.type("Demo Live Session", { delay: 50 });
    }

    // Hover module dropdown + duration + meeting URL.
    await ctx.moveTo('select[name*="module"], select[name*="modul"]').catch(() => {});
    await ctx.page.waitForTimeout(800);
    await ctx.moveTo('input[name*="duration"], input[type="number"]').catch(() => {});
    await ctx.page.waitForTimeout(800);
    await ctx.moveTo('input[name*="meeting"], input[type="url"]').catch(() => {});
    await ctx.page.waitForTimeout(800);

    ctx.mark("zoom-jadwal-form", { factor: 1.3, durationMs: 4000, focus: "jadwal-form" });
    await ctx.page.waitForTimeout(2000);

    // Cancel rather than create — keeps DB clean.
    await ctx.page.keyboard.press("Escape");
  }

  // Phase B: enter PRESENTER room (route aktual = /live-session/[id]/room,
  // bukan /tutor/live/[id] yang merupakan post-event management).
  await ctx.page.goto(`${BASE_URL}/tutor/live`, { waitUntil: "domcontentloaded" });
  await ctx.page.waitForTimeout(1000);

  // Extract event ID dari link list, lalu navigate ke /live-session/[id]/room.
  const liveCard = ctx.page.locator('a[href*="/tutor/live/"]').first();
  let eventId: string | null = null;
  if (await liveCard.count()) {
    const href = (await liveCard.getAttribute("href")) ?? "";
    const m = href.match(/\/tutor\/live\/([^/?#]+)/);
    eventId = m?.[1] ?? null;
  }

  if (eventId) {
    await ctx.page.goto(`${BASE_URL}/live-session/${eventId}/room`, {
      waitUntil: "domcontentloaded",
    });
    ctx.mark("presenter-room-opened");
    await ctx.page.waitForTimeout(3000);
  }

  // Navigate slides.
  await ctx.moveTo('button[aria-label*="next" i], button:has-text("Next")').catch(() => {});
  await ctx.page.locator('button[aria-label*="next" i], button:has-text("Next")').first().click().catch(() => {});
  await ctx.page.waitForTimeout(1500);

  // Push Quiz modal (PushQuizModal component).
  ctx.mark("zoom-push-quiz", { factor: 1.5, durationMs: 4000, focus: "push-quiz-btn" });
  await ctx.hoverHighlight('button:has-text("Push Quiz"), :text("Push Quiz")', 1500).catch(() => {});

  // Chat / Q&A panel right side.
  ctx.mark("zoom-chat-qna", { factor: 1.3, durationMs: 4000, focus: "side-panel" });
  const chatInput = ctx.page.locator('input[placeholder*="pesan" i], textarea[placeholder*="pesan" i]').first();
  if (await chatInput.count()) {
    await chatInput.click();
    await chatInput.type("Halo semua, selamat datang!", { delay: 50 });
  }

  // End session via EndSessionDialog.
  ctx.mark("flash-white", { type: "transition" });
  await ctx.moveTo('button:has-text("Akhiri")').catch(() => {});

  // Phase C: balik ke /tutor/live/[id] (post-event management) untuk
  // demo AttendanceTable + AssignmentPanel + recording URL input.
  if (eventId) {
    await ctx.page.goto(`${BASE_URL}/tutor/live/${eventId}`, {
      waitUntil: "domcontentloaded",
    });
    ctx.mark("post-event-management-opened");
    await ctx.page.waitForTimeout(2000);
    await ctx.hoverHighlight('input[name*="recording"], :text("Recording URL")', 1500).catch(() => {});
  }

  await ctx.padToTarget();
}

async function chapter11(ctx: ChapterCtx): Promise<void> {
  ctx.mark("chapter-start");
  await ctx.page.goto(`${BASE_URL}/tutor/cerita`, { waitUntil: "domcontentloaded" });
  await ctx.page.waitForTimeout(1500);

  const ceritaLink = ctx.page.locator('a[href*="/tutor/cerita/"], a:has-text("Jeda")').first();
  if (await ceritaLink.count()) {
    await ceritaLink.click();
    await ctx.page.waitForLoadState("domcontentloaded");
    ctx.mark("cerita-editor-opened");
    await ctx.page.waitForTimeout(2500);
  }

  ctx.mark("zoom-scene-graph", { factor: 1.4, durationMs: 4000, focus: "scene-graph" });
  await ctx.page.waitForTimeout(3000);

  ctx.mark("zoom-choice-node", { factor: 1.3, durationMs: 3500, focus: "choice-node" });
  await ctx.moveTo('[data-node-type="choice"], :text("Pilih")').catch(() => {});

  await ctx.padToTarget();
}

async function chapter12(ctx: ChapterCtx): Promise<void> {
  ctx.mark("chapter-start");

  // Phase A: Pesan
  await ctx.page.goto(`${BASE_URL}/pesan`, { waitUntil: "domcontentloaded" });
  await ctx.page.waitForTimeout(1500);
  ctx.mark("pesan-loaded");
  await ctx.page.waitForTimeout(6000);

  // Phase B: Analitik
  await ctx.page.goto(`${BASE_URL}/tutor/analitik`, { waitUntil: "domcontentloaded" });
  await ctx.page.waitForTimeout(1500);
  ctx.mark("analitik-loaded");
  await ctx.page.mouse.wheel(0, 400);
  await ctx.page.waitForTimeout(6000);

  // Phase C: Profil
  await ctx.page.goto(`${BASE_URL}/tutor/profil`, { waitUntil: "domcontentloaded" });
  await ctx.page.waitForTimeout(1500);
  ctx.mark("profil-loaded");
  await ctx.hoverHighlight('button:has-text("Edit"), :text("Edit Profil")', 2000).catch(() => {});

  // Phase D: outro placeholder — compose.py overlays the logo + tagline.
  ctx.mark("outro-fade-start");

  await ctx.padToTarget();
}

// ----------------- orchestration -----------------

const CHAPTER_FNS: Record<number, (ctx: ChapterCtx) => Promise<void>> = {
  1: chapter01,
  2: chapter02,
  3: chapter03,
  4: chapter04,
  5: chapter05,
  6: chapter06,
  7: chapter07,
  8: chapter08,
  9: chapter09,
  10: chapter10,
  11: chapter11,
  12: chapter12,
};

async function main(): Promise<void> {
  if (!TUTOR_PASSWORD) {
    console.error("RECORD_TUTOR_PASSWORD env var is required.");
    process.exit(1);
  }
  fs.mkdirSync(SCREEN_DIR, { recursive: true });

  const browser: Browser = await chromium.launch({ headless: HEADLESS });
  const context: BrowserContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: SCREEN_DIR, size: { width: 1920, height: 1080 } },
    deviceScaleFactor: 1,
  });
  await context.addInitScript(CURSOR_INJECT_SCRIPT);

  const page = await context.newPage();
  const runStart = Date.now();
  const marks: ChapterMark[] = [];

  for (const spec of CHAPTERS) {
    if (spec.num === 8 && !INCLUDE_REVIEW) {
      console.log(`Skipping Chapter 8 (SENOPATI_RECORD_REVIEW != 1)`);
      continue;
    }
    const fn = CHAPTER_FNS[spec.num];
    if (!fn) {
      console.warn(`No fn for chapter ${spec.num}, skipping`);
      continue;
    }

    console.log(`▶ Chapter ${spec.num}: ${spec.title} (target ${spec.targetMs}ms)`);
    const ctx = new ChapterCtx(page, spec, runStart);
    const startMs = ctx.absMs();
    try {
      await fn(ctx);
    } catch (err) {
      console.error(`Chapter ${spec.num} threw:`, err);
    }
    const endMs = ctx.absMs();

    marks.push({
      num: spec.num,
      title: spec.title,
      startMs,
      endMs,
      targetMs: spec.targetMs,
      events: ctx.events,
    });
    console.log(`  done: ${endMs - startMs}ms (target ${spec.targetMs}ms)`);
  }

  await context.close();
  await browser.close();

  // Locate the produced webm — Playwright names it with a temp filename.
  const webms = fs.readdirSync(SCREEN_DIR).filter((f: string) => f.endsWith(".webm"));
  const recording = webms.length ? path.join(SCREEN_DIR, webms[webms.length - 1]) : null;

  fs.writeFileSync(
    TIMESTAMPS_PATH,
    JSON.stringify(
      {
        baseUrl: BASE_URL,
        recordedAt: new Date().toISOString(),
        recording,
        totalMs: marks.length ? marks[marks.length - 1].endMs : 0,
        chapters: marks,
      },
      null,
      2,
    ),
  );
  console.log(`\nTimestamps → ${TIMESTAMPS_PATH}`);
  console.log(`Recording  → ${recording ?? "(not found, check screen/)"}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
