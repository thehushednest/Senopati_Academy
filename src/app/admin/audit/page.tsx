import type { Metadata } from "next";
import Link from "next/link";
import { DashboardRightBar } from "../../_components/DashboardRightBar";
import { DashboardSidebar } from "../../_components/DashboardSidebar";
import { DashboardTopbar } from "../../_components/DashboardTopbar";
import { prisma } from "../../../lib/prisma";

export const metadata: Metadata = {
  title: "Admin · Audit Log",
  robots: { index: false, follow: false },
  alternates: { canonical: "/admin/audit" },
};

export const dynamic = "force-dynamic";

const ACTION_LABEL: Record<string, string> = {
  "user.update": "Ubah data user",
  "user.password_reset": "Reset password",
  "thread.delete": "Hapus thread",
};

function formatDateTime(d: Date) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

function formatChanges(meta: unknown): string {
  if (!meta || typeof meta !== "object") return "";
  const m = meta as Record<string, unknown>;
  if (m.changes && typeof m.changes === "object") {
    const changes = m.changes as Record<string, { from: unknown; to: unknown }>;
    return Object.entries(changes)
      .map(([k, v]) => `${k}: ${String(v.from ?? "—")} → ${String(v.to ?? "—")}`)
      .join(", ");
  }
  if (typeof m.title === "string") return `"${m.title}"`;
  if (typeof m.targetEmail === "string") return m.targetEmail;
  return "";
}

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const action = typeof sp.action === "string" ? sp.action : "";

  const [entries, counts] = await Promise.all([
    prisma.auditLog.findMany({
      where: action ? { action } : {},
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        actor: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.auditLog.groupBy({
      by: ["action"],
      _count: { _all: true },
    }),
  ]);

  const byAction: Record<string, number> = {};
  for (const c of counts) byAction[c.action] = c._count._all;
  const total = Object.values(byAction).reduce((a, b) => a + b, 0);

  return (
    <main className="academy-shell dashboard-shell">
      <div className="container dashboard-app">
        <DashboardSidebar />

        <section className="dashboard-app__main" aria-label="Admin audit">
          <DashboardTopbar placeholder="Cari audit log" />

          <header className="dashboard-page-header">
            <div>
              <p className="eyebrow eyebrow--brand">Admin · Audit Log</p>
              <h1>Jejak aksi admin di platform</h1>
              <p>
                {total} entry tercatat. Untuk akuntabilitas: siapa promote role siapa, siapa reset password, siapa
                hapus thread. Retensi saat ini permanen — tim bisa tentukan policy retensi nanti.
              </p>
            </div>
          </header>

          <div className="dashboard-section">
            <div className="rekaman-filters" style={{ marginBottom: 16 }}>
              <Link
                href="/admin/audit"
                className={"chip" + (action === "" ? " chip--active" : "")}
              >
                Semua ({total})
              </Link>
              {Object.keys(byAction).sort().map((a) => (
                <Link
                  key={a}
                  href={`/admin/audit?action=${encodeURIComponent(a)}`}
                  className={"chip" + (action === a ? " chip--active" : "")}
                >
                  {ACTION_LABEL[a] ?? a} ({byAction[a]})
                </Link>
              ))}
            </div>

            {entries.length === 0 ? (
              <div className="catalog-empty">
                <p>Belum ada log untuk filter ini.</p>
              </div>
            ) : (
              <div className="review-table">
                <div className="review-table__head" role="row">
                  <span>Waktu</span>
                  <span>Admin</span>
                  <span>Aksi</span>
                  <span>Target</span>
                  <span>Detail</span>
                </div>
                {entries.map((e) => (
                  <div className="review-table__row" role="row" key={e.id}>
                    <span>
                      <small style={{ color: "var(--muted)" }}>{formatDateTime(e.createdAt)}</small>
                    </span>
                    <span>
                      <strong>{e.actor?.name ?? "System"}</strong>
                      <br />
                      <small style={{ color: "var(--muted)" }}>{e.actor?.email ?? "-"}</small>
                    </span>
                    <span>
                      <span
                        className={`review-status review-status--${
                          e.action === "thread.delete"
                            ? "needs_revision"
                            : e.action === "user.password_reset"
                            ? "reviewing"
                            : "approved"
                        }`}
                      >
                        {ACTION_LABEL[e.action] ?? e.action}
                      </span>
                    </span>
                    <span>
                      <code style={{ fontSize: "0.76rem" }}>{e.target ?? "—"}</code>
                    </span>
                    <span>
                      <small style={{ color: "var(--ink-soft)" }}>{formatChanges(e.metaJson)}</small>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <DashboardRightBar />
      </div>
    </main>
  );
}
