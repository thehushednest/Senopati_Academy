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
