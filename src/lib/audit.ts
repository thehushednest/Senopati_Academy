import { prisma } from "./prisma";

type AuditInput = {
  actorId: string | null;
  action: string; // mis. "user.role_change", "user.password_reset", "thread.delete"
  target?: string | null; // mis. userId atau threadId yang terdampak
  meta?: Record<string, unknown> | null;
};

/**
 * Catat aksi admin-level ke audit_logs. Non-throw supaya kegagalan audit
 * tidak memblok aksi utama — tapi akan di-log ke stderr untuk inspection.
 */
export async function auditLog(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        target: input.target ?? null,
        metaJson: (input.meta ?? null) as never,
      },
    });
  } catch (err) {
    console.error("[auditLog] failed:", err);
  }
}
