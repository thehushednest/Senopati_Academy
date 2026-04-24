"use client";

import { SessionProvider, useSession, signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { useMemo } from "react";
import { initialsOf } from "../../lib/auth";

type AuthProviderProps = {
  children: React.ReactNode;
  session?: Session | null;
};

export function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionProvider session={session} refetchOnWindowFocus={false}>
      {children}
    </SessionProvider>
  );
}

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: "student" | "tutor" | "admin";
  avatarUrl: string | null;
  initials: string;
};

export function useAuth() {
  const { data, status, update } = useSession();

  const user: CurrentUser | null = useMemo(() => {
    if (!data?.user) return null;
    return {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role,
      avatarUrl: data.user.avatarUrl,
      initials: initialsOf(data.user.name).toUpperCase(),
    };
  }, [data]);

  return {
    user,
    isHydrated: status !== "loading",
    isAuthenticated: status === "authenticated",
    logout: () => signOut({ callbackUrl: "/home" }),
    refresh: update,
  };
}
