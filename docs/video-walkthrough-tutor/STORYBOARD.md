# Storyboard — Video Walkthrough Tutor Senopati Academy

Target: **~6 menit MP4 1080p**, dual-layer (screen capture + character PiP),
audience tutor baru / tutor onboarding.

Workflow ringkas:
1. Saya tulis storyboard ini → Anda review
2. Anda generate character PNG (prompt di §11) + VO ElevenLabs (§12) +
   lipsync HeyGen (§13)
3. Saya tulis Playwright recorder + compositing script
4. Render final MP4

---

## 0. Spec Teknis

| Parameter | Nilai |
|---|---|
| Resolusi final | 1920×1080 (1080p) |
| FPS | 30 |
| Audio | 48kHz stereo, AAC 192kbps |
| Codec video | H.264 high profile |
| Container | MP4 |
| Durasi target | 5:30 — 6:30 menit |
| Background music | Optional — instrumental ringan, -24 dB di bawah VO |

**Layout dual-layer:**

```
┌─────────────────────────────────────────────────┐
│                                                 │
│                                                 │
│         SCREEN CAPTURE 1920×1080                │
│         (Playwright recording)                  │
│                                                 │
│                                                 │
│                                                 │
│                                       ┌───────┐ │
│                                       │ CHAR  │ │  ← PiP
│                                       │ ICON  │ │     300×300
│                                       │talking│ │     rounded 20px
│                                       └───────┘ │     drop shadow
└─────────────────────────────────────────────────┘
       Subtitle bahasa Indonesia (kalau enabled)
```

PiP position: bottom-right, margin 30px, dengan border radius 20px dan
drop shadow `0 8px 24px rgba(0,0,0,0.3)`. Background chroma-keyed dari
HeyGen green screen → transparent.

---

## Chapter 1 — Pembuka (15 detik)

**Durasi:** 0:00–0:15
**Mood:** Hangat, ramah, semangat
**Word count:** ~35 kata

**Action sequence (Playwright):**
- Tampilkan logo Senopati Academy fullscreen dengan fade-in 1s
- Logo zoom-out, transisi ke landing page `https://asksenopati.com`
- Cursor hover sebentar di tombol "Masuk"

**VO bahasa Indonesia:**

> Halo, Bapak dan Ibu Tutor! Selamat datang di Senopati Academy. Saya akan
> menemani Bapak Ibu mengenal fitur-fitur platform yang akan jadi teman
> mengajar sehari-hari. Yuk, kita mulai!

**Character expression:** Smiling, slight wave (pakai prompt HeyGen
"warm welcoming smile, slight head tilt").

**Visual cue:** Title card kecil di tengah "Walkthrough Tutor — Senopati
Academy" yang fade out di detik 4-5.

---

## Chapter 2 — Login & Dashboard Tutor (30 detik)

**Durasi:** 0:15–0:45
**Word count:** ~75 kata

**Action sequence (Playwright):**
- Klik tombol "Masuk" → navigasi ke `/login`
- Type email `demo.tutor@asksenopati.com` (slow typing animation 80wpm)
- Type password (masked)
- Klik "Masuk" → redirect ke `/dashboard`
- Pause 2 detik di dashboard — biarkan VO mention bagian dashboard
- Cursor hover ke kartu "Modul aktif" (top), lalu ke "Thread terbaru"
- Hover ke greeting card di pojok kanan atas dengan nama tutor

**VO bahasa Indonesia:**

> Login dengan akun tutor Anda menggunakan email dan kata sandi yang
> diberikan tim Senopati. Setelah masuk, Bapak Ibu akan langsung tiba di
> dashboard tutor. Di sini ada ringkasan tugas hari ini: modul yang aktif,
> diskusi terbaru dari siswa, dan jadwal live session yang akan datang.
> Semua dirancang biar Bapak Ibu langsung tahu apa yang harus dikerjakan.

