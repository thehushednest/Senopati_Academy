# Report Pengembangan — 9 Mei 2026 (Addendum)

Tanggal: **2026-05-09 (lanjutan)** · Lingkup: post-Phase 12 — IA refactor mobile,
ekspansi besar fitur karir (eksplorasi RIASEC, beasiswa, kerja, CV builder,
application tracker), sistem scraping otomatis, dan integrasi cross-role
admin/tutor.

> Lanjutan dari `REPORT_2026-05-09.md` (Phase 4-12 mobile rewrite). Sesi ini
> shifts dari "build mobile platform" ke "build career discovery platform"
> di atasnya.

---

## 1. Highlights

| Area | Output |
|---|---|
| **IA refactor mobile** | Tab bar siswa direstrukturisasi: 5 tab (Beranda · Belajar · Live · Pesan · Profil). Tab "Belajar" jadi hub grid 4 card (Modul, Cerita, Lab AI, Pustaka). Sertifikat dipindah ke Profil "Pencapaian". Beranda dapat header icon Cari + Notif dengan badge unread. Tutor side unchanged. |
| **Eksplorasi Karir (Beasiswa & Jurusan Finder)** | Quiz RIASEC 18 soal → Holland code + match top 5 jurusan via cosine similarity. **30 jurusan + 28 beasiswa** seeded (Indonesia + LN). 9 deep guide per beasiswa (timeline + dokumen + tips essay + FAQ + channel verifikasi). 6 panduan umum (motivation letter, study plan, TOEFL/IELTS, surat rekomendasi, wawancara, legalisir/Apostille). |
| **Cari Kerja end-to-end** | **18 jalur kerja** (4 domestik + 14 LN: SSW Jepang, IM Japan, EPA, EPS Korea, Taiwan, HK, SG, MY, Triple Win Jerman, PALM Australia, Cruise, UAE, Qatar, Saudi sektor formal). 12 jalur punya **deep guide 8 section**: timeline + dokumen + biaya + ujian + safety/anti-calo + hak pekerja + FAQ + channel verifikasi. 6 artikel panduan kerja umum (CV ATS, hindari calo, wawancara, JLPT N4, hak PMI UU 18/2017, magang vs kerja vs kuliah). |
| **CV Builder bilingual + 3 templates + PDF** | Form mobile + web dengan section editor (header, ringkasan, pengalaman, pendidikan, skills, sertifikat). 3 template visual: ATS Simple (default), Modern Accent (hospitality/sales), Classic Formal (corporate/BUMN). Bilingual ID/EN heading otomatis. Export PDF via @react-pdf/renderer (A4 portrait, ATS-friendly). |
| **Application Tracker** | Per-user CRUD lamaran kerja: title, company, source (BKK/Jobstreet/LinkedIn/dll), status (applied/screening/interview/offer/rejected), follow-up date, interview schedule, notes. Mobile + web. |
| **Job Board Directory** | 13 portal terkurasi (4 pemerintah/SMK + 3 LN G2G + 6 swasta) — Karirhub Kemnaker, BKK SMK, RBB BUMN, MBKM, BP2MI, EPS Korea, IM Japan, Jobstreet, LinkedIn, Glints, dll. Per portal: target audience, pricing badge, tip taktis, verified-by badge. |
| **Periodic Scraping System** | Brave Search → Apify (website-content-crawler) → Claude API (Sonnet 4.6 + Zod schema + 1-hour prompt cache) → Prisma upsert. **Admin-managed source CRUD** di `/admin/scrape` — add/edit/toggle/run-now. Cron endpoint dengan freq daily/weekly/monthly. ScrapeRun audit log dengan token usage + cache hit ratio. |
| **Cross-role karir integration** | `StudentCareerSection` component shared yang inject ke `/admin/siswa/[id]` (full access) & `/tutor/siswa/[id]` (canAccessStudent guard). Tutor lihat RIASEC profile, CV summary + download PDF, tracker lamaran siswanya — untuk kasih bantuan & masukan. |
| **GLM-4.6 IQ2_S local setup** | 95 GB GGUF (3 split shards) ke-merge via llama-gguf-split build dari source → 1 file 95 GB → register Ollama (101 GB blob). Smoke test prompt coding sukses. Performance ~2-3 tok/s di DGX Spark GB10 unified memory 119 GB. |

