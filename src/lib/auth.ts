import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "./prisma";
import type { Role } from "@prisma/client";

// Konsisten dengan PRD §14.3: password di-hash dengan argon2id/bcrypt.
// Kami pakai bcryptjs (pure JS) agar portabel di Next.js edge/node runtime.

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      avatarUrl: string | null;
    };
  }

  interface User {
    id: string;
    role?: Role;
    avatarUrl?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid: string;
    role: Role;
    avatarUrl?: string | null;
  }
}

const googleClientId = process.env.GOOGLE_CLIENT_ID ?? "";
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ?? "";

export const authOptions: NextAuthOptions = {
  // PrismaAdapter butuh tabel Account/Session/VerificationToken sudah migrasi.
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });
        if (!user || !user.passwordHash) return null;
        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl,
        };
      },
    }),
    ...(googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            // Siswa yang daftar via Google otomatis role=student.
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.uid = user.id;
        token.role = (user.role ?? "student") as Role;
        token.avatarUrl = user.avatarUrl ?? null;
      }
      // Refresh role dari DB bila session di-update (mis. admin ubah role).
      if (trigger === "update" && token.uid) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.uid },
          select: { role: true, avatarUrl: true, name: true, email: true },
        });
        if (fresh) {
          token.role = fresh.role;
          token.avatarUrl = fresh.avatarUrl ?? null;
          token.name = fresh.name;
          token.email = fresh.email;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        session.user.id = token.uid;
        session.user.role = token.role;
        session.user.avatarUrl = token.avatarUrl ?? null;
      }
      return session;
    },
    async signIn({ user, account }) {
      // OAuth Google: jika user baru, buat record dgn role default student
      if (account?.provider === "google" && user.email) {
        const existing = await prisma.user.findUnique({ where: { email: user.email } });
        if (!existing) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name ?? user.email.split("@")[0],
              avatarUrl: user.image ?? null,
              role: "student",
              emailVerified: new Date(),
            },
          });
        }
      }
      return true;
    },
  },
};

export function initialsOf(name: string | null | undefined) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}
