# Storyboard — Video Walkthrough Tutor Senopati Academy

Target: **~8:00 menit MP4 1080p**, dual-layer (screen capture + character PiP),
audience tutor baru / tutor onboarding. Pemandu virtual: **Elsya**.

**Revisi 2026-05-16 (rev-2):** Chapter 1 diperpanjang (15 → 30 detik) untuk
perkenalan Elsya sebagai pemandu virtual. Cascade: timeline chapter 2-12
geser +15 detik.

**Revisi 2026-05-16:** Diperluas dari 9 → 12 chapter agar mencakup seluruh
menu sidebar tutor (Review Tugas/IELTS, Cerita Interaktif/Jeda, Pesan, Profil
Saya). Email demo diperbaiki: `tutor.demo@asksenopati.com` (sebelumnya salah
ketik `demo.tutor`).

Workflow ringkas:
1. Saya tulis storyboard ini → Anda review
2. Anda generate character PNG (prompt di §14) + VO ElevenLabs (§15) +
   lipsync HeyGen (§16)
3. Saya tulis Playwright recorder + compositing script
4. Render final MP4

---

## 0. Pre-flight Checklist (jalankan sekali sebelum recording)

Hasil verifikasi DB lokal per 2026-05-16:

| Check | Status | Aksi |
|---|---|---|
| Tutor demo (`tutor.demo@asksenopati.com`, Pak Reza Demo) | ✅ Ada | — |
| Siswa demo (`siswa.demo@asksenopati.com`, Alya Pertiwi) | ✅ Ada | — |
| Live event aktif (`Test Slide Sync In-Class`, module=`ai-prompts-101`) | ✅ Ada | Bisa langsung dipakai Chapter 10, atau seed event baru bertema "Demo Walkthrough" |
| `Course` rows untuk tutor demo | ⚠️ 0 | Tidak blocking — `/tutor/modul` baca dari `getMyTaughtModules()` (combine content.ts + DB stats per mentorSlug) |
| Schema drift (table `tutor_student_teachings`, kolom `courses.format` missing) | ⚠️ | Run `npx prisma migrate dev` sebelum recording supaya tidak ada UI error |

**Recording prep commands:**

```bash
# 1. Apply pending migrations
npx prisma migrate dev

# 2. (Opsional) seed module shell jika belum
npm run seed:modules-shell

# 3. Pastikan flag review aktif kalau mau demo Chapter 8
echo "NEXT_PUBLIC_REVIEW_ENABLED=true" >> .env.local

# 4. Start dev server
npm run dev
```

---

## 1. Spec Teknis

| Parameter | Nilai |
|---|---|
| Resolusi final | 1920×1080 (1080p) |
| FPS | 30 |
| Audio | 48kHz stereo, AAC 192kbps |
| Codec video | H.264 high profile |
| Container | MP4 |
| Durasi target | 7:45 — 8:15 menit |
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

## Chapter 1 — Pembuka & Perkenalan Elsya (30 detik)

**Durasi:** 0:00–0:30
**Mood:** Hangat, ramah, semangat
**Word count:** ~78 kata

**Action sequence (Playwright):**
- Tampilkan logo Senopati Academy fullscreen dengan fade-in 1s (0:00–0:03)
- Logo zoom-out, transisi ke landing page `https://asksenopati.com` (0:03–0:08)
- Hold landing page sambil Elsya memperkenalkan diri di PiP (0:08–0:22)
- Cursor hover sebentar di tombol "Masuk" (0:22–0:30)

**VO bahasa Indonesia:**

> Halo, Bapak dan Ibu Tutor! Selamat datang di Senopati Academy.
> Perkenalkan, saya Elsya, pemandu virtual Bapak Ibu hari ini. Saya akan
> menemani Anda berkeliling Senopati Academy, mengenal fitur-fitur penting
> yang akan jadi teman mengajar sehari-hari — dari dashboard tutor,
> mengelola modul Paham AI, hingga memimpin live session yang seru.
> Tenang, saya pelan-pelan saja kok. Yuk, kita mulai perjalanannya!

**Character expression:**
- 0:00–0:08: warm welcoming smile, slight wave dengan tangan kanan
- 0:08–0:12: hand-to-chest gesture saat menyebut "saya Elsya"
- 0:12–0:25: explaining gesture, tangan terbuka, sesekali angguk
- 0:25–0:30: smile + slight forward lean saat "Yuk, kita mulai perjalanannya"

