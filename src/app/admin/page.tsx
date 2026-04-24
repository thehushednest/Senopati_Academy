import { redirect } from "next/navigation";

// /admin/ sendiri redirect ke halaman pengguna (entry point admin paling umum).
export default function AdminIndexPage() {
  redirect("/admin/pengguna");
}