---

## 2. IA Refactor Mobile

### 2.1 Sebelum vs Sesudah

| | Sebelum | Sesudah |
|---|---|---|
| Tab siswa | Beranda · Modul · Live · Pesan · Profil | Beranda · **Belajar** · Live · Pesan · Profil |
| Tab "Modul" | Tab top-level | Hilang dari tab bar; tetap routable via `/(tabs)/modul` |
| Hub baru | — | `app/(tabs)/belajar.tsx` — grid 2x2 (Modul, Cerita, Lab AI, Pustaka) |
| Sertifikat | Tersebar | Profil → "Pencapaian" → "Sertifikat saya" + "Eksplorasi karir" + "Skor" |
| Beranda header | QuickTile row 4 button | 2 icon button kanan-atas: 🔍 Cari + 🔔 Notif (badge unread merah) |

### 2.2 Reasoning di balik perubahan

**Frequency-driven**: Modul dipakai harian → tetap accessible 1 tap via Beranda "Lanjutkan belajar". Cerita/Lab/Pustaka dipakai sesekali → masuk hub. Sertifikat reward-checking (bulanan) → masuk Profil bersama identity items.

**Live tetap top-level**: time-sensitive (T-15min reminder, "mulai 5 menit lagi") — tidak boleh disembunyikan ke hub.

---

## 3. Eksplorasi Karir — Beasiswa & Jurusan Finder

### 3.1 Quiz RIASEC

18 soal Likert 1-5, 3 soal per dimensi (R/I/A/S/E/C). Skor per dimensi normalisasi 0-100. Holland code = top 3 dimensi sorted descending (mis. "SIA").

**Algoritma matching**: cosine similarity user vector [R,I,A,S,E,C] vs major tag vector. Top 5 jurusan dengan match%.

### 3.2 Database

**30 jurusan** (15 Saintek + 15 Soshum):
- Saintek: Kedokteran, Teknik Informatika, Teknik Elektro, Mesin, Sipil, Kimia, Farmasi, Biologi, Matematika, Statistika, Arsitektur, Teknik Industri, Pertanian, Kedokteran Gigi, Keperawatan
- Soshum: Hukum, Akuntansi, Manajemen, Ilmu Ekonomi, HI, Komunikasi, Sastra Inggris, Psikologi, Sosiologi, Pendidikan B. Inggris, Antropologi, Sejarah, DKV, Pariwisata, Bimbingan Konseling

Tiap jurusan: tag vector 6-dim (RIASEC) + summary + prospek karir + kampus rekomendasi.

**28 beasiswa**:
- Indonesia (10): KIP-K, BIM, Tanoto TELADAN, Djarum Plus, BCA, BRI, Mandiri, PPA, BAZNAS, BUMN Untuk Negeri, KSE, Pertamina, Hadji Kalla, OSC Medcom, Sampoerna
- Luar Negeri (18): **LPDP Reguler**, Chevening (UK), Australia Awards, DAAD (Jerman), Fulbright (AS), Erasmus Mundus, CSC China, A*STAR Singapore, Mitsui Bussan (Jepang), Ajinomoto (Jepang), KGSP Korea, MEXT Jepang, Türkiye Bursları

### 3.3 Deep guide (9 dari 28)

Tiap deep guide punya 5 section: Timeline pendaftaran (5-7 fase), Tips menulis essay (3-7 tips), Checklist dokumen (5-9 item dengan note), Tips wawancara (4-6 tips), FAQ (3-5 Q&A accordion). Yang dibuat: KIP-Kuliah, Tanoto TELADAN, LPDP, Chevening, Australia Awards, Djarum Plus, MEXT, KGSP, CSC.