**Visual cue:**
- Detik 0:08: title card "Walkthrough Tutor — Senopati Academy"
  fade-in di tengah
- Detik 0:10: subtitle kecil "Bersama Elsya, Pemandu Virtual Anda"
  muncul di bawah title card
- Detik 0:18: title card fade-out (hold ~8 detik supaya pembaca sempat baca)
- Detik 0:25: cursor pulse subtle di tombol "Masuk" sebagai cue untuk
  Chapter 2

---

## Chapter 2 — Login & Dashboard Tutor (30 detik)

**Durasi:** 0:30–1:00
**Word count:** ~75 kata

**Action sequence (Playwright):**
- Klik tombol "Masuk" → navigasi ke `/login`
- Type email `tutor.demo@asksenopati.com` (slow typing animation 80wpm)
- Type password (masked)
- Klik "Masuk" → redirect ke `/tutor` (dashboard)
- Pause 2 detik — biarkan VO mention bagian dashboard
- Cursor hover ke kartu "Modul aktif" (top), lalu ke "Thread terbaru"
- Hover ke greeting card di pojok kanan atas dengan nama "Pak Reza Demo"

**VO bahasa Indonesia:**

> Login dengan akun tutor Anda menggunakan email dan kata sandi yang
> diberikan tim Senopati. Setelah masuk, Bapak Ibu akan langsung tiba di
> dashboard tutor. Di sini ada ringkasan tugas hari ini: modul yang aktif,
> diskusi terbaru dari siswa, dan jadwal live session yang akan datang.
> Semua dirancang biar Bapak Ibu langsung tahu apa yang harus dikerjakan.

**Character expression:** Explaining, hand gesture pointing right (subtle
nod tiap kalimat baru).

**Visual cue:** Zoom-in 1.2x ke kartu modul aktif saat VO mention "modul
yang aktif" (detik 0:40-0:45). Zoom-out balik normal di akhir chapter.

---

## Chapter 3 — Tour Sidebar Navigation (30 detik)

**Durasi:** 1:00–1:30
**Word count:** ~70 kata

**Action sequence (Playwright):**
- Cursor pindah ke sidebar kiri
- Hover cepat berurutan (delay 1.8 detik per menu):
  1. Modul Saya
  2. Bahan Ajar
  3. Review Tugas (kalau `NEXT_PUBLIC_REVIEW_ENABLED=true`)
  4. Review IELTS Writing
  5. Live Session
  6. Pesan
  7. Siswa & Diskusi
  8. Materi & Soal
  9. Analitik
  10. Cerita Interaktif
  11. Profil Saya
- Cursor pulse setiap hover (lingkaran teal expand+fade)

**VO bahasa Indonesia:**

> Di sebelah kiri ada sebelas menu utama. Mulai dari Modul Saya, Bahan
> Ajar, Review Tugas, Live Session, Pesan, Siswa, Materi dan Soal,
> Analitik, Cerita Interaktif, sampai Profil. Saya akan jelaskan
> masing-masing satu per satu, jadi tenang aja kalau sekarang terasa
> banyak — kita akan tour lengkap di chapter berikutnya.

**Character expression:** Listing dengan gesture menunjuk ke kiri, light
smile reassuring di kalimat "tenang aja".

**Visual cue:** Subtle highlight (border teal 2px) muncul di menu yang
sedang di-hover, sync dengan VO.

---

## Chapter 4 — Program Paham AI Overview (45 detik)

**Durasi:** 1:30–2:15
**Word count:** ~115 kata

**Action sequence (Playwright):**
- Navigasi ke `/program/paham-ai` (halaman publik program — sumber
  kebenaran untuk struktur 5 modul + Jeda)
- Tampilkan hero: tagline "Cerdas, Etis, Aman", durasi "1 hari",
  badge "5 modul"
- Scroll ke section Kurikulum
- Hover berurutan kartu modul sesuai urutan workshop:
  1. **Jeda — Alya & Sinyal Sinyal Asing** (Pembuka, cerita interaktif, 75 min)
  2. **Modul 01: Introduction to AI** (Dasar, 60 min)
  3. **Modul 02: Ethical Use of AI** (Etika, 60 min)
  4. **Modul 22: AI Prompts 101** (Praktik / K-I-F-C, 90 min)
  5. **Modul 11: Fighting Hoax with AI** (Penutup / verifikasi 5C, 90 min)
