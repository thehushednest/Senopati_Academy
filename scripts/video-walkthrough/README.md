# Video Walkthrough Tutor — Recorder & Compositor

Pipeline lengkap untuk video walkthrough tutor Senopati Academy (STORYBOARD.md rev-2, ~8 menit, 12 chapter).

```
record.ts ──► screen/recording.webm + timestamps.json
                            │
                            ▼
                       compose.py ──► output/walkthrough-tutor-YYYY-MM-DD.mp4
                            ▲
            vo/*.mp3 + lipsync/*.mp4 + assets/*
```

## Prasyarat

1. Senopati Academy app sudah dijalankan lokal di `http://localhost:3000` dengan migration terkini (`npx prisma migrate dev`) — lihat STORYBOARD §0.
2. Tutor demo (`tutor.demo@asksenopati.com`) ada di DB dan password-nya Anda punya.
3. Node 18+, Python 3.10+, ffmpeg di PATH.

## Setup (sekali)

```bash
cd scripts/video-walkthrough

# Node side
npm install
npm run install:browsers   # downloads Chromium for Playwright

# Python side
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Workflow

### 1. (Manual) Siapkan asset

- `assets/character.png` — generate via DALL-E/Midjourney pakai prompt §14 STORYBOARD (default: Elsya, female teacher).
- `assets/logo-senopati.png` — copy dari `public/` repo.
- `vo/chapter-01.mp3` … `chapter-12.mp3` — ElevenLabs (voice Charlotte recommended, lihat §15). Script per chapter ada di `lib/timing.ts`.
- `lipsync/char-01.mp4` … `char-12.mp4` — HeyGen, avatar "Elsya — Pemandu Senopati", green-screen `#00b140`, 1:1 aspect (lihat §16).

### 2. Recording

```bash
export RECORD_TUTOR_PASSWORD="<password tutor.demo>"
# include Chapter 8 (Review Tugas/IELTS) — butuh NEXT_PUBLIC_REVIEW_ENABLED=true di app
export SENOPATI_RECORD_REVIEW=1

npm run record
```

Headless run (lebih cepat, tidak ada UI):

```bash
npm run record:headless
```

Output:
- `screen/<random>.webm` — full 1920×1080 screen capture
- `timestamps.json` — chapter marks + event markers untuk compose.py

### 3. Compose

```bash
source .venv/bin/activate
python compose.py                     # default: per-chapter + combined
python compose.py --mode per-chapter  # 12 MP4s, no concat
python compose.py --mode combined     # 1 concatenated MP4
python compose.py --only 5,8          # regenerate only specific chapters
```

Flag berguna:
- `--mode {per-chapter,combined,both}` — default `both`. Per-chapter
  baik buat review/replace individual; combined baik untuk publish akhir.
- `--only N,M,...` — regenerate hanya chapter tertentu (mis. setelah
  ganti VO Ch.5 + Ch.8 saja)
- `--no-pip` — skip PiP overlay (preview screen-only, jauh lebih cepat)
- `--skip-zoom` — skip zoom-in effects
- `--bgm path/to/track.mp3` — mix background music di -24 dB (combined only)
- `--out custom/path.mp4` — override combined output path

Output:
- `output/chapters/chapter-NN-<slug>.mp4` — 12 per-chapter videos
- `output/walkthrough-tutor-YYYY-MM-DD.mp4` — final concatenated 1080p
- `output/walkthrough-tutor-YYYY-MM-DD.srt` — subtitle bahasa Indonesia

## Penyesuaian umum

**Selector tidak match.** `record.ts` pakai locator yang defensif (text + href fallback). Kalau salah satu chapter gagal cari element, edit selector di chapter function yang relevan (Chapter 5 untuk module editor, Chapter 11 untuk Cerita Interaktif, dll). Setiap chapter function di-isolate, jadi kalau Chapter X gagal, chapter lain tetap jalan.

**Zoom focus salah.** `compose.py` default zoom-nya center-crop. Untuk zoom presisi ke region tertentu (mis. ke kartu "Modul aktif" yang ada di koordinat tertentu), set `event.payload.region = [x, y, w, h]` di chapter function, lalu update `apply_zoom_event()` agar pakai region itu (TODO masih center-crop only).

**Durasi VO tidak match target.** `record.ts` pad ke target chapter (mis. Chapter 1 = 30s). Kalau VO Anda mejret jadi 33s, edit `targetMs` di `lib/timing.ts` (sumber kebenaran tunggal — record.ts & compose.py keduanya baca lewat timestamps.json).

**Chapter 8 di-skip karena fitur Review belum live.** Set `SENOPATI_RECORD_REVIEW=0` (default), Chapter 8 di-skip dan total durasi turun ke ~7:15. STORYBOARD §8 sudah catat ini.

## Troubleshooting

| Gejala | Kemungkinan penyebab |
|---|---|
| Playwright launch error | `npm run install:browsers` belum dijalankan |
| `column ... does not exist` saat dev server | `npx prisma migrate dev` belum di-run, lihat STORYBOARD §0 |
| moviepy `TextClip: ImageMagick not found` | install ImageMagick OS-level: `apt install imagemagick` / `brew install imagemagick`, atau set `moviepy.config.IMAGEMAGICK_BINARY` |
| PiP keluar PIP-nya hijau | lipsync video bukan green-screen `#00b140`; periksa setting HeyGen export |
| Recording terlalu pendek | salah satu chapter `await padToTarget()` skipped karena exception sebelumnya — cek log `[chN]` |

## File map

```
scripts/video-walkthrough/
├── README.md                 # this file
├── STORYBOARD.md → ../../docs/video-walkthrough-tutor/STORYBOARD.md
├── package.json              # Playwright + tsx
├── tsconfig.json
├── requirements.txt          # moviepy + numpy
├── .gitignore                # ignores all generated artifacts
├── record.ts                 # Playwright recorder (orchestrates 12 chapters)
├── compose.py                # moviepy compositor (PiP, zoom, SRT)
├── lib/
│   ├── cursor.ts             # injected fake cursor + pulse helpers
│   └── timing.ts             # chapter spec (durations + VO scripts)
├── assets/                   # user-provided: character.png, logo
├── vo/                       # user-provided: chapter-NN.mp3
├── lipsync/                  # user-provided: char-NN.mp4
├── screen/                   # auto: recording.webm
├── temp/                     # auto: compose intermediates
└── output/                   # auto: final mp4 + srt
```