### 3.4 6 Panduan Umum

Dengan render block-based (h2/h3/p/ul/ol/callout/quote — bukan markdown):
1. Cara Menulis Motivation Letter (7 menit baca)
2. Menulis Study Plan / Research Proposal (8 menit)
3. Persiapan TOEFL/IELTS dari Nol (6 menit)
4. Cara Mendapat Surat Rekomendasi (5 menit)
5. Tips Wawancara Beasiswa — 10 pertanyaan klasik (8 menit)
6. Legalisir, Apostille, dan Terjemahan Tersumpah (6 menit)

### 3.5 Schema baru

| Model | Fields |
|---|---|
| `Major` | slug, name, category, summary, careerOutlook (\| sep), topSchools, tagR/I/A/S/E/C (Int 0-100) |
| `Scholarship` | slug, name, provider, summary, coverage, level (s1/s2/s3), country, deadlineAt, applicationUrl, requirements |
| `ScholarshipMajor` | many-to-many — kosong = berlaku semua jurusan |
| `ScholarshipGuide` | 1:1 ke Scholarship — timeline/essayTips/documents/interviewTips/faqs (JSON) |
| `GuideArticle` | slug, title, category, summary, blocksJson (structured), readMinutes |
| `CareerProfile` | studentId @id, scoreR/I/A/S/E/C, hollandCode, computedAt |

### 3.6 Mobile + Web parity

**Mobile** (`app/karir/`): index (entry + bar chart + top 5), quiz, jurusan/[slug], beasiswa list+detail, panduan list+detail.

**Web** (`/karir/`): mirror 7 page dengan PremiumPageHero + DashboardSidebar layout.

---

## 4. Cari Kerja End-to-End

### 4.1 18 Jalur kerja

**Domestik (4)**: SMK BKK + magang industri, Magang Merdeka MBKM, Job Board Fresh Grad, BUMN Management Trainee.

**Luar Negeri (14)**: SSW Jepang (Tokutei Ginou 14 sektor), IM Japan magang G2G, EPA Jepang Perawat, EPS-TOPIK Korea, G2G Taiwan, PMI Hong Kong (FDH), PMI Singapura, PMI Malaysia, **Triple Win Jerman** (perawat €2,800-3,500), **PALM Australia** (AUD 24-30/jam), **Cruise Internasional**, **PMI UAE Dubai/Abu Dhabi**, **PMI Qatar Doha**, **PMI Saudi Sektor Formal** (PRT moratorium).

### 4.2 Deep guide (12 of 18)

8-section guide tiap jalur priority:
1. Timeline pendaftaran (5-7 fase)
2. Checklist dokumen (5-10 item)
3. **Estimasi biaya transparan** dengan baris "TOTAL realistic" + warning kalau ada calo minta lebih
4. Tips persiapan ujian (JLPT/EPS-TOPIK/B1 Jerman/dll)
5. **Safety & anti-calo** (red flags + hindari trafficking)
6. Hak pekerja (UU 18/2017 + hukum negara penempatan + kafala reform)
7. FAQ accordion (3-7 Q&A)
8. Channel verifikasi (link ke BP2MI SISKOTKLN, embassy, Kemnaker)

Yang dibuat: SSW Jepang, IM Japan, EPS-TOPIK, Triple Win, PALM, Taiwan, Hong Kong, SMK BKK, Magang Merdeka, UAE, Qatar, Saudi.

### 4.3 6 Panduan kerja

CV ATS-friendly · Hindari calo & verifikasi P3MI · Wawancara kerja pertama (12 pertanyaan klasik + STAR) · Persiapan JLPT N4 · Hak PMI UU 18/2017 (9 kontak emergency: BP2MI, Migrant CARE, SBMI, KBRI 7 negara) · Magang vs Kerja vs Kuliah Setelah SMK.

