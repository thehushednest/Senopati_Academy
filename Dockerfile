# syntax=docker/dockerfile:1.7
# Multi-stage build untuk Senopati Academy (Next.js 16, Node 20+).
# Menghasilkan runtime image slim berbasis output: "standalone".

# ─── Stage 1: install dependencies ───────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Needed by Prisma on alpine
RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then npm ci --ignore-scripts; \
    else npm install --ignore-scripts; fi

# ─── Stage 2: build Next.js ──────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client (butuh schema.prisma)
RUN npx prisma generate

# Build Next.js dengan output standalone. DATABASE_URL tidak wajib saat build
# (kami tidak menjalankan migrasi saat build), tapi Prisma generate sudah jalan.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─── Stage 3: runtime ────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3003
ENV HOSTNAME=0.0.0.0

# Standalone output mencakup minimal node_modules + server.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Prisma schema + generated client + migrasi untuk runtime migrate deploy
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3003

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3003/ >/dev/null 2>&1 || exit 1

# Jalankan migrasi lalu start server. Untuk environment tanpa migrate saat boot,
# override command ini dengan `node server.js` saja.
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