- Scroll ke section Outcomes — hover salah satu poin

**VO bahasa Indonesia:**

> Program perdana kami namanya Paham AI — workshop intensif satu hari
> untuk siswa SMA dengan tagline "Cerdas, Etis, Aman". Pesertanya
> berkumpul dari pagi sampai sore, belajar tatap muka langsung. Total
> ada lima sesi terkurasi: dibuka dengan cerita interaktif Jeda yang
> membangun emotional anchor lewat kisah Alya dan keluarganya, lalu
> empat modul akademis — Introduction to AI sebagai dasar, Ethical Use
> of AI untuk etika, AI Prompts 101 untuk praktik dengan kerangka
> K-I-F-C, dan ditutup Fighting Hoax with AI untuk literasi digital.
> Tugas tutor di Paham AI adalah memandu seluruh rangkaian live tatap
> muka, memimpin diskusi, dan memastikan setiap siswa keluar workshop
> dengan bekal yang konkret.

**Character expression:** Engaged, explaining, hand gesture menggambar
arc (open hand → forward sweep) saat menyebut sequence Jeda → 4 modul.
Slight nod tiap nama modul disebut.

**Visual cue:**
- Detik 1:35: zoom 1.3x ke stat "5 modul · Jeda + 4 modul akademis" di hero
- Detik 1:50: zoom 1.4x ke kartu Jeda saat VO mention "dibuka dengan
  cerita interaktif Jeda" — tegaskan ini akan dibahas lagi di Chapter 11
- Detik 2:05: zoom 1.5x ke section Kurikulum yang menampilkan 4 kartu
  modul akademis dalam grid

---

## Chapter 5 — Modul Saya: Kelola Sesi (50 detik)

**Durasi:** 2:15–3:05
**Word count:** ~120 kata

**Action sequence (Playwright):**
- Balik ke `/tutor/modul`
- Hover stat strip di atas: total siswa, pending reviews, unread threads,
  avg completion (biarkan VO baca angkanya)
- Klik salah satu kartu modul → masuk ke detail
- Tab "Sesi" — list session muncul
- Klik 1 sesi → buka detail editor
- Highlight tombol "Tambah Materi" + "Tambah Kuis"
- Hover ke status badge (draft/published)
- Klik "Terbitkan" untuk demo state change (atau revert kalau modul live)
- Balik ke list, perlihatkan badge berubah dari "Draft" ke "Published"

**VO bahasa Indonesia:**

> Di menu Modul Saya, Bapak Ibu bisa lihat semua modul yang Anda ampu,
> lengkap dengan statistik: berapa siswa yang aktif, tugas yang menunggu
> review, dan thread diskusi yang belum dibaca. Klik salah satu modul
> untuk masuk ke editor sesi. Di sini Anda bisa tambah materi bacaan,
> sisipkan kuis di tengah pelajaran, dan atur urutan sesi. Status
> "Draft" artinya siswa belum lihat — aman buat eksperimen. Klik
> "Terbitkan" kalau materinya sudah siap.

**Character expression:** Demonstrating, occasional point-down gesture.

**Visual cue:**
- Detik 2:25: zoom 1.3x ke stat strip (4 angka)
- Detik 2:45: cursor pulse pada tombol "Tambah Materi"
- Detik 3:00: zoom 1.4x ke status badge "Draft" → "Published"

---

## Chapter 6 — Bahan Ajar: File & Versioning (30 detik)

**Durasi:** 3:05–3:35
**Word count:** ~75 kata

**Action sequence (Playwright):**
- Klik "Bahan Ajar" di sidebar → `/tutor/bahan-ajar`
- List bahan ajar yang sudah diupload muncul (PDF/PPT cards)
- Klik tombol "Upload Bahan Baru" → modal dengan dropzone
- Hover salah satu kartu existing → tampilkan tombol "Versi" + "Tautkan ke Sesi"
- Klik "Versi" → tampilkan history versioning (v1, v2, v3 dengan timestamp)
- Close modal

**VO bahasa Indonesia:**

> Menu Bahan Ajar adalah pusat penyimpanan semua slide, PDF, dan handout
> yang Anda pakai mengajar. Upload sekali, pakai berkali-kali di banyak
> modul. Setiap kali Anda upload versi baru, sistem otomatis simpan
> riwayatnya — jadi kalau perlu balik ke versi sebelumnya, tinggal klik.