**Character expression:** Explaining, hand gesture pointing right (subtle
nod tiap kalimat baru).

**Visual cue:** Zoom-in 1.2x ke kartu modul aktif saat VO mention "modul
yang aktif" (detik 0:25-0:30). Zoom-out balik normal di akhir chapter.

---

## Chapter 3 — Tour Sidebar Navigation (30 detik)

**Durasi:** 0:45–1:15
**Word count:** ~75 kata

**Action sequence (Playwright):**
- Cursor pindah ke sidebar kiri
- Hover berurutan tiap menu (delay 2.5 detik per menu):
  1. Modul Saya
  2. Bahan Ajar
  3. Live Session
  4. Pesan
  5. Siswa & Diskusi
  6. Materi & Soal
  7. Analitik
- Cursor pulse setiap hover (lingkaran teal expand+fade)

**VO bahasa Indonesia:**

> Di sebelah kiri ada menu navigasi utama. Modul Saya untuk kelola modul
> yang Anda ajar. Bahan Ajar untuk file materi. Live Session untuk jadwal
> dan ruang siaran langsung. Pesan untuk diskusi privat sama siswa.
> Siswa dan Diskusi untuk pantau perkembangan tiap siswa. Materi dan
> Soal untuk bikin kuis. Analitik untuk lihat performa.

**Character expression:** Listing, slight nodding tiap nama menu disebut.

**Visual cue:** Subtle highlight (border teal 2px) muncul di menu yang
sedang di-hover, sync dengan VO.

---

## Chapter 4 — Program Paham AI Overview (45 detik)

**Durasi:** 1:15–2:00
**Word count:** ~110 kata

**Action sequence (Playwright):**
- Klik "Modul Saya" di sidebar → `/tutor/modul`
- Scroll ke modul "Paham AI" series (Modul 01-22)
- Klik kartu Modul 01: "Introduction to AI"
- Tampilkan detail page modul: hero violet, deskripsi, syllabus 4-6 sesi
- Scroll perlahan ke bawah memperlihatkan structure: Session 1, 2, 3, ...
- Hover ke salah satu session — tampilkan badge "Live + Self-paced"

**VO bahasa Indonesia:**

> Program unggulan kami namanya Paham AI — dua puluh dua modul yang
> mengantar siswa dari nol sampai paham konsep dan praktik AI dasar.
> Tiap modul terdiri dari beberapa sesi: ada video pengantar, materi
> bacaan, kuis pendek, dan biasanya satu live session interaktif sama
> tutor seperti Bapak Ibu. Tugas tutor di Paham AI adalah memimpin live
> session, jawab diskusi, dan kasih feedback pas siswa kesulitan.

**Character expression:** Engaged, explaining, hand gesture menggambar
struktur tiga tingkat.

**Visual cue:**
- Detik 1:20: zoom 1.3x ke badge "Modul 01-22" di kartu modul
- Detik 1:45: zoom 1.5x ke section "Syllabus" memperlihatkan struktur
  per-sesi

---

## Chapter 5 — Modul Saya: Kelola Sesi & Bahan Ajar (45 detik)

**Durasi:** 2:00–2:45
**Word count:** ~110 kata

**Action sequence (Playwright):**
- Balik ke `/tutor/modul`, klik salah satu modul yang tutor demo ampuh
  (mis. "Modul 03: Machine Learning Dasar")
- Klik tab "Sesi" — list session muncul
- Klik 1 sesi → buka detail editor
- Highlight tombol "Tambah Materi" + "Tambah Kuis" + "Lampiran"
- Hover ke status badge (draft/published)
- Klik "Lampiran" → buka modal upload Bahan Ajar (PDF/PPT)
- Cancel modal, balik ke list

**VO bahasa Indonesia:**

