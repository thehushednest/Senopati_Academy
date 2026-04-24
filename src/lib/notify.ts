import { prisma } from "./prisma";

type NotifyInput = {
  userId: string;
  title: string;
  body: string;
  href?: string | null;
};

/**
 * Buat satu notifikasi. Sengaja tidak throw kalau gagal — trigger notifikasi
 * tidak boleh membuat aksi utama (reply, issue cert) ikut gagal.
 */
export async function notify(input: NotifyInput): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        title: input.title,
        body: input.body,
        href: input.href ?? null,
      },
    });
  } catch (err) {
    console.error("[notify] failed to create notification:", err);
  }
}

type BroadcastInput = Omit<NotifyInput, "userId"> & {
  roles: Array<"tutor" | "admin">;
  excludeUserId?: string;
};

/**
 * Kirim notifikasi yang sama ke semua user dengan role tertentu.
 * Cocok untuk trigger "ada submission baru" atau "ada thread baru" yang
 * relevan untuk semua tutor/admin. `excludeUserId` untuk skip si pembuat aksi.
 */
export async function notifyRoles(input: BroadcastInput): Promise<void> {
  try {
    const targets = await prisma.user.findMany({
      where: {
        role: { in: input.roles },
        ...(input.excludeUserId ? { id: { not: input.excludeUserId } } : {}),
      },
      select: { id: true },
    });
    if (targets.length === 0) return;
    await prisma.notification.createMany({
      data: targets.map((t) => ({
        userId: t.id,
        title: input.title,
        body: input.body,
        href: input.href ?? null,
      })),
    });
  } catch (err) {
    console.error("[notifyRoles] failed:", err);
  }
}