### 4.4 Anti-fraud Layer (penting)

- 🚨 Disclaimer merah prominent di entry `/karir/kerja` dengan tombol langsung ke siskotkln.bp2mi.go.id
- Anti-calo banner di tiap detail jalur LN
- Estimasi biaya transparent: "TOTAL realistic Rp X — kalau diminta >Rp Y = calo"
- Channel verifikasi dengan badge "Verified by [Pemerintah RI/Jepang/Korea/dll]"
- 9 kontak emergency di artikel hak PMI

### 4.5 Schema baru

`JobPathway`, `JobPathwayGuide` (1:1, timeline/documents/costs/examPrep/safetyTips/rights/faqs/verifiedChannels JSON), `JobArticle`.

### 4.6 Mobile + Web

**Mobile**: `/karir/kerja` (entry hub) → list jalur, detail jalur (full 8 section), list panduan, detail panduan.

**Web**: `/karir/kerja/` mirror 5 page dengan layout dashboard.

---

## 5. CV Builder

### 5.1 3 Template

| Template | Visual | Best for |
|---|---|---|
| **ATS Simple** | Single column, Helvetica, top accent strip teal, section heading uppercase | Default — paling aman untuk job board besar (Jobstreet/LinkedIn) |
| **Modern Accent** | Header full-width teal dengan name putih besar, accent bar per section, ▸ bullet | Hospitality, sales, marketing, creative roles |
| **Classic Formal** | Times-Roman, border + center-aligned name, double divider per section | Corporate, banking, BUMN, government |

### 5.2 Bilingual

Heading section auto-switch ID ↔ EN:
- ID: Ringkasan / Pengalaman / Pendidikan / Keahlian / Sertifikat / Sekarang
- EN: Profile / Experience / Education / Skills / Certifications / Present

### 5.3 PDF Export

Pakai `@react-pdf/renderer` — A4 portrait, ATS-friendly text extraction. Endpoint:
- `/api/student/career/cv/pdf` — download CV sendiri
- `/api/admin/student/[id]/cv-pdf` — admin
- `/api/tutor/student/[id]/cv-pdf` — tutor (with canAccessStudent guard)

### 5.4 Schema

`CVProfile`: 1:1 user, structured fields + `experiencesJson`/`educationJson`/`skillsJson`/`certificationsJson` JSON arrays + `language` + `templateId`.

### 5.5 UI

**Mobile** (`/karir/cv`): scroll form dengan section editor + dynamic add/remove items + preview real-time + tombol Save & Download PDF (web-bridge).

**Web** (`/karir/cv`): split layout 2-kolom (editor kiri, preview sticky kanan), responsive 1-kolom < 900px. Direct PDF download via anchor (cookie session aktif).

---

## 6. Application Tracker

### 6.1 Schema

`JobApplication`: per user, N rows. Fields: title, company, source (8 enum: BKK/Jobstreet/LinkedIn/Glints/P3MI/Direct/Referensi/Lainnya), jobUrl, pathwaySlug (optional link), status (applied/screening/interview/offer/rejected/withdrawn), location, salaryNote, appliedAt, followUpAt, interviewAt, notes.

### 6.2 Endpoints

GET (list per user), POST (create), PATCH (update), DELETE (owner-check di server).

### 6.3 UI

Mobile + web: list grouped Active vs Selesai, status badge color-coded, chip Follow-up & Interview date kalau ada. Form add/edit dengan chip selector untuk source dan status, validation client-side, hapus dengan confirm.

---

## 7. Job Board Directory

13 portal terkurasi sebagai static data (no DB — content stable):

**Pemerintah & SMK**: Karirhub Kemnaker SIAPKERJA (verified Pemerintah RI), BKK SMK Kemdikbud, Rekrutmen Bersama BUMN (RBB), Kampus Merdeka MBKM.

**Luar Negeri G2G Resmi**: BP2MI SISKOTKLN, EPS-TOPIK Korea, IM Japan.

