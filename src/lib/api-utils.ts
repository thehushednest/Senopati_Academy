import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { UnauthorizedError, ForbiddenError } from "./session";

export function jsonError(message: string, status: number, extra?: unknown) {
  return NextResponse.json({ error: message, ...(extra ? { detail: extra } : {}) }, { status });
}

export function handleApiError(err: unknown) {
  if (err instanceof UnauthorizedError) {
    return jsonError("Unauthorized", 401);
  }
  if (err instanceof ForbiddenError) {
    return jsonError("Forbidden", 403);
  }
  if (err instanceof ZodError) {
    return jsonError("Invalid request body", 400, err.issues);
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return jsonError("Duplicate entry", 409, { target: err.meta?.target });
    }
    if (err.code === "P2025") {
      return jsonError("Record not found", 404);
    }
  }
  console.error("[api] unhandled error:", err);
  return jsonError("Internal server error", 500);
}
