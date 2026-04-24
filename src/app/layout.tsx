import type { Metadata, Viewport } from "next";
import { getServerSession } from "next-auth";
import { AuthProvider } from "./_components/AuthProvider";
import { SiteFooter } from "./_components/SiteFooter";
import { SiteHeader } from "./_components/SiteHeader";
import { authOptions } from "../lib/auth";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://asksenopati.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Senopati Academy — Belajar AI & Keamanan Siber",
    template: "%s · Senopati Academy",
  },
  description:
    "Platform pembelajaran Computer Science berbasis web untuk remaja SMA Indonesia. Modul AI, Keamanan Siber, dan modul interaktif berbasis cerita — dalam bahasa Indonesia.",
  keywords: [
    "Senopati Academy",
    "belajar AI",
    "keamanan siber",
    "literasi digital",
    "pelajar SMA",
    "kursus online Indonesia",
  ],
  authors: [{ name: "Senopati Strategic Institute" }],
  openGraph: {
    type: "website",
    siteName: "Senopati Academy",
    title: "Senopati Academy — Belajar AI & Keamanan Siber",
    description:
      "Platform pembelajaran AI dan Keamanan Siber untuk pelajar SMA Indonesia. Mode belajar mandiri, kelas live, dan modul interaktif bercabang.",
    url: siteUrl,
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "Senopati Academy",
    description:
      "Platform pembelajaran AI dan Keamanan Siber untuk pelajar SMA Indonesia.",
  },
  alternates: {
    canonical: `${siteUrl}/home`,
  },
};

export const viewport: Viewport = {
  themeColor: "#18c29c",
  width: "device-width",
  initialScale: 1
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="id">
      <body>
        <AuthProvider session={session}>
          <SiteHeader />
          {children}
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