**Character expression:** Demonstrating, gesture upload (lift hand
upward).

**Visual cue:** Detik 3:20 zoom 1.4x ke version history list.

---

## Chapter 7 — Materi & Soal: Bikin Kuis (40 detik)

**Durasi:** 3:35–4:15
**Word count:** ~95 kata

**Action sequence (Playwright):**
- Klik "Materi & Soal" → `/tutor/materi`
- Tampilkan list bank soal yang sudah ada
- Klik "Buat Soal Baru" → `/tutor/materi/baru`
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

**Visual cue:** Detik 3:50 zoom 1.5x ke dropdown "Tipe" memperlihatkan
4 opsi.

---

## Chapter 8 — Review Tugas & IELTS Writing (45 detik)

**Durasi:** 4:15–5:00
**Word count:** ~110 kata

> ⚠️ Conditional: chapter ini hanya direkam kalau
> `NEXT_PUBLIC_REVIEW_ENABLED=true`. Kalau env disable, skip chapter ini
> dan total video jadi ~6:45.

**Action sequence (Playwright):**

**Phase 8A — Review Tugas umum (0-20 detik):**
- Klik "Review Tugas" → `/tutor/review`
- List submission menunggu review (badge "Belum dinilai")
- Klik 1 submission → `/tutor/review/[id]`
- Tampilkan jawaban siswa + form rubric + field feedback
- Demo ketik feedback singkat, set skor

**Phase 8B — IELTS Writing (20-45 detik):**
- Klik "Review IELTS Writing" → `/tutor/review/writing`
- Tampilkan list essay IELTS dari siswa
- Klik 1 essay → tampilkan editor side-by-side (essay siswa + rubric IELTS)
- Highlight band score selectors (Task Achievement, Coherence, Lexical
  Resource, Grammar)

**VO bahasa Indonesia:**

> Setelah siswa mengumpulkan tugas atau kuis terbuka, mereka muncul di
> menu Review Tugas — siap Bapak Ibu nilai. Klik tugas, baca jawaban
> siswa, isi rubric, dan tulis feedback. Khusus untuk persiapan IELTS,
> ada menu terpisah Review IELTS Writing dengan rubric resmi IELTS:
> empat dimensi penilaian — Task Achievement, Coherence, Lexical Resource,
> dan Grammatical Range — masing-masing dengan band score sembilan poin.

**Character expression:** Attentive, occasional "checking" gesture (head
slight tilt + hand move horizontally).

**Visual cue:**
- Detik 4:30: zoom 1.4x ke field rubric scorecard
- Detik 4:50: zoom 1.5x ke 4 band score dimensions di IELTS form

---

## Chapter 9 — Siswa & Diskusi: Pantau Siswa (45 detik)

**Durasi:** 5:00–5:45
**Word count:** ~110 kata

**Action sequence (Playwright):**
- Klik "Siswa & Diskusi" → `/tutor/siswa`
- List siswa muncul (dengan progress bar per siswa)
- Klik siswa "Alya Pertiwi" (`siswa.demo@asksenopati.com`)
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
- Detik 5:25: zoom 1.4x ke section "Eksplorasi Karir" memperlihatkan
  Holland Code + top match
- Detik 5:35: cursor pulse ke tombol "Download CV PDF"

---

## Chapter 10 — Live Session: Schedule & Pelaksanaan (75 detik)

**Durasi:** 5:45–7:00
**Word count:** ~175 kata

**Action sequence (Playwright):**

**Phase 10A — Schedule (0-20 detik):**
- Klik "Live Session" → `/tutor/live`
- Klik "Jadwalkan Live Baru"
- Isi form: judul "Demo Live Session", pilih modul, set tanggal+jam,
  pilih tipe "Workshop"
- Klik "Jadwalkan" → kembali ke list, event baru muncul

**Phase 10B — Pelaksanaan (20-55 detik):**
- Klik event "Test Slide Sync In-Class" (yang sudah live di seed) atau
  event yang baru saja dibuat → buka room presenter `/tutor/live/[id]`
- Tampilkan layout: slide canvas tengah, side panel kanan, status bar atas
- Klik "Upload Slide" → demo cepat upload PDF (atau skip ke event yang
  sudah punya slide)