**Swasta**: Jobstreet, LinkedIn, Glints, Kalibrr, Karir.com, JobsDB.

Tiap portal: target audience + deskripsi + pricing badge (Gratis/Freemium/Paid) + tip taktis spesifik + verified-by badge.

Disclaimer di top: "Mulai dari portal pemerintah dulu — paling aman & gratis. LN hanya via G2G resmi."

---

## 8. Periodic Scraping System

### 8.1 Pipeline

```
Brave Search (URL discovery)
   ↓
Apify website-content-crawler (full content + JS rendering)
   ↓
Claude API (Sonnet 4.6 + Zod schema validation + 1-hour prompt cache)
   ↓
Prisma upsert ke Scholarship/JobPathway
   ↓
ScrapeRun audit log
```

### 8.2 Best practices

| Aspek | Implementasi |
|---|---|
| Model | Default `claude-sonnet-4-6` ($3/$15 per MTok) — sweet spot. Override via env. |
| Caching | 1-hour TTL system prompt — break-even setelah 3 source di run yang sama |
| Output | `client.messages.parse()` + `zodOutputFormat()` — auto-validate, parsed null kalau refuse |
| Errors | Typed exceptions (RateLimitError, AuthError, APIError); SDK auto-retry 429/5xx; per-page error tidak gagalkan whole run |

### 8.3 Admin source CRUD (`/admin/scrape`)

DB-backed `ScrapeSource` table — admin add/edit/toggle/run-now via UI. Fields: slug, label, searchQuery atau urlListJson, schemaType (scholarship/job_pathway), frequency (daily/weekly/monthly), topN, contextHint untuk Claude, apifyActor override, isActive, lastRunAt.

### 8.4 Cron rekomendasi

**Default mingguan** (Minggu 03:00 WIB). Beasiswa & jalur kerja info tidak berubah harian. Hemat ~7x dari daily, masih cukup fresh. Override per-source kalau ada yang time-critical.

Cost estimate weekly: ~$3/bulan untuk 8 source × 3 URL × ~5K token. Vs daily ~$12/bulan.

### 8.5 Schema

`ScrapeSource` (config admin-managed) + `ScrapeRun` (audit history dengan token usage breakdown + cache hit %).

---

## 9. Cross-Role Integration

### `StudentCareerSection` component

Server component yang inject ke `/admin/siswa/[id]` dan `/tutor/siswa/[id]`. Render:

1. **Profil RIASEC** (kalau ada): bar chart 6 dim + Holland code highlighted + top 3 jurusan match
2. **CV summary**: nama, bahasa, template, counter section, snippet ringkasan, tombol Download PDF
3. **Tracker Lamaran**: aktif (with status badge color-coded + interview/follow-up chip + notes preview), selesai (collapsed)
4. **Coaching prompt** (tutor only): callout teal yang ingatkan tutor manfaatkan profil ini untuk mentoring

**Auth boundary**:
- Admin: full access (existing requireAdmin)
- Tutor: scoped via existing `canAccessStudent()` di `tutor-scope.ts` — hanya siswa dengan relasi `TutorStudentTeaching`, `LiveEventRSVP host`, atau `AssignmentSubmission reviewer`
- CV PDF endpoint untuk tutor re-check `canAccessStudent` di server (defense-in-depth)

---

## 10. GLM-4.6 IQ2_S Local Setup

### Files
- `~/.local/share/glm-4.6-models/zai-org_GLM-4.6-IQ2_S/`
  - 3 split GGUF (38 + 38 + 21 GB) → merge → 1 file 95 GB
  - Modelfile dengan TEMPLATE GLM 4.x

### Setup steps
1. Build `llama-gguf-split` dari source (CPU only, 3 menit)
2. Merge 3 shards → single GGUF 95 GB
3. `ollama create glm-4.6` → blob 101 GB
4. Smoke test: prompt coding (reverse linked list Python) → output benar dengan komentar Bahasa Indonesia

