"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRightIcon, CheckIcon } from "./Icon";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "student" | "tutor" | "admin";
  mentorSlug: string | null;
  school: string | null;
  grade: string | null;
  createdAt: string;
};

type Props = {
  users: AdminUser[];
  mentorOptions: Array<{ slug: string; name: string; track: string }>;
};

const ROLE_LABEL: Record<string, string> = {
  student: "Student",
  tutor: "Tutor",
  admin: "Admin",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso),
  );
}

export function AdminUserTable({ users: initialUsers, mentorOptions }: Props) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftRole, setDraftRole] = useState<AdminUser["role"]>("student");
  const [draftMentor, setDraftMentor] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<{ id: string; password: string } | null>(null);

  const startEdit = (u: AdminUser) => {
    setEditingId(u.id);
    setDraftRole(u.role);
    setDraftMentor(u.mentorSlug ?? "");
    setError(null);
    setResetResult(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setError(null);
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: draftRole,
          mentorSlug: draftRole === "tutor" ? draftMentor || null : null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Gagal menyimpan" }));
        throw new Error(data.error ?? "Gagal menyimpan");
      }
      const data = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...data.user } : u)),
      );
      setEditingId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const resetPassword = async (id: string) => {
    if (!window.confirm("Reset password user ini? Password baru akan muncul sekali dan tidak tersimpan.")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${id}/reset-password`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Gagal reset password" }));
        throw new Error(data.error ?? "Gagal reset password");
      }
      const data = await res.json();
      setResetResult({ id, password: data.tempPassword });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal reset password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {error ? (
        <p className="login-error" role="alert" style={{ marginBottom: 12 }}>
          {error}
        </p>
      ) : null}

      <div className="review-table">
        <div className="review-table__head" role="row">
          <span>Nama &amp; Email</span>
          <span>Role</span>
          <span>Mentor Track</span>
          <span>Terdaftar</span>
          <span>Aksi</span>
        </div>
        {users.length === 0 ? (
          <div className="catalog-empty">
            <p>Tidak ada user untuk filter ini.</p>
          </div>
        ) : (
          users.map((u) => {
            const isEditing = editingId === u.id;
            const mentorLabel = u.mentorSlug
              ? mentorOptions.find((m) => m.slug === u.mentorSlug)?.name ?? u.mentorSlug
              : "—";
            return (
              <div className="review-table__row" role="row" key={u.id}>
                <span className="review-table__student">
                  <span>
                    <strong>{u.name}</strong>
                    <small>{u.email}</small>
                  </span>
                </span>
                <span>
                  {isEditing ? (
                    <select
                      className="form-input"
                      value={draftRole}
                      onChange={(e) => setDraftRole(e.target.value as AdminUser["role"])}
                      style={{ minWidth: 120 }}
                    >
                      <option value="student">Student</option>
                      <option value="tutor">Tutor</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span className={`review-status review-status--${u.role === "admin" ? "approved" : u.role === "tutor" ? "reviewing" : "submitted"}`}>
                      {ROLE_LABEL[u.role]}
                    </span>
                  )}
                </span>
                <span>
                  {isEditing && draftRole === "tutor" ? (
                    <select
                      className="form-input"
                      value={draftMentor}
                      onChange={(e) => setDraftMentor(e.target.value)}
                      style={{ minWidth: 180 }}
                    >
                      <option value="">— pilih track —</option>
                      {mentorOptions.map((m) => (
                        <option key={m.slug} value={m.slug}>
                          {m.name} ({m.track})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <small style={{ color: "var(--muted)" }}>{mentorLabel}</small>
                  )}
                </span>
                <span>
                  <small style={{ color: "var(--muted)" }}>{formatDate(u.createdAt)}</small>
                </span>
                <span className="review-table__actions" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        className="button button--primary button--sm"
                        onClick={() => saveEdit(u.id)}
                        disabled={saving}
                      >
                        {saving ? "Menyimpan…" : "Simpan"}
                        <CheckIcon size={12} />
                      </button>
                      <button
                        type="button"
                        className="button button--secondary button--sm"
                        onClick={cancelEdit}
                        disabled={saving}
                      >
                        Batal
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="button button--secondary button--sm"
                        onClick={() => startEdit(u)}
                      >
                        Edit
                        <ArrowRightIcon size={12} />
                      </button>
                      <button
                        type="button"
                        className="button button--ghost button--sm"
                        onClick={() => resetPassword(u.id)}
                        disabled={saving}
                        title="Reset password (password baru akan muncul sekali)"
                      >
                        Reset PW
                      </button>
                    </>
                  )}
                  {resetResult?.id === u.id ? (
                    <div
                      style={{
                        flexBasis: "100%",
                        marginTop: 6,
                        padding: "6px 10px",
                        borderRadius: 8,
                        background: "rgba(24, 194, 156, 0.08)",
                        border: "1px solid rgba(24, 194, 156, 0.28)",
                        fontSize: "0.82rem",
                      }}
                    >
                      Password baru: <code style={{ background: "#fff", padding: "2px 6px", borderRadius: 4 }}>{resetResult.password}</code>
                      — salin sekarang, akan hilang setelah refresh halaman.
                    </div>
                  ) : null}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