- Klik navigasi slide (next/prev)
- Klik tombol "Push Quiz" → modal muncul, pilih kuis pretest, klik "Kirim"
- Tampilkan badge "Quiz aktif, 0/3 jawab"
- Side panel kanan: tab Chat, ketik pesan demo "Halo semua, selamat datang"
- Tab Q&A: tampilkan list pertanyaan dari siswa

**Phase 10C — End (55-75 detik):**
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
- Phase 10A: explaining, scheduling gesture
- Phase 10B: animated, more engaged, occasional point-forward
- Phase 10C: relaxed, satisfied closing

**Visual cue:**
- Detik 6:05: zoom 1.4x ke field "Tipe Sesi" memperlihatkan 3 opsi
- Detik 6:30: zoom 1.5x ke tombol "Push Quiz" yang berkedip
- Detik 6:45: zoom 1.3x ke side panel "Chat + Q&A"
- Detik 6:57: fade flash putih saat "Akhiri Sesi" — transisi mood

---

## Chapter 11 — Cerita Interaktif (Jeda) (35 detik)

**Durasi:** 7:00–7:35
**Word count:** ~85 kata

**Action sequence (Playwright):**
- Klik "Cerita Interaktif" di sidebar → `/tutor/cerita`
- Tampilkan list cerita yang tersedia — sorot **"Jeda — Alya & Sinyal
  Sinyal Asing"** (yang Elsya sebut di Chapter 4 sebagai pembuka Paham AI)
- Klik cerita Jeda → editor scene
- Tampilkan visual: scene graph (node/branch), preview scene aktif,
  panel pilihan
- Hover salah satu choice node → tampilkan emotion tag + next-scene route
- Klik tombol "Preview" — tampilkan scene player di modal kecil

**VO bahasa Indonesia:**

> Cerita Interaktif adalah fitur khas Senopati Academy — dan kalau
> Bapak Ibu masih ingat dari awal tadi, Jeda yang jadi pembuka workshop
> Paham AI dikelola dari sini. Lewat menu ini, Anda bisa lihat dan
> kelola cerita bercabang yang membantu siswa belajar dengan cara
> naratif: siswa membuat pilihan, dan ceritanya berkembang sesuai
> keputusan mereka. Cocok untuk mengajar empati, pengambilan keputusan,
> dan literasi digital.

**Character expression:** Curious, slight excited tone — gesture "open
book" (palms facing up).

**Visual cue:**
- Detik 7:10: zoom 1.4x ke scene graph (branch visualization)
- Detik 7:25: zoom 1.3x ke choice node yang sedang di-hover

---

## Chapter 12 — Pesan, Analitik, Profil & Penutup (40 detik)

**Durasi:** 7:35–8:15
**Word count:** ~95 kata

**Action sequence (Playwright):**

**Phase 12A — Pesan (0-10 detik):**
- Klik "Pesan" di sidebar → `/pesan`
- Tampilkan list thread DM dengan siswa
- Hover salah satu thread (preview nama + last message)

**Phase 12B — Analitik (10-20 detik):**
- Klik "Analitik" → `/tutor/analitik`
- Tampilkan dashboard: scorecard per siswa, completion rate per modul,
  rata-rata band score IELTS (kalau relevan)
- Scroll, hover beberapa kartu metric

**Phase 12C — Profil (20-30 detik):**
- Klik "Profil Saya" → `/tutor/profil`
- Tampilkan halaman profil: foto, bio, expertise, mentorSlug,
  scorecard tutor
- Highlight tombol "Edit Profil"

**Phase 12D — Penutup (30-40 detik):**
- Fade-out ke logo Senopati Academy dengan tagline

**VO bahasa Indonesia:**

> Untuk komunikasi privat dengan siswa, gunakan menu Pesan. Sementara
> menu Analitik kasih Bapak Ibu gambaran besar performa siswa dan modul
> yang Anda ampu. Profil Saya untuk update foto, bio, dan keahlian Anda.
> Itu tour fitur tutor Senopati Academy. Kalau butuh bantuan, hubungi
> tim support kami di halo@asksenopati.com. Selamat mengajar dan terima
> kasih sudah jadi bagian dari Senopati!

**Character expression:** Warm closing smile, slight wave at end.