### Performance di DGX Spark (GB10, 119 GB unified mem, aarch64)
- Cold load pertama: 5-6 menit
- Inference: ~2-3 tok/s (CPU; CUDA detection di Ollama 0.21 belum stabil untuk GB10)

---

## 11. Schema Migrations

Semua additive — no force-reset. Apply via `prisma db execute` (avoid drift dengan `student_scorecards.outcome` legacy).

| Tabel baru | Fungsi |
|---|---|
| `majors` | 30 jurusan dengan RIASEC tag vector |
| `scholarships` | 28 beasiswa |
| `scholarship_majors` | M2M Major↔Scholarship (kosong = berlaku semua) |
| `scholarship_guides` | 9 deep guide (timeline+essay+docs+interview+faqs) |
| `career_profiles` | 1 row per student (RIASEC scores + Holland code) |
| `guide_articles` | 6 panduan umum (block-based content) |
| `job_pathways` | 18 jalur kerja |
| `job_pathway_guides` | 12 deep guide kerja |
| `job_articles` | 6 panduan kerja |
| `cv_profiles` | 1 row per student + templateId |
| `job_applications` | N rows per student |
| `scrape_sources` | Admin-managed source config |
| `scrape_runs` | Audit log scrape runs |

Total: **13 tabel baru** untuk fitur karir + scraping.

---

## 12. Endpoints Baru

| Method | Path | Fungsi |
|---|---|---|
| GET | `/api/student/career/quiz` | RIASEC questions |
| POST | `/api/student/career/submit` | Compute + save profile |
| GET | `/api/student/career/profile` | Profile + recommendations |
| GET | `/api/student/career/scholarships` | List + filter |
| GET | `/api/student/career/scholarships/[slug]` | Detail + guide |
| GET | `/api/student/career/majors/[slug]` | Detail + match% + eligible scholarships |
| GET | `/api/student/career/articles` | List panduan |
| GET | `/api/student/career/articles/[slug]` | Detail dengan blocks |
| GET | `/api/student/career/jobs/pathways` | List jalur kerja |
| GET | `/api/student/career/jobs/pathways/[slug]` | Detail + guide |
| GET | `/api/student/career/jobs/articles` | List artikel kerja |
| GET | `/api/student/career/jobs/articles/[slug]` | Detail artikel |
| GET | `/api/student/career/jobs/boards` | Curated job board directory |
| GET\|PUT | `/api/student/career/cv` | CV CRUD |
| GET | `/api/student/career/cv/pdf` | Download PDF (own) |
| GET\|POST | `/api/student/career/applications` | List + create |
| PATCH\|DELETE | `/api/student/career/applications/[id]` | Update/delete (owner-check) |
| GET\|POST | `/api/admin/scrape/sources` | Admin source list/create |
| PATCH\|DELETE | `/api/admin/scrape/sources/[id]` | Admin source update/delete |
| POST | `/api/admin/scrape/trigger` | Manual run 1 source |
| GET | `/api/cron/scrape?freq=...` | Cron daily/weekly/monthly |
| GET | `/api/admin/student/[id]/cv-pdf` | Admin download CV siswa |
| GET | `/api/tutor/student/[id]/cv-pdf` | Tutor download CV siswa (scoped) |
| GET | `/api/student/certificates` | List sertifikat (untuk Profil Pencapaian) |
| GET | `/api/student/modules/[slug]/sesi/[idx]` | Lesson detail (Phase 4 sebelumnya, dilanjut) |

Total: **24 endpoint baru** sesi ini.

---

## 13. Files Touched (rough count)

**Mobile** (`senopati-academy-mobile`): ~25 file baru di `app/karir/` (entry + quiz + jurusan + beasiswa + panduan + kerja + cv + lamaran + sertifikat + kerja/board) + utility lib di `src/lib/` (web-bridge, useFetch perubahan minor).

