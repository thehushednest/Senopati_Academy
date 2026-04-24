"use client";

import { useAuth } from "./AuthProvider";

type Props = {
  fallback?: string;
};

export function UserName({ fallback = "[NAMA_PELAJAR]" }: Props) {
  const { user, isHydrated } = useAuth();
  if (!isHydrated) return <>{fallback}</>;
  return <>{user?.name ?? fallback}</>;
}

export function UserInitials({ fallback = "T" }: { fallback?: string }) {
  const { user, isHydrated } = useAuth();
  if (!isHydrated) return <>{fallback}</>;
  return <>{user?.initials ?? fallback}</>;
}