> Di menu Modul Saya, Bapak Ibu bisa lihat semua modul yang Anda ampu.
> Klik satu modul untuk masuk ke editor sesi. Di sini Anda bisa tambah
> materi bacaan, sisipkan kuis di tengah pelajaran, atau lampirkan slide
> PDF dan PowerPoint. Status "Draft" artinya siswa belum lihat —
> aman buat eksperimen. Klik "Terbitkan" kalau materinya sudah siap
> ditampilkan ke siswa.

**Character expression:** Demonstrating, occasional point-down gesture.

**Visual cue:**
- Detik 2:10: cursor pulse pada tombol "Tambah Materi"
- Detik 2:25: zoom 1.4x ke status badge "Draft" vs "Published"

---

## Chapter 6 — Materi & Soal: Bikin Kuis (40 detik)

**Durasi:** 2:45–3:25
**Word count:** ~95 kata

**Action sequence (Playwright):**
- Klik menu "Materi & Soal" di sidebar → `/tutor/materi`
- Tampilkan list bank soal yang sudah ada
- Klik "Buat Soal Baru"
- Demo isi field: pertanyaan, 4 opsi, jawaban benar
- Highlight dropdown "Tipe" (pretest/posttest/midsession/open_qna)
- Klik "Simpan" — kembali ke list, soal baru muncul highlighted

**VO bahasa Indonesia:**

> Untuk membuat kuis, masuk ke menu Materi dan Soal. Bapak Ibu bisa bikin
> soal pilihan ganda, isian singkat, atau pertanyaan terbuka. Soal
> dikelompokkan berdasarkan tipe: Pretest untuk cek pengetahuan awal,
> Posttest untuk evaluasi akhir, dan Open Q-and-A untuk diskusi live.
> Soal yang Anda buat bisa dipakai ulang di banyak modul.

**Character expression:** Focused, occasional typing pantomime.

**Visual cue:** Detik 3:00 zoom 1.5x ke dropdown "Tipe" memperlihatkan
4 opsi.

---

## Chapter 7 — Siswa & Diskusi: Pantau Siswa (45 detik)

**Durasi:** 3:25–4:10
**Word count:** ~110 kata

**Action sequence (Playwright):**
- Klik "Siswa & Diskusi" → `/tutor/siswa`
- List siswa muncul (dengan progress bar per siswa)
- Klik siswa "Siswa Demo" (Alya Pertiwi)
- Buka detail siswa `/tutor/siswa/[id]`
- Scroll memperlihatkan section:
  1. Info biodata
  2. Scorecard 4-dimensi
  3. **Eksplorasi Karir** — RIASEC profile + CV summary + lamaran
  4. Riwayat modul completed
- Hover tombol "Download CV PDF"
- Scroll balik ke atas, klik tab "Diskusi"
- Tampilkan thread diskusi terbuka

**VO bahasa Indonesia:**

> Di menu Siswa, Anda lihat semua siswa yang Bapak Ibu bimbing. Klik
> nama siswa untuk masuk ke profil lengkap. Di sini Anda dapat data
> rapi: scorecard pemahaman akademik, hasil RIASEC untuk eksplorasi
> karir, ringkasan CV, dan riwayat lamaran kerja kalau siswa sudah mulai
> melamar. Anda juga bisa download CV mereka langsung untuk review.
> Di tab Diskusi, balas thread siswa secara personal.

**Character expression:** Attentive, slight lean-forward.

**Visual cue:**
- Detik 3:50: zoom 1.4x ke section "Eksplorasi Karir" memperlihatkan
  Holland Code + top match
- Detik 4:00: cursor pulse ke tombol "Download CV PDF"

---

## Chapter 8 — Live Session: Schedule & Pelaksanaan (75 detik)

**Durasi:** 4:10–5:25
**Word count:** ~175 kata

**Action sequence (Playwright):**

**Phase 8A — Schedule (0-20 detik dari chapter):**
- Klik "Live Session" → `/tutor/live`
- Klik "Jadwalkan Live Baru"
- Isi form: judul "Demo Live Session", pilih modul, set tanggal+jam,
  pilih tipe "Workshop"
