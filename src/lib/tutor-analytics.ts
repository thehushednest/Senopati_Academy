import { prisma } from "./prisma";
import { findModule } from "./content";

// Semua fungsi di sini menerima `slugs: string[] | null`:
//   - null → admin scope (semua modul platform)
//   - array kosong → tutor tanpa mapping (hasil kosong)
//   - array berisi → tutor dengan modul yang di-ampu

function slugsFilter(slugs: string[] | null) {
  if (slugs === null) return {} as const;
  return { moduleSlug: { in: slugs } };
}

/**
 * Enrollment per minggu dalam `weeks` minggu terakhir. Hitung start-week (UTC)
 * dari ModuleProgress.startedAt.
 */
export async function getEnrollmentPerWeek(
  slugs: string[] | null,
  weeks = 8,
): Promise<Array<{ weekStart: Date; label: string; count: number }>> {
  if (Array.isArray(slugs) && slugs.length === 0) {
    // tutor tanpa mapping: return series 0 supaya chart tetap terender
    return buildEmptyWeeks(weeks);
  }

  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  // Mulai minggu: anggap minggu Senin-Minggu. Pindahkan `since` ke Senin 8 minggu lalu.
  const day = since.getUTCDay(); // 0=Sunday ... 1=Monday
  const mondayOffset = day === 0 ? 6 : day - 1;
  since.setUTCDate(since.getUTCDate() - mondayOffset - (weeks - 1) * 7);

  const progresses = await prisma.moduleProgress.findMany({
    where: {
      ...slugsFilter(slugs),
      startedAt: { gte: since },
    },
    select: { startedAt: true },
  });

  // Bucketize per Senin 00:00 UTC.
  const buckets = new Map<string, number>();
  const weekStarts: Date[] = [];
  for (let i = 0; i < weeks; i++) {
    const start = new Date(since);
    start.setUTCDate(start.getUTCDate() + i * 7);
    weekStarts.push(start);
    buckets.set(start.toISOString(), 0);
  }

  for (const p of progresses) {
    const d = new Date(p.startedAt);
    d.setUTCHours(0, 0, 0, 0);
    const dayN = d.getUTCDay();
    const monOffset = dayN === 0 ? 6 : dayN - 1;
    d.setUTCDate(d.getUTCDate() - monOffset);
    const key = d.toISOString();
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }

  return weekStarts.map((ws, idx) => ({
    weekStart: ws,
    label: `W${idx + 1}`,
    count: buckets.get(ws.toISOString()) ?? 0,
  }));
}

function buildEmptyWeeks(weeks: number) {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  const day = since.getUTCDay();
  const mondayOffset = day === 0 ? 6 : day - 1;
  since.setUTCDate(since.getUTCDate() - mondayOffset - (weeks - 1) * 7);
  return Array.from({ length: weeks }).map((_, i) => {
    const d = new Date(since);
    d.setUTCDate(d.getUTCDate() + i * 7);
    return { weekStart: d, label: `W${i + 1}`, count: 0 };
  });
}

export type ModulePerformance = {
  slug: string;
  title: string;
  students: number;
  averageCompletionPercent: number;
  completedCount: number;
  averageQuizScore: number | null;
  averageFinalExamScore: number | null;
  averageReviewGrade: number | null;
  totalSubmissions: number;
  approvedSubmissions: number;
};

