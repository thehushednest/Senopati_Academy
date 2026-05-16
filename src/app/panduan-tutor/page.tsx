import type { Metadata } from "next";
import { PanduanTutorPlayer } from "./PanduanTutorPlayer";
import "./panduan-tutor.css";

export const metadata: Metadata = {
  title: "Panduan Tutor — Senopati Academy",
  description:
    "Walkthrough lengkap fitur tutor Senopati Academy bersama Elsya, pemandu virtual. 12 chapter, ~8 menit. Tidak perlu login untuk menonton.",
  alternates: { canonical: "/panduan-tutor" },
  openGraph: {
    title: "Panduan Tutor — Senopati Academy",
    description: "12 chapter walkthrough fitur tutor bersama Elsya.",
    type: "video.other",
  },
  robots: { index: true, follow: true },
};

export default function PanduanTutorPage() {
  return <PanduanTutorPlayer />;
}
