import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";
import { requireAdmin } from "../../../../lib/session";
import { handleApiError } from "../../../../lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") as "student" | "tutor" | "admin" | null;
    const q = (searchParams.get("q") ?? "").trim();
    const limit = Math.min(500, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "100", 10) || 100));

    const where: Prisma.UserWhereInput = {};
    if (role === "student" || role === "tutor" || role === "admin") {
      where.role = role;
    }
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ];
    }

    const [users, counts] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatarUrl: true,
          school: true,
          grade: true,
          mentorSlug: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.groupBy({
        by: ["role"],
        _count: { _all: true },
      }),
    ]);

    const byRole: Record<string, number> = { student: 0, tutor: 0, admin: 0 };
    for (const c of counts) byRole[c.role] = c._count._all;

    return NextResponse.json({ users, counts: byRole });
  } catch (err) {
    return handleApiError(err);
  }
}