export async function getPerformancePerModule(
  slugs: string[] | null,
): Promise<ModulePerformance[]> {
  if (Array.isArray(slugs) && slugs.length === 0) return [];

  const [progresses, quizzes, exams, assignments] = await Promise.all([
    prisma.moduleProgress.findMany({
      where: slugsFilter(slugs),
      select: { moduleSlug: true, completedSessions: true, totalSessions: true, completedAt: true },
    }),
    prisma.quizSubmission.findMany({
      where: { ...slugsFilter(slugs), quizType: "session" },
      select: { moduleSlug: true, score: true },
    }),
    prisma.quizSubmission.findMany({
      where: { ...slugsFilter(slugs), quizType: "final_exam" },
      select: { moduleSlug: true, score: true },
    }),
    prisma.assignmentSubmission.findMany({
      where: slugsFilter(slugs),
      select: { moduleSlug: true, status: true, grade: true },
    }),
  ]);

  // Kumpulkan slug unik
  const slugSet = new Set<string>([
    ...progresses.map((p) => p.moduleSlug),
    ...quizzes.map((q) => q.moduleSlug),
    ...exams.map((e) => e.moduleSlug),
    ...assignments.map((a) => a.moduleSlug),
    ...(Array.isArray(slugs) ? slugs : []),
  ]);

  const result: ModulePerformance[] = [];
  for (const slug of slugSet) {
    const mod = findModule(slug);
    if (!mod) continue;

    const mpList = progresses.filter((p) => p.moduleSlug === slug);
    const students = mpList.length;
    const completedCount = mpList.filter((p) => p.completedAt !== null).length;
    const avgCompletion =
      students > 0
        ? Math.round(
            mpList.reduce((sum, p) => {
              const pct = p.totalSessions > 0 ? (p.completedSessions / p.totalSessions) * 100 : 0;
              return sum + pct;
            }, 0) / students,
          )
        : 0;

    const qList = quizzes.filter((q) => q.moduleSlug === slug);
    const avgQuiz = qList.length > 0 ? Math.round(qList.reduce((s, q) => s + q.score, 0) / qList.length) : null;

    const eList = exams.filter((e) => e.moduleSlug === slug);
    const avgExam = eList.length > 0 ? Math.round(eList.reduce((s, e) => s + e.score, 0) / eList.length) : null;

    const aList = assignments.filter((a) => a.moduleSlug === slug);
    const graded = aList.filter((a) => a.grade !== null && a.status === "approved");
    const avgGrade =
      graded.length > 0 ? Math.round(graded.reduce((s, a) => s + (a.grade ?? 0), 0) / graded.length) : null;
    const approved = aList.filter((a) => a.status === "approved").length;

    result.push({
      slug,
      title: mod.title,
      students,
      averageCompletionPercent: avgCompletion,
      completedCount,
      averageQuizScore: avgQuiz,
      averageFinalExamScore: avgExam,
      averageReviewGrade: avgGrade,
      totalSubmissions: aList.length,
      approvedSubmissions: approved,
    });
  }

  // Sort descending by students
  result.sort((a, b) => b.students - a.students);
  return result;
}

export type TopStudent = {
  id: string;
  name: string;
  email: string;
  sessionsCompleted: number;
  averageQuizScore: number | null;
  approvedAssignments: number;
  discussionReplies: number;
  compositeScore: number;
};

export async function getTopStudents(
  slugs: string[] | null,
  days = 30,
  limit = 5,
): Promise<TopStudent[]> {
  if (Array.isArray(slugs) && slugs.length === 0) return [];

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);

  // Aktivitas dalam window: student yang punya progress/quiz/assignment di modul target.
  const [progresses, quizzes, assignments, replies] = await Promise.all([
    prisma.moduleProgress.findMany({
      where: {
        ...slugsFilter(slugs),
        updatedAt: { gte: since },
      },
      select: { studentId: true, completedSessions: true },
    }),
    prisma.quizSubmission.findMany({
      where: {
        ...slugsFilter(slugs),
        submittedAt: { gte: since },
      },
      select: { studentId: true, score: true },
    }),
    prisma.assignmentSubmission.findMany({
      where: {
        ...slugsFilter(slugs),
        submittedAt: { gte: since },
      },
      select: { studentId: true, status: true },
    }),
    prisma.discussionReply.findMany({
      where: {
        createdAt: { gte: since },
        ...(Array.isArray(slugs) ? { thread: { moduleSlug: { in: slugs } } } : {}),
      },
      select: { authorId: true },
    }),
  ]);

  const map = new Map<
    string,
    { sessions: number; quizScores: number[]; approved: number; replies: number }
  >();

  const ensure = (id: string) => {
    let agg = map.get(id);
    if (!agg) {
      agg = { sessions: 0, quizScores: [], approved: 0, replies: 0 };
      map.set(id, agg);
    }
    return agg;
  };

  for (const p of progresses) ensure(p.studentId).sessions += p.completedSessions;
  for (const q of quizzes) ensure(q.studentId).quizScores.push(q.score);
  for (const a of assignments) {
    if (a.status === "approved") ensure(a.studentId).approved += 1;
  }
  for (const r of replies) ensure(r.authorId).replies += 1;

  const studentIds = Array.from(map.keys());
  if (studentIds.length === 0) return [];

  const users = await prisma.user.findMany({
    where: { id: { in: studentIds }, role: "student" },
    select: { id: true, name: true, email: true },
  });

  const studentMap = new Map(users.map((u) => [u.id, u]));
  const list: TopStudent[] = [];

  for (const [sid, agg] of map) {
    const u = studentMap.get(sid);
    if (!u) continue; // skip bukan student (tutor/admin yang kebetulan aktif belajar)
    const avgQ = agg.quizScores.length > 0 ? Math.round(agg.quizScores.reduce((s, v) => s + v, 0) / agg.quizScores.length) : null;
    // Composite: bobot sesi 3, quiz avg 1 (scaled /10), approved assignment 2, replies 1
    const composite =
      agg.sessions * 3 +
      (avgQ ?? 0) / 10 +
      agg.approved * 2 +
      agg.replies * 1;
    list.push({
      id: u.id,
      name: u.name,
      email: u.email,
      sessionsCompleted: agg.sessions,
      averageQuizScore: avgQ,
      approvedAssignments: agg.approved,
      discussionReplies: agg.replies,
      compositeScore: Math.round(composite * 10) / 10,
    });
  }

  list.sort((a, b) => b.compositeScore - a.compositeScore);
  return list.slice(0, limit);
}

