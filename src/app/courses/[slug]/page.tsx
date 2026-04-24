import { permanentRedirect } from "next/navigation";

// Legacy /courses/[slug] dulu di-serve oleh CMS. Sekarang kanonikalnya di /modul/[slug]
// yang sudah punya semua data dari content.ts + progress dari DB.
// Dipertahankan supaya link lama (blog, newsletter, email) tidak patah.

export default async function LegacyCourseRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  permanentRedirect(`/modul/${slug}`);
}