- Klik "Jadwalkan" → kembali ke list, event baru muncul

**Phase 8B — Pelaksanaan (20-55 detik):**
- Klik event yang aktif → buka room presenter `/tutor/live/[id]`
- Tampilkan layout: slide canvas tengah, side panel kanan, status bar atas
- Klik "Upload Slide" → demo cepat upload PDF (atau skip ke modul yang
  sudah punya slide)
- Klik navigasi slide (next/prev)
- Klik tombol "Push Quiz" → modal muncul, pilih kuis pretest, klik "Kirim"
- Tampilkan badge "Quiz aktif, 0/3 jawab"
- Side panel kanan: tab Chat, ketik pesan demo "Halo semua, selamat datang"
- Tab Q&A: tampilkan list pertanyaan dari siswa

**Phase 8C — End (55-75 detik):**
- Klik "Akhiri Sesi" → modal konfirmasi
- Konfirmasi → recording disimpan, learning-complete event ter-trigger
- Toast notification "Sesi berakhir, rekaman tersimpan"

**VO bahasa Indonesia:**

> Sekarang bagian paling seru — Live Session. Dari menu Live Session,
> klik Jadwalkan Live Baru, isi judul, pilih modul, tentukan tanggal
> dan tipe sesi: Workshop, Reguler, atau Q-and-A. Saat tiba waktunya,
> Anda masuk ke ruang siaran.
>
> Di room presenter, slide tampil di tengah, dan panel kanan untuk chat
> dan tanya-jawab. Upload PDF slide dengan satu klik, lalu navigasi
> dengan tombol panah. Mau kasih kuis di tengah pelajaran? Tekan Push
> Quiz, pilih bank soal yang sudah Bapak Ibu siapkan, kirim. Siswa
> langsung dapat notifikasi dan kuisnya muncul di layar mereka.
>
> Setelah selesai, klik Akhiri Sesi. Rekaman otomatis tersimpan, dan
> sertifikat kelulusan siswa terbit otomatis kalau mereka memenuhi
> kriteria.

**Character expression:**
- Phase 8A: explaining, scheduling gesture
- Phase 8B: animated, more engaged, occasional point-forward
- Phase 8C: relaxed, satisfied closing

**Visual cue:**
- Detik 4:30: zoom 1.4x ke field "Tipe Sesi" memperlihatkan 3 opsi
- Detik 4:55: zoom 1.5x ke tombol "Push Quiz" yang berkedip
- Detik 5:10: zoom 1.3x ke side panel "Chat + Q&A"
- Detik 5:22: fade flash putih saat "Akhiri Sesi" — transisi mood

---

## Chapter 9 — Analitik + Penutup (30 detik)

**Durasi:** 5:25–5:55
**Word count:** ~75 kata

**Action sequence (Playwright):**
- Klik "Analitik" → `/tutor/analitik`
- Tampilkan dashboard: scorecard per siswa, completion rate per modul,
  rata-rata band score IELTS (kalau relevan)
- Scroll, hover beberapa kartu metric
- Fade-out ke logo Senopati Academy dengan tagline

**VO bahasa Indonesia:**

> Terakhir, menu Analitik kasih Bapak Ibu gambaran besar performa siswa
> dan modul yang Anda ampu. Pakai data ini untuk identifikasi siswa yang
> butuh perhatian ekstra. Itu tour cepat fitur tutor Senopati Academy.
> Kalau butuh bantuan, hubungi tim support kami di halo@asksenopati.com.
> Selamat mengajar dan terima kasih sudah jadi bagian dari Senopati!

**Character expression:** Warm closing smile, slight wave at end.

**Visual cue:**
- Detik 5:50: fade-in logo Senopati, tagline "Mengajar lebih mudah,
  belajar lebih bermakna"
- Detik 5:55: hold logo, fade to black

---

## 10. Subtitle SRT — Generated Automatis

