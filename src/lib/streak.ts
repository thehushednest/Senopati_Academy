import { prisma } from "./prisma";

/**
 * Simpan aktivitas hari ini untuk user — idempoten via unique constraint.
 * Dipanggil dari trigger "aksi belajar produktif": sesi selesai, kuis
 * submit, tugas submit, reply thread. Granularity harian cukup untuk
 * compute streak.
 */
export async function recordActivity(userId: string | null | undefined): Promise<void> {
  if (!userId) return;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  try {
    await prisma.dailyActivity.upsert({
      where: { userId_date: { userId, date: today } },
      create: { userId, date: today },
      update: {}, // no-op kalau sudah ada
    });
  } catch (err) {
    console.error("[recordActivity] failed:", err);
  }
}

/**
 * Hitung streak harian user: currentStreak (berurutan sampai hari ini),
 * longestStreak, dan total hari aktif. Ambil 120 hari terakhir — cukup
 * untuk cover kasus umum tanpa scan seluruh tabel.
 */
export async function getStreak(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  activeToday: boolean;
}> {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - 119); // include today + 119 hari lalu

  const rows = await prisma.dailyActivity.findMany({
    where: { userId, date: { gte: since } },
    select: { date: true },
    orderBy: { date: "desc" },
  });

  if (rows.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalActiveDays: 0, activeToday: false };
  }

  const dateSet = new Set(rows.map((r) => r.date.toISOString().slice(0, 10)));

  // Current streak: hitung mundur dari hari ini (atau kemarin kalau belum aktif hari ini).
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayKey = today.toISOString().slice(0, 10);
  const activeToday = dateSet.has(todayKey);

  let current = 0;
  const cursor = new Date(today);
  if (!activeToday) {
    // Kalau belum aktif hari ini, streak terakhir bisa berhenti kemarin.
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  while (dateSet.has(cursor.toISOString().slice(0, 10))) {
    current += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  // Longest streak dalam window 120 hari.
  const sortedKeys = Array.from(dateSet).sort(); // ascending
  let longest = 0;
  let run = 0;
  let prevDay: number | null = null;
  for (const key of sortedKeys) {
    const dayNum = Math.floor(new Date(key).getTime() / (24 * 3600 * 1000));
    if (prevDay !== null && dayNum === prevDay + 1) {
      run += 1;
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
    prevDay = dayNum;
  }

  return {
    currentStreak: current,
    longestStreak: longest,
    totalActiveDays: dateSet.size,
    activeToday,
  };
}
