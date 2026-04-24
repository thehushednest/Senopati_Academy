import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Daftar prefix yang membutuhkan autentikasi. Halaman publik (/, /home, /modul, /login,
// /daftar, /mulai, /tentang, /blog, /api/auth/*, /verify/*) tetap bebas akses.
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/progress",
  "/belajar",
  "/kelas",
  "/referral",
  "/onboarding",
  "/perpustakaan",
  "/rekaman",
  "/live-session",
  "/akun",
];

const TUTOR_PREFIXES = ["/tutor"];
const ADMIN_PREFIXES = ["/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const requiresAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const requiresTutor = TUTOR_PREFIXES.some((p) => pathname.startsWith(p));
  const requiresAdmin = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));

  if (!requiresAuth && !requiresTutor && !requiresAdmin) return NextResponse.next();

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (requiresTutor && token.role !== "tutor" && token.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (requiresAdmin && token.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Cocokkan semua route selain static assets, api, dan _next.
  matcher: ["/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|assets).*)"],
};