**Visual cue:**
- Detik 8:05: fade-in logo Senopati, tagline "Mengajar lebih mudah,
  belajar lebih bermakna"
- Detik 8:13: hold logo, fade to black

---

## 13. Subtitle SRT — Generated Otomatis

Saya generate `subtitle.srt` dari VO script + timestamp chapter. Format
WebVTT-compatible, font: Inter Bold 28px, color white dengan outline 2px
hitam, position bottom margin 80px.

---

## 14. Character Generation Prompts (untuk DALL-E / Midjourney / SDXL)

> **Catatan persona:** Karakter ini muncul sebagai **Elsya**, pemandu
> virtual perempuan. Karena namanya feminin, sesuaikan prompt: ganti
> "young teacher" jadi "young female teacher / female educator" dan
> sebutkan rambut sebahu atau panjang yang dirapikan, tanpa beard
> (relevan untuk Style C). Style A & B di bawah saya update agar
> default-nya female; kalau Anda mau opsi laki-laki, tinggal swap
> kata kunci "female" → "male" di prompt.

### Style A — Friendly Modern Teacher (Recommended)

```
Friendly Indonesian young female teacher character named Elsya, 26 years
old, warm smile, wearing smart casual outfit: teal blazer (color #18C29C)
over white blouse, shoulder-length neat black hair, kind expressive eyes,
medium shot from chest up, slight three-quarter angle, looking at camera,
clean studio lighting, neutral cream background (or transparent PNG),
digital illustration style with subtle gradient shading, approachable
and professional, suitable for educational mascot. High detail face,
clear mouth area for lipsync. 1024x1024, centered composition.
```

### Style B — Anime / Pixar Stylized

```
Pixar-style 3D character of a young Indonesian female teacher named
Elsya, warm friendly smile, wearing a teal blazer (#18C29C) with
Senopati Academy logo pin, slight tan skin tone, expressive dark eyes,
shoulder-length neat black hair, medium shot from chest up, looking
forward, soft cinematic lighting, isolated on solid green chromakey
background (#00b140), 3D render highly polished, cute and approachable,
designed for educational content. 1024x1024.
```

### Style C — Flat Illustration / Cartoon

```
Flat vector illustration of an Indonesian female teacher character
named Elsya, modern geometric style, friendly smile, simple shapes,
teal color palette (#18C29C primary, #0f9d7c secondary), wearing
collared blouse or blazer, shoulder-length hair, medium shot bust
portrait, clean white or transparent background, design for animated
mascot use, large clear mouth and eyes for animation, behance /
dribbble quality, 1024x1024 PNG.
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

Simpan di: `scripts/video-walkthrough/assets/character.png`

---

## 15. ElevenLabs VO Setting

**Voice yang direkomendasikan untuk bahasa Indonesia** (Elsya = persona
perempuan, jadi default ke voice wanita):

| Voice | Karakter | Use case |
|---|---|---|
| **Charlotte** (multilingual) | Wanita muda, hangat, friendly | Recommended utama — match Elsya |
| **Sarah** (multilingual) | Wanita muda, soft, clear | Alternatif Charlotte |
| **Custom clone** | Voice Anda sendiri | Kalau punya budget + waktu setup |
| **Antoni** / **Bill** | Pria muda / dewasa | Kalau ingin swap persona ke karakter laki-laki |

**Setting:**
- Stability: **45%** (cukup variasi untuk natural, tidak monoton)
- Clarity + Similarity: **75%**
- Style Exaggeration: **15%** (slight enthusiasm)
- Speaker Boost: ON
- Model: **Multilingual v2** (paling natural untuk ID)

**Output format:** MP3 44.1kHz 192kbps

**Workflow:**
1. Buka elevenlabs.io → Speech Synthesis
2. Pilih voice (Charlotte)
3. Paste chapter 1 VO, generate, download → `vo/chapter-01.mp3`
4. Ulangi untuk chapter 2-12 (12 file total)
5. Quick check: durasi tiap MP3 mendekati target chapter (±2 detik
   masih OK)

---

## 16. HeyGen Lipsync Workflow

**Setup awal (sekali):**
1. Daftar di heygen.com
2. Tab "Avatars" → "Upload Photo" → upload character.png
3. Set name "Elsya — Pemandu Senopati"
4. Tunggu HeyGen training avatar (~2-5 menit)

**Per chapter:**
1. Klik "Create Video" → "Avatar Video"
2. Pilih avatar "Elsya — Pemandu Senopati"
3. Background: **Green Screen** (#00b140) — penting untuk chroma key
4. Aspect ratio: 1:1 (square — saya crop nanti)
5. Source audio: **Upload File** → pilih `vo/chapter-XX.mp3`
6. Klik "Submit" → wait ~2-3 menit
7. Download MP4 → save sebagai `lipsync/char-XX.mp4`

**Tips:**
- Quality preset: **Standard** cukup (Premium 2× lebih lama render,
  hampir tidak ada beda visible untuk PiP 300×300)
- Kalau ada chapter > 60 detik (Chapter 10 = 75 detik), split jadi 2
  file (HeyGen free tier max 1 menit per video; Creator plan max 5 menit)

**Total estimasi pemakaian:**
- ~13 video × 30-45 detik = ~7:30 menit total speaking time
- Cukup pakai **Creator plan 1 bulan ($29)** atau **free trial** kalau
  tolerate watermark (saya bisa crop watermark saat compose)

---

## 17. Folder Structure Final

```
scripts/video-walkthrough/
├── STORYBOARD.md                  # (mirror dari docs/video-walkthrough-tutor/)
├── record.ts                      # Playwright recorder (saya tulis)
├── compose.py                     # Compositing script (saya tulis)
├── assets/
│   ├── character.png              # Anda upload (dari §14)
│   ├── logo-senopati.png          # Sudah ada di repo
│   └── intro-outro-bg.png         # Optional, saya generate
├── vo/
│   ├── chapter-01.mp3             # ElevenLabs output
│   ├── chapter-02.mp3
│   └── ...                        # 12 files (atau 11 kalau Ch.8 di-skip)
├── lipsync/
│   ├── char-01.mp4                # HeyGen output, green screen
│   ├── char-02.mp4
│   └── ...
├── screen/
│   └── recording.webm             # Playwright auto-output
├── temp/                          # Working dir untuk compose stage
└── output/
    └── walkthrough-tutor-2026-05-16.mp4   # Final render
