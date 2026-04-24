import type { Metadata } from "next";
import Link from "next/link";
import { DashboardRightBar } from "../../_components/DashboardRightBar";
import { DashboardSidebar } from "../../_components/DashboardSidebar";
import { DashboardTopbar } from "../../_components/DashboardTopbar";
import { AdminUserTable } from "../../_components/AdminUserTable";
import { prisma } from "../../../lib/prisma";
import { findCategory, MENTORS, modulesByMentor } from "../../../lib/content";

export const metadata: Metadata = {
  title: "Admin · Pengguna",
  robots: { index: false, follow: false },
  alternates: { canonical: "/admin/pengguna" },
};

export const dynamic = "force-dynamic";

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const role = typeof sp.role === "string" ? sp.role : "";
  const q = typeof sp.q === "string" ? sp.q : "";

  const [users, counts] = await Promise.all([
    prisma.user.findMany({
      where: {
        ...(role === "student" || role === "tutor" || role === "admin"
          ? { role: role as "student" | "tutor" | "admin" }
          : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        mentorSlug: true,
        school: true,
        grade: true,
        createdAt: true,
      },
    }),
    prisma.user.groupBy({
      by: ["role"],
      _count: { _all: true },
    }),
  ]);

  const byRole: Record<string, number> = { student: 0, tutor: 0, admin: 0 };
  for (const c of counts) byRole[c.role] = c._count._all;
  const total = byRole.student + byRole.tutor + byRole.admin;

  // Mentor options untuk assignment tutor → mentor track
  const mentorOptions = MENTORS.map((m) => {
    const firstModule = modulesByMentor(m.slug)[0];
    const cat = firstModule ? findCategory(firstModule.categorySlug) : null;
    return {
      slug: m.slug,
      name: m.name,
      track: cat?.name ?? "Senopati",
    };
  });

  return (
    <main className="academy-shell dashboard-shell">
      <div className="container dashboard-app">
        <DashboardSidebar />

        <section className="dashboard-app__main" aria-label="Admin pengguna">
          <DashboardTopbar placeholder="Cari nama / email user" />

          <header className="dashboard-page-header">
            <div>
              <p className="eyebrow eyebrow--brand">Admin · Pengguna</p>
              <h1>Kelola semua pengguna platform</h1>
              <p>
                {total} user · {byRole.student} student · {byRole.tutor} tutor · {byRole.admin} admin. Ubah role, set
                mentor track untuk tutor, atau reset password.
              </p>
            </div>
          </header>

          <div className="dashboard-section">
            <form method="get" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              <input
                type="text"
                name="q"
                defaultValue={q}
                className="form-input"
                placeholder="Cari nama / email"
                style={{ flex: "1 1 220px", maxWidth: 320 }}
              />
              <select name="role" defaultValue={role} className="form-input" style={{ maxWidth: 180 }}>
                <option value="">Semua role ({total})</option>
                <option value="student">Student ({byRole.student})</option>
                <option value="tutor">Tutor ({byRole.tutor})</option>
                <option value="admin">Admin ({byRole.admin})</option>
              </select>
              <button type="submit" className="button button--primary button--sm">
                Terapkan
              </button>
              {(q || role) && (
                <Link href="/admin/pengguna" className="button button--ghost button--sm">
                  Reset filter
                </Link>
              )}
            </form>

            <AdminUserTable
              users={users.map((u) => ({
                ...u,
                createdAt: u.createdAt.toISOString(),
              }))}
              mentorOptions={mentorOptions}
            />
          </div>

          <div className="dashboard-section">
            <div className="tutor-cta">
              <div>
                <p className="eyebrow eyebrow--brand">Tips Admin</p>
                <h2>Promosikan tutor baru dengan langkah singkat.</h2>
                <p>
                  Edit user → ubah role ke <strong>Tutor</strong> → pilih <strong>mentor track</strong> yang sesuai
                  (mis. Praktis, Foundations). Tutor baru akan langsung dapat akses queue review untuk modul trek
                  tersebut.
                </p>
              </div>
            </div>
          </div>
        </section>

        <DashboardRightBar />
      </div>
    </main>
  );
}