export type AutoInsight = {
  tone: "brand" | "accent" | "indigo" | "pink";
  title: string;
  desc: string;
};

/**
 * Insight otomatis berdasarkan performance per modul. Disederhanakan:
 * heuristik beberapa pola yang biasa relevan buat tutor.
 */
export function buildInsights(
  performance: ModulePerformance[],
  weekly: Array<{ label: string; count: number }>,
): AutoInsight[] {
  const insights: AutoInsight[] = [];

  // Insight 1: modul paling populer (dengan >=1 siswa)
  const topPopular = [...performance].filter((m) => m.students > 0).sort((a, b) => b.students - a.students)[0];
  if (topPopular) {
    insights.push({
      tone: "brand",
      title: `${topPopular.title} paling diminati`,
      desc: `${topPopular.students} siswa enroll. Completion ${topPopular.averageCompletionPercent}%. Pertimbangkan buat konten pendukung (template, live session).`,
    });
  }

  // Insight 2: modul dengan completion rendah (>=3 siswa, completion < 40%)
  const drop = [...performance]
    .filter((m) => m.students >= 3 && m.averageCompletionPercent < 40)
    .sort((a, b) => a.averageCompletionPercent - b.averageCompletionPercent)[0];
  if (drop) {
    insights.push({
      tone: "accent",
      title: `${drop.title}: completion rendah`,
      desc: `Rata-rata baru ${drop.averageCompletionPercent}% dari ${drop.students} siswa. Cek apakah ada sesi yang jadi drop-off point — mungkin perlu revisi pacing atau tambah contoh.`,
    });
  }

  // Insight 3: trend enrollment
  if (weekly.length >= 2) {
    const recent = weekly[weekly.length - 1]?.count ?? 0;
    const prev = weekly[weekly.length - 2]?.count ?? 0;
    if (recent > 0 || prev > 0) {
      const diff = recent - prev;
      if (diff > 0) {
        insights.push({
          tone: "indigo",
          title: `Enrollment naik minggu ini`,
          desc: `${recent} siswa enroll minggu ini (vs ${prev} minggu lalu). Tetap jaga momentum feedback supaya engagement tidak turun.`,
        });
      } else if (diff < 0 && prev > 0) {
        insights.push({
          tone: "pink",
          title: `Enrollment melambat minggu ini`,
          desc: `${recent} siswa enroll minggu ini (vs ${prev} sebelumnya). Kalau pattern berlanjut, koordinasi dengan tim marketing.`,
        });
      }
    }
  }

  // Fallback kalau belum ada insight
  if (insights.length === 0) {
    insights.push({
      tone: "indigo",
      title: "Data belum cukup untuk insight",
      desc: "Begitu ada cukup enrollment, kuis, dan submission, insight otomatis akan muncul di sini.",
    });
  }

  return insights;
}
