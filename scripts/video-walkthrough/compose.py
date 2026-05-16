#!/usr/bin/env python3
"""
Composite the screen recording, character lipsync videos, and ElevenLabs VO
into the final tutor walkthrough MP4.

Inputs (relative to this file's directory):
  timestamps.json           — produced by record.ts
  screen/recording.webm     — full screen capture
  lipsync/char-NN.mp4       — green-screen character video per chapter
  vo/chapter-NN.mp3         — voiceover audio per chapter
  assets/logo-senopati.png  — used for intro/outro title cards

Output:
  output/walkthrough-tutor-YYYY-MM-DD.mp4

Run:
  python scripts/video-walkthrough/compose.py

Optional flags:
  --no-pip        skip PiP overlay (useful for previewing screen-only)
  --bgm path.mp3  mix background music at -24 dB under VO
  --skip-zoom     skip zoom effects (faster render for previewing)
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import numpy as np

try:
    from moviepy.editor import (
        AudioFileClip,
        ColorClip,
        CompositeAudioClip,
        CompositeVideoClip,
        ImageClip,
        TextClip,
        VideoFileClip,
        concatenate_videoclips,
        afx,
        vfx,
    )
except ImportError:
    print("moviepy is required: pip install -r requirements.txt", file=sys.stderr)
    raise

# ---------- paths ----------
ROOT = Path(__file__).resolve().parent
TS_PATH = ROOT / "timestamps.json"
SCREEN_DIR = ROOT / "screen"
LIPSYNC_DIR = ROOT / "lipsync"
VO_DIR = ROOT / "vo"
ASSETS_DIR = ROOT / "assets"
OUTPUT_DIR = ROOT / "output"

# ---------- visual constants (from STORYBOARD §1) ----------
W, H = 1920, 1080
FPS = 30
PIP_W = 300
PIP_H = 300
PIP_MARGIN = 30
PIP_RADIUS = 20
CHROMA_GREEN = np.array([0, 177, 64], dtype=np.uint8)  # #00b140
CHROMA_TOL = 60


@dataclass
class ChapterMark:
    num: int
    title: str
    start_ms: int
    end_ms: int
    target_ms: int
    events: list[dict]


def load_timestamps() -> tuple[list[ChapterMark], Path | None]:
    if not TS_PATH.exists():
        raise SystemExit(f"timestamps.json not found at {TS_PATH} — run record.ts first")
    with TS_PATH.open() as f:
        data = json.load(f)
    chapters = [
        ChapterMark(
            num=c["num"],
            title=c["title"],
            start_ms=c["startMs"],
            end_ms=c["endMs"],
            target_ms=c["targetMs"],
            events=c.get("events", []),
        )
        for c in data["chapters"]
    ]
    recording_path = Path(data["recording"]) if data.get("recording") else None
    return chapters, recording_path


# ---------- chroma key ----------

def chroma_key_mask(frame: np.ndarray) -> np.ndarray:
    """Return an alpha mask (0..1) where green pixels are 0 and others are 1."""
    diff = frame.astype(np.int32) - CHROMA_GREEN.astype(np.int32)
    dist = np.sqrt((diff ** 2).sum(axis=-1))
    mask = np.clip((dist - CHROMA_TOL) / 20.0, 0.0, 1.0)
    return mask


def build_pip_clip(lipsync_path: Path, duration_s: float) -> Optional[VideoFileClip]:
    """Load a HeyGen green-screen video and return a chroma-keyed PiP clip
    sized to PIP_W × PIP_H. Returns None if the file is missing."""
    if not lipsync_path.exists():
        return None
    clip = VideoFileClip(str(lipsync_path), audio=False)
    if clip.duration > duration_s:
        clip = clip.subclip(0, duration_s)
    elif clip.duration < duration_s - 0.05:
        # Hold last frame as a freeze tail.
        clip = clip.fx(vfx.freeze, t=clip.duration - 0.04, freeze_duration=duration_s - clip.duration)

    clip = clip.resize(height=PIP_H)
    if clip.w != PIP_W:
        # Crop to a square in case the source isn't 1:1.
        excess = clip.w - PIP_W
        clip = clip.crop(x1=max(0, excess // 2), width=PIP_W)

    # Mask the green out.
    masked = clip.fl_image(
        lambda f: np.dstack([f, (chroma_key_mask(f) * 255).astype(np.uint8)])
        if f.shape[-1] == 3
        else f
    )
    masked = masked.set_position(
        lambda _t: (W - PIP_W - PIP_MARGIN, H - PIP_H - PIP_MARGIN)
    )
    return masked


# ---------- title cards ----------

def make_title_card(text: str, subtitle: str | None, duration_s: float) -> CompositeVideoClip:
    bg = ColorClip(size=(W, H), color=(13, 31, 58)).set_duration(duration_s).set_opacity(0.0)

    title = (
        TextClip(text, fontsize=72, font="DejaVu-Sans-Bold", color="white", method="caption", size=(int(W * 0.7), None))
        .set_position(("center", H // 2 - 80))
        .set_duration(duration_s)
        .crossfadein(0.5)
        .crossfadeout(0.5)
    )
    layers = [bg, title]
    if subtitle:
        sub = (
            TextClip(subtitle, fontsize=36, font="DejaVu-Sans", color="white", method="caption", size=(int(W * 0.7), None))
            .set_position(("center", H // 2 + 30))
            .set_duration(duration_s)
            .crossfadein(0.6)
            .crossfadeout(0.5)
        )
        layers.append(sub)

    return CompositeVideoClip(layers, size=(W, H)).set_duration(duration_s)


def make_logo_outro(duration_s: float) -> CompositeVideoClip:
    bg = ColorClip(size=(W, H), color=(13, 31, 58)).set_duration(duration_s)
    layers = [bg]
    logo_path = ASSETS_DIR / "logo-senopati.png"
    if logo_path.exists():
        logo = (
            ImageClip(str(logo_path))
            .resize(height=240)
            .set_position(("center", H // 2 - 150))
            .set_duration(duration_s)
            .crossfadein(0.8)
        )
        layers.append(logo)
    tagline = (
        TextClip(
            "Mengajar lebih mudah, belajar lebih bermakna",
            fontsize=42,
            font="DejaVu-Sans",
            color="white",
            method="caption",
            size=(int(W * 0.6), None),
        )
        .set_position(("center", H // 2 + 130))
        .set_duration(duration_s)
        .crossfadein(1.0)
    )
    layers.append(tagline)
    return CompositeVideoClip(layers, size=(W, H)).set_duration(duration_s)


# ---------- zoom effect ----------

def apply_zoom_event(clip: VideoFileClip, event: dict, chapter_start_s: float) -> VideoFileClip:
    """Crude zoom: from `at_ms` for `durationMs`, crop to a centered region
    based on `factor` and resize back to full frame.

    We don't know the exact pixel of each focus point, so we apply a simple
    center-zoom. For precise zooms, set event['payload']['region'] = [x,y,w,h]
    in record.ts (TODO follow-up)."""
    payload = event.get("payload") or {}
    factor = float(payload.get("factor", 1.3))
    dur = float(payload.get("durationMs", 4000)) / 1000.0
    abs_at = event["at"] / 1000.0
    local_at = abs_at - chapter_start_s
    if local_at < 0 or local_at > clip.duration:
        return clip
    end = min(clip.duration, local_at + dur)
    if end <= local_at:
        return clip

    # Build a zoomed sub-clip and overlay.
    sub = clip.subclip(local_at, end)
    crop_w = int(W / factor)
    crop_h = int(H / factor)
    x1 = (W - crop_w) // 2
    y1 = (H - crop_h) // 2
    zoomed = sub.crop(x1=x1, y1=y1, width=crop_w, height=crop_h).resize((W, H))
    zoomed = zoomed.set_start(local_at).crossfadein(0.25).crossfadeout(0.25)
    return CompositeVideoClip([clip, zoomed], size=(W, H)).set_duration(clip.duration)


# ---------- per-chapter pipeline ----------

def build_chapter_clip(
    ch: ChapterMark,
    screen: VideoFileClip,
    args: argparse.Namespace,
) -> CompositeVideoClip:
    duration_s = (ch.end_ms - ch.start_ms) / 1000.0
    if duration_s <= 0:
        raise ValueError(f"Chapter {ch.num} has non-positive duration {duration_s}s")

    seg = screen.subclip(ch.start_ms / 1000.0, ch.end_ms / 1000.0).resize((W, H))

    # Apply zoom events if requested.
    if not args.skip_zoom:
        for ev in ch.events:
            if ev["type"].startswith("zoom-"):
                try:
                    seg = apply_zoom_event(seg, ev, ch.start_ms / 1000.0)
                except Exception as err:
                    print(f"  ⚠ zoom event {ev['type']} failed: {err}")

    layers = [seg]

    # PiP overlay.
    if not args.no_pip:
        pip_path = LIPSYNC_DIR / f"char-{ch.num:02d}.mp4"
        pip = build_pip_clip(pip_path, duration_s)
        if pip is not None:
            layers.append(pip)
        else:
            print(f"  ⚠ no lipsync video at {pip_path.name}, skipping PiP")

    # Chapter 1 title card overlay (0:08–0:18 in the storyboard).
    if ch.num == 1:
        card = make_title_card(
            "Walkthrough Tutor — Senopati Academy",
            "Bersama Elsya, Pemandu Virtual Anda",
            10.0,
        ).set_start(8.0).set_opacity(0.92)
        layers.append(card)

    composite = CompositeVideoClip(layers, size=(W, H)).set_duration(duration_s)

    # Audio: prefer VO mp3; fall back to screen recording's audio.
    vo_path = VO_DIR / f"chapter-{ch.num:02d}.mp3"
    if vo_path.exists():
        vo = AudioFileClip(str(vo_path))
        if vo.duration > duration_s:
            vo = vo.subclip(0, duration_s)
        composite = composite.set_audio(vo)
    else:
        print(f"  ⚠ no VO at {vo_path.name}, leaving silent")
        composite = composite.set_audio(None)

    return composite


# ---------- SRT ----------

CHAPTER_VO_LINES_PATH = ROOT / "lib" / "timing.ts"


def _format_ts(ms: int) -> str:
    s, ms_rem = divmod(ms, 1000)
    h, rem = divmod(s, 3600)
    m, sec = divmod(rem, 60)
    return f"{h:02d}:{m:02d}:{sec:02d},{ms_rem:03d}"


def write_srt(chapters: list[ChapterMark], path: Path) -> None:
    # Pull VO lines from timing.ts (one paragraph per chapter). We split on
    # sentence ends so each subtitle line lands on a natural pause.
    import re

    src = CHAPTER_VO_LINES_PATH.read_text(encoding="utf-8")
    blocks = re.findall(r'num:\s*(\d+).*?voScript:\s*\n?\s*"([^"]+(?:"\s*\+\s*\n?\s*"[^"]+)*)"', src, re.S)
    vo_by_num: dict[int, str] = {}
    for num_s, raw in blocks:
        joined = re.sub(r'"\s*\+\s*\n?\s*"', "", raw)
        vo_by_num[int(num_s)] = joined.strip()

    cue_idx = 1
    lines: list[str] = []
    for ch in chapters:
        text = vo_by_num.get(ch.num, "")
        sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]
        if not sentences:
            continue
        slice_ms = (ch.end_ms - ch.start_ms) / len(sentences)
        for i, sent in enumerate(sentences):
            a = int(ch.start_ms + slice_ms * i)
            b = int(ch.start_ms + slice_ms * (i + 1))
            lines.append(str(cue_idx))
            lines.append(f"{_format_ts(a)} --> {_format_ts(b)}")
            lines.append(sent)
            lines.append("")
            cue_idx += 1
    path.write_text("\n".join(lines), encoding="utf-8")


# ---------- main ----------

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-pip", action="store_true")
    ap.add_argument("--skip-zoom", action="store_true")
    ap.add_argument("--bgm", type=str, default=None)
    ap.add_argument("--out", type=str, default=None)
    args = ap.parse_args()

    chapters, recording_path = load_timestamps()
    if not recording_path or not Path(recording_path).exists():
        raise SystemExit(f"Screen recording not found at {recording_path}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = Path(args.out) if args.out else OUTPUT_DIR / f"walkthrough-tutor-{dt.date.today():%Y-%m-%d}.mp4"
    srt_path = out_path.with_suffix(".srt")

    print(f"Loading screen recording: {recording_path}")
    screen = VideoFileClip(str(recording_path), audio=False).resize((W, H))

    clips = []
    for ch in chapters:
        print(f"▶ Chapter {ch.num}: {ch.title} ({(ch.end_ms - ch.start_ms)/1000:.1f}s)")
        try:
            clip = build_chapter_clip(ch, screen, args)
        except Exception as err:
            print(f"  ✖ chapter {ch.num} failed: {err}")
            continue
        clips.append(clip)

    # Outro 10s.
    outro = make_logo_outro(10.0)
    # Silence audio under outro so VO from chapter 12 doesn't leak.
    outro = outro.set_audio(None)
    clips.append(outro)

    final = concatenate_videoclips(clips, method="compose")

    # Background music.
    if args.bgm:
        bgm = AudioFileClip(args.bgm).volumex(10 ** (-24 / 20))  # -24 dB
        bgm = bgm.fx(afx.audio_loop, duration=final.duration)
        if final.audio is not None:
            final = final.set_audio(CompositeAudioClip([final.audio, bgm]))
        else:
            final = final.set_audio(bgm)

    print(f"\nRendering → {out_path}")
    final.write_videofile(
        str(out_path),
        fps=FPS,
        codec="libx264",
        audio_codec="aac",
        audio_bitrate="192k",
        preset="medium",
        threads=os.cpu_count() or 4,
    )

    print(f"Writing SRT → {srt_path}")
    write_srt(chapters, srt_path)

    print("\nDone.")


if __name__ == "__main__":
    main()