**Server** (`Senopati_Academy`):
- ~30 file baru endpoint di `src/app/api/student/career/`, `src/app/api/admin/`, `src/app/api/tutor/`
- ~14 file baru pages di `src/app/karir/` (web mirror) + `src/app/admin/scrape/`
- 6 lib baru di `src/lib/`: `career-quiz.ts`, `cv-pdf.tsx`, `job-boards.ts`, `scrape/{brave,apify,claude-extract,runner,sources}.ts`
- 2 component baru di `src/app/_components/`: `StudentCareerSection.tsx`, `ScrapeManagerClient.tsx`
- 5 seed script baru di `scripts/`: `seed-career.ts`, `seed-career-guide.ts`, `seed-jobs.ts`, `seed-jobs-middle-east.ts`, `seed-jobs-qatar-saudi-guides.ts`, `seed-scrape-sources.ts`
- Schema additions ~13 tabel baru
- 2 dependency baru: `@anthropic-ai/sdk`, `apify-client`
- Sidebar update: tambah "Eksplorasi Karir" (siswa) dan "Scrape Manager" (admin)

---

## 14. Konten Stack Total

| Tipe | Jumlah | Total kata estimasi |
|---|---|---|
| Jurusan (Major) | 30 | ~6,000 (deskripsi + prospek + kampus) |
| Beasiswa (Scholarship) | 28 | ~5,000 |
| Beasiswa Deep Guide | 9 | ~12,000 (timeline + essay + dokumen + wawancara + FAQ) |
| Panduan Beasiswa Umum (Article) | 6 | ~6,000 |
| Job Pathway | 18 | ~5,000 |
| Job Pathway Deep Guide | 12 | ~18,000 |
| Panduan Kerja Umum | 6 | ~7,000 |
| Job Board Directory | 13 | ~2,000 |
| RIASEC Quiz | 18 soal | ~500 |

**Total: ~62,000 kata content** actionable + structured + dengan anti-fraud layer.

---

## 15. Catatan Untuk Sesi Selanjutnya

### Yang sudah siap di-deploy
- Semua DB schema sudah applied
- Semua mobile + web typecheck clean
- 24 endpoint live
- Admin source CRUD UI siap

### Yang butuh setup user
1. **Scraping system** — set 4 env keys (`SCRAPE_ENABLED=true`, `ANTHROPIC_API_KEY`, `BRAVE_SEARCH_API_KEY`, `APIFY_API_TOKEN`)
2. **Cron timer** — setup systemd untuk weekly trigger (template ada di admin/scrape page)
3. **CSS** — pertahankan token `--brand`, `--ink`, `--muted`, `--line` (sudah dipakai konsisten)

### Yang masih outstanding
- **Quiz Battle 1v1** (defer dari awal sesi) — butuh active user base dulu
- **Push reminder follow-up** untuk Application Tracker — kalau follow-up date dekat (2 hari), kirim push
- **Web mirror untuk Job Application Tracker** sudah ada (`/karir/lamaran`), tapi belum integrasi ke dashboard tutor untuk progress check siswa

---

## 16. Akun Test

| Email | Password | Role |
|---|---|---|
| `smoke.test@example.com` | `smoke12345` | student |
| `demo.tutor@asksenopati.com` | `tutor12345` | tutor |

Test flow karir lengkap (mobile):
```bash
cd /home/senopati/Documents/project_2026/senopati-academy-mobile
EXPO_PUBLIC_API_BASE=https://asksenopati.com npx expo start
# Login as smoke.test
# Navigate: Profil → Pencapaian → Eksplorasi karir
# Quiz RIASEC → Result → Top 5 jurusan → Detail jurusan
# Cari beasiswa → Detail → Daftar (link external)
# Cari kerja → 18 jalur → Detail dengan 8 section
# CV Builder → 3 template → Download PDF
# Lamaran saya → Tambah → Update status
```

---

*Generated: 2026-05-09 (addendum)*