```

---

## 18. Estimasi Total Cost

| Item | Cost | Catatan |
|---|---|---|
| ElevenLabs Starter | ~$5 / Rp80k | Per bulan, atau pay-per-credit |
| HeyGen Creator | ~$29 / Rp450k | Per bulan, cancel setelah selesai |
| Image gen (DALL-E/MJ) | ~$0-5 | Free tier biasanya cukup, 1-3 generation |
| Compute (lokal) | $0 | Playwright + moviepy jalan di laptop Anda |
| **Total project** | **~$35 / Rp550k** | One-time, ~2 jam total kerja Anda |

---

## 19. Estimasi Timeline

| Stage | Saya | Anda |
|---|---|---|
| Storyboard review | — | 10 menit |
| Character generation | — | 15 menit (3-5 trial di MJ/DALL-E) |
| VO ElevenLabs (12 chapter) | — | 45 menit |
| Playwright recorder | 2-3 jam | — |
| HeyGen lipsync (12 video) | — | 45-60 menit (queue + download) |
| Compositing script | 1-2 jam | — |
| Render final + revisi | 30 menit | — |
| **Total wallclock** | **~4-5 jam saya** | **~2-2.5 jam Anda** |

---

## 20. Open Questions sebelum mulai

- [ ] Konfirmasi: rekam dengan `NEXT_PUBLIC_REVIEW_ENABLED=true` (sertakan
      Chapter 8) atau tanpa (skip Chapter 8 → durasi 6:45)?
- [ ] Pakai event existing `"Test Slide Sync In-Class"` untuk Chapter 10
      Phase B, atau saya bikin seed event baru bertema "Demo Walkthrough"?
- [ ] Apakah Anda mau **background music**? Kalau ya, saya cari track
      royalty-free di Pixabay/YouTube Audio Library.
- [ ] Final video di-upload ke mana? YouTube, Drive, atau langsung di
      `asksenopati.com/onboarding-tutor`?
- [ ] Untuk Chapter 11 (Cerita Interaktif): demo cerita Jeda yang sudah
      ada di seed, atau cerita lain?

---

*Draft revisi: 2026-05-16. Review lalu kasih tahu kalau ada chapter yang
mau diubah/tambah sebelum saya mulai Playwright + compose script.*
