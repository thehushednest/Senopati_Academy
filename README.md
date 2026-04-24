# Senopati Academy

Platform AI Literacy berbasis Next.js 16, Prisma, NextAuth, dan Postgres. Menyajikan
alur pembelajaran modul → sesi → kuis → tugas → ujian akhir → sertifikat, dilengkapi
diskusi komunitas, catatan pribadi, dan panel tutor.

## Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Auth**: NextAuth v4 (Credentials + Google OAuth) + Prisma Adapter
- **Database**: PostgreSQL 16 + Prisma ORM 6
- **Storage**: MinIO (S3-compatible) untuk attachment tugas & media
- **Runtime**: Node.js 20+

## Prasyarat

- Node.js 20.9+ (cek dengan `node -v`)
- Docker & Docker Compose (untuk Postgres & MinIO lokal)
- npm (atau pnpm/yarn — contoh di bawah pakai npm)

## Setup Lokal

```bash
# 1. Install dependencies
npm install

# 2. Siapkan env
cp .env.example .env.local
# → edit NEXTAUTH_SECRET, GOOGLE_CLIENT_ID/SECRET kalau butuh OAuth

# 3. Jalankan database & storage lokal (port 5433 dan 9002)
npm run docker:up

# 4. Apply schema Prisma
npm run prisma:migrate
# atau untuk development iterative:
npm run prisma:dev

# 5. (Opsional) seed data demo
npm run db:seed

# 6. Jalankan dev server
npm run dev
# → http://localhost:3003
```

## Script Utama

| Script | Fungsi |
|--------|--------|
| `npm run dev` | Next.js dev server di port 3003 |
| `npm run build` | Production build |
| `npm run start` | Start production server (setelah build) |
| `npm run typecheck` | Cek TypeScript tanpa emit |
| `npm run lint` | ESLint |
| `npm run prisma:dev` | Buat migrasi baru saat ubah schema |
| `npm run prisma:migrate` | Apply migrasi (production-safe) |
| `npm run prisma:studio` | UI untuk inspect DB |
| `npm run db:seed` | Seed user demo (admin/tutor/student) |
| `npm run docker:up` | Start Postgres + MinIO |
| `npm run docker:down` | Stop container |

## Arsitektur Singkat

```
src/
├── app/
│   ├── api/              # Route handlers (REST-ish)
│   │   ├── auth/         # NextAuth + registrasi
│   │   ├── progress/     # Session progress tracking
│   │   ├── quiz/         # Quiz & ujian akhir submission
│   │   ├── assignment/   # Submission tugas
│   │   ├── discussion/   # Forum thread + reply + like
│   │   ├── notes/        # Catatan pribadi per modul
│   │   ├── review/       # Review modul
│   │   └── certificate/  # Issue & verify sertifikat
│   ├── belajar/[slug]/   # Flow belajar (sesi, kuis, tugas, ujian, sertifikat)
│   ├── tutor/            # Panel tutor
│   ├── verify/[code]/    # Verifikasi publik sertifikat
│   └── ...
├── lib/
│   ├── auth.ts           # NextAuth options
│   ├── prisma.ts         # Prisma singleton
│   ├── session.ts        # Helper server auth
│   ├── content.ts        # Konten statis (modul, mentor, kuis, ujian)
│   ├── progress-server.ts # Reader progress DB + fallback sample
│   └── cms.ts            # CMS integration
└── middleware.ts         # Route protection (auth gates)

prisma/
├── schema.prisma         # 30+ model (Course/Lesson + learning layer)
├── migrations/           # SQL migrations
└── seed.ts               # Seed script
```

### Flow belajar

1. User enroll ke modul → `ModuleProgress` row dibuat saat sesi pertama ditandai selesai
2. Tiap sesi punya **video/materi + kuis + tugas** (opsional)
3. Kuis → `POST /api/quiz/submit` → `QuizSubmission` (type=`session`)
4. Tugas → `POST /api/assignment/submit` → `AssignmentSubmission` (status=`submitted`)
5. Selesai semua sesi → **Ujian Akhir** → `QuizSubmission` (type=`final_exam`)
6. Kalau lulus → **Sertifikat** auto-issued (`ModuleCertificate` dengan `certCode` unik)
7. Verifikasi publik di `/verify/<certCode>`

## Deployment

### Build standalone (Docker)

`next.config.mjs` sudah di-set `output: "standalone"` untuk menghasilkan image slim.

```bash
docker build -t senopati-academy:latest .
```

### Jalankan di production

Minimum env yang dibutuhkan di server:

```bash
DATABASE_URL=postgresql://user:pass@db-host:5432/senopati_academy
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=https://academy.yourdomain.com
NEXT_PUBLIC_SITE_URL=https://academy.yourdomain.com
# (opsional) GOOGLE_CLIENT_ID/SECRET, S3_* untuk file upload
```

```bash
docker run -d --name senopati-academy \
  -p 3003:3003 \
  --env-file .env.production \
  senopati-academy:latest
```

Container akan otomatis jalan `prisma migrate deploy` sebelum start server. Kalau
migrasi sudah di-manage di luar container (misal: CI/CD), override command:

```bash
docker run ... senopati-academy:latest node server.js
```

### Checklist sebelum deploy

- [ ] Ganti `NEXTAUTH_SECRET` dengan nilai acak production (`openssl rand -base64 32`)
- [ ] Set `NEXTAUTH_URL` ke domain production (HTTPS)
- [ ] `DATABASE_URL` mengarah ke Postgres production (bukan container lokal)
- [ ] `NEXT_PUBLIC_SITE_URL` konsisten dengan `NEXTAUTH_URL`
- [ ] Kalau pakai Google OAuth: tambahkan redirect URI production di Google Console
- [ ] Backup Postgres terkonfigurasi (daily dump / managed service)
- [ ] Reverse proxy (Nginx/Caddy/Traefik) di depan container untuk TLS
- [ ] Monitoring (Grafana/Sentry/whatever) — minimal uptime check ke `/`

## Database Migration

Saat ubah `prisma/schema.prisma`:

```bash
# development: buat migrasi baru, apply ke DB dev
npm run prisma:dev -- --name nama_perubahan

# production: CI/CD deploy migrasi
npm run prisma:migrate
```

## User Demo (setelah seed)

| Role | Email | Password |
|------|-------|----------|
| admin | `admin@senopati.local` | `senopati123` |
| tutor | `tutor@senopati.local` | `senopati123` |
| student | `student@senopati.local` | `senopati123` |

Detail ada di `prisma/seed.ts`. Ganti password sebelum production.

## Lisensi & Kontribusi

Lihat `LICENSE` (kalau ada). Internal project — koordinasi dengan tim Senopati
sebelum kontribusi eksternal.