Saya generate `subtitle.srt` dari VO script + timestamp chapter. Format
WebVTT-compatible, font: Inter Bold 28px, color white dengan outline 2px
hitam, position bottom margin 80px.

---

## 11. Character Generation Prompts (untuk DALL-E / Midjourney / SDXL)

### Style A — Friendly Modern Teacher (Recommended)

```
Friendly Indonesian young teacher character, 28 years old, warm smile,
wearing smart casual outfit: teal blazer (color #18C29C) over white shirt,
short black hair neatly styled, kind expressive eyes, medium shot from
chest up, slight three-quarter angle, looking at camera, clean studio
lighting, neutral cream background (or transparent PNG), digital
illustration style with subtle gradient shading, approachable and
professional, suitable for educational mascot. High detail face, clear
mouth area for lipsync. 1024x1024, centered composition.
```

### Style B — Anime / Pixar Stylized

```
Pixar-style 3D character of a young Indonesian teacher, warm friendly
smile, wearing a teal hoodie (#18C29C) with Senopati Academy logo,
slight tan skin tone, expressive dark eyes, neat short hair, medium
shot from chest up, looking forward, soft cinematic lighting, isolated
on solid green chromakey background (#00b140), 3D render highly
polished, cute and approachable, designed for educational content.
1024x1024.
```

### Style C — Flat Illustration / Cartoon

```
Flat vector illustration of an Indonesian teacher character, modern
geometric style, friendly smile, simple shapes, teal color palette
(#18C29C primary, #0f9d7c secondary), wearing collared shirt, slight
beard or no beard, short hair, medium shot bust portrait, clean white
or transparent background, design for animated mascot use, large clear
mouth and eyes for animation, behance / dribbble quality,
1024x1024 PNG.
```

**Rekomendasi:** Style A untuk feel paling profesional. Style B kalau
mau lebih playful/youthful. Style C kalau pakai Wav2Lip lokal (cartoon
lebih forgiving terhadap lipsync artifact).

**Setelah generate:**
- Cek wajah jelas, mulut clearly visible (HeyGen butuh ini untuk
  lipsync)
