import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../../lib/prisma";
import { requireAdmin } from "../../../../../lib/session";
import { handleApiError, jsonError } from "../../../../../lib/api-utils";
import { auditLog } from "../../../../../lib/audit";

const updateSchema = z.object({
  role: z.enum(["student", "tutor", "admin"]).optional(),
  name: z.string().min(1).max(120).optional(),
  mentorSlug: z.string().max(120).nullable().optional(),
  school: z.string().max(200).nullable().optional(),
  grade: z.string().max(40).nullable().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
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
    });
    if (!user) return jsonError("User not found", 404);
    return NextResponse.json({ user });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = updateSchema.parse(await req.json());

    // Proteksi: admin tidak boleh menurunkan role dirinya sendiri.
    if (id === admin.id && body.role && body.role !== "admin") {
      return jsonError("Kamu tidak bisa menurunkan role admin-mu sendiri", 400);
    }

    // Simpan state lama untuk audit meta.
    const before = await prisma.user.findUnique({
      where: { id },
      select: { role: true, mentorSlug: true, name: true },
    });
    if (!before) return jsonError("User not found", 404);

    const updated = await prisma.user.update({
      where: { id },
      data: {
        role: body.role ?? undefined,
        name: body.name ?? undefined,
        mentorSlug: body.mentorSlug === null ? null : body.mentorSlug ?? undefined,
        school: body.school === null ? null : body.school ?? undefined,
        grade: body.grade === null ? null : body.grade ?? undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        mentorSlug: true,
        school: true,
        grade: true,
      },
    });

    // Audit: log perubahan yang signifikan (role & mentorSlug terutama).
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    if (body.role && body.role !== before.role) {
      changes.role = { from: before.role, to: body.role };
    }
    if (body.mentorSlug !== undefined && body.mentorSlug !== before.mentorSlug) {
      changes.mentorSlug = { from: before.mentorSlug, to: body.mentorSlug };
    }
    if (body.name !== undefined && body.name !== before.name) {
      changes.name = { from: before.name, to: body.name };
    }
    if (Object.keys(changes).length > 0) {
      await auditLog({
        actorId: admin.id,
        action: "user.update",
        target: id,
        meta: { targetEmail: updated.email, changes },
      });
    }

    return NextResponse.json({ user: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