- Background transparent (PNG) ATAU solid green (#00b140) — saya bisa
  remove di compose stage pakai `rembg`
- Resolusi minimum 768×768, ideal 1024×1024+

Simpan di: `assets/character.png`

---

## 12. ElevenLabs VO Setting

**Voice yang direkomendasikan untuk bahasa Indonesia:**

| Voice | Karakter | Use case |
|---|---|---|
| **Antoni** (multilingual) | Pria muda, hangat, jelas | Recommended utama |
| **Bill** | Pria dewasa, professional | Kalau mau tone lebih senior |
| **Charlotte** | Wanita muda, friendly | Kalau prefer voice wanita |
| **Custom clone** | Voice Anda sendiri | Kalau punya budget + waktu setup |

**Setting:**
- Stability: **45%** (cukup variasi untuk natural, tidak monoton)
- Clarity + Similarity: **75%**
- Style Exaggeration: **15%** (slight enthusiasm)
- Speaker Boost: ON
- Model: **Multilingual v2** (paling natural untuk ID)

**Output format:** MP3 44.1kHz 192kbps

**Workflow:**
1. Buka elevenlabs.io → Speech Synthesis
2. Pilih voice (Antoni)
3. Paste chapter 1 VO, generate, download → `vo/chapter-01.mp3`
4. Ulangi untuk chapter 2-9
5. Quick check: durasi tiap MP3 mendekati target chapter (±2 detik
   masih OK)

---

## 13. HeyGen Lipsync Workflow

**Setup awal (sekali):**
1. Daftar di heygen.com
2. Tab "Avatars" → "Upload Photo" → upload character.png
3. Set name "Tutor Senopati"
4. Tunggu HeyGen training avatar (~2-5 menit)

**Per chapter:**
1. Klik "Create Video" → "Avatar Video"
2. Pilih avatar "Tutor Senopati"
3. Background: **Green Screen** (#00b140) — penting untuk chroma key
4. Aspect ratio: 1:1 (square — saya crop nanti)
5. Source audio: **Upload File** → pilih `vo/chapter-XX.mp3`
6. Klik "Submit" → wait ~2-3 menit
7. Download MP4 → save sebagai `lipsync/char-XX.mp4`

**Tips:**
- Quality preset: **Standard** cukup (Premium 2× lebih lama render,
  hampir tidak ada beda visible untuk PiP 300×300)
- Kalau ada chapter > 60 detik, split jadi 2 file (HeyGen free tier max
  1 menit per video; Creator plan max 5 menit)

**Total estimasi pemakaian:**
- ~10 video × 30-45 detik = ~6 menit total speaking time
- Cukup pakai **Creator plan 1 bulan ($29)** atau **free trial** kalau
  tolerate watermark (saya bisa crop watermark saat compose)

---

## 14. Folder Structure Final

```
scripts/video-walkthrough/
├── STORYBOARD.md                  # File ini
├── record.ts                      # Playwright recorder (saya tulis)
├── compose.py                     # Compositing script (saya tulis)
├── assets/
│   ├── character.png              # Anda upload (dari §11)
│   ├── logo-senopati.png          # Sudah ada di repo
│   └── intro-outro-bg.png         # Optional, saya generate
├── vo/
│   ├── chapter-01.mp3             # ElevenLabs output
│   ├── chapter-02.mp3
│   └── ...
├── lipsync/
│   ├── char-01.mp4                # HeyGen output, green screen
│   ├── char-02.mp4
│   └── ...
├── screen/
│   └── recording.webm             # Playwright auto-output
├── temp/                          # Working dir untuk compose stage
└── output/
    └── walkthrough-tutor-2026-05-12.mp4   # Final render
```

---

## 15. Estimasi Total Cost

| Item | Cost | Catatan |
|---|---|---|
| ElevenLabs Starter | ~$5 / Rp80k | Per bulan, atau pay-per-credit |
| HeyGen Creator | ~$29 / Rp450k | Per bulan, cancel setelah selesai |
| Image gen (DALL-E/MJ) | ~$0-5 | Free tier biasanya cukup, 1-3 generation |
| Compute (lokal) | $0 | Playwright + moviepy jalan di laptop Anda |
| **Total project** | **~$35 / Rp550k** | One-time, ~2 jam total kerja Anda |

---

## 16. Estimasi Timeline

| Stage | Saya | Anda |
|---|---|---|
| Storyboard review | — | 10 menit |
| Character generation | — | 15 menit (3-5 trial di MJ/DALL-E) |
| VO ElevenLabs | — | 30 menit (9 chapter @ ~3 menit/chapter) |
| Playwright recorder | 1-2 jam | — |
| HeyGen lipsync | — | 30-45 menit (queue + download) |
| Compositing script | 1-2 jam | — |
| Render final + revisi | 30 menit | — |
| **Total wallclock** | **~3-4 jam saya** | **~1.5-2 jam Anda** |

---

## 17. Open Questions sebelum mulai

- [ ] Apakah tutor demo (demo.tutor) punya **minimal 1 modul aktif**
      dengan sesi published untuk demo? (Saya akan cek)
- [ ] Apakah ada **live event aktif** yang bisa di-demo, atau saya buat
      seed event baru?
- [ ] Apakah Anda mau **background music**? Kalau ya, saya cari track
      royalty-free di Pixabay/YouTube Audio Library.
- [ ] Final video di-upload ke mana? YouTube, Drive, atau langsung di
      `asksenopati.com/onboarding-tutor`?

---

*Draft: 2026-05-12. Review lalu kasih tahu kalau ada chapter yang mau
diubah/tambah sebelum saya mulai Playwright + compose script.*
