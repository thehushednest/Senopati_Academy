"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import {
  BookIcon,
  CheckIcon,
  ClockIcon,
  MessageIcon,
  PenIcon,
  PlayIcon,
  PresentIcon,
  SparklesIcon,
  UsersIcon
} from "./Icon";
import { LogoutButton } from "./LogoutButton";

const STUDENT_NAV = [
  { label: "Dashboard", href: "/dashboard", Icon: PresentIcon },
  { label: "Kelas Aktif", href: "/kelas", Icon: BookIcon },
  { label: "Live Session", href: "/live-session", Icon: PlayIcon },
  { label: "Rekaman Sesi", href: "/rekaman", Icon: ClockIcon },
  { label: "Perpustakaan", href: "/perpustakaan", Icon: SparklesIcon }
];

const TUTOR_NAV = [
  { label: "Dashboard", href: "/dashboard", Icon: PresentIcon },
  { label: "Modul Saya", href: "/tutor/modul", Icon: BookIcon },
  { label: "Review Tugas", href: "/tutor/review", Icon: CheckIcon },
  { label: "Live Session", href: "/tutor/live", Icon: PlayIcon },
  { label: "Siswa & Diskusi", href: "/tutor/siswa", Icon: UsersIcon },
  { label: "Materi & Soal", href: "/tutor/materi", Icon: PenIcon },
  { label: "Analitik", href: "/tutor/analitik", Icon: SparklesIcon }
];

const ADMIN_NAV = [
  { label: "Dashboard", href: "/dashboard", Icon: PresentIcon },
  { label: "Pengguna", href: "/admin/pengguna", Icon: UsersIcon },
  { label: "Konten", href: "/admin/konten", Icon: BookIcon },
  { label: "Moderasi", href: "/admin/moderasi", Icon: MessageIcon },
  { label: "Audit Log", href: "/admin/audit", Icon: ClockIcon },
  { label: "Pengaturan", href: "/admin/pengaturan", Icon: SparklesIcon }
];

export function DashboardSidebar() {
  const pathname = usePathname() ?? "";
  const { user } = useAuth();
  const role = user?.role ?? "student";
  const items = role === "tutor" ? TUTOR_NAV : role === "admin" ? ADMIN_NAV : STUDENT_NAV;
  const spaceLabel =
    role === "tutor" ? "Tutor Space" : role === "admin" ? "Admin Panel" : "Learning Space";

  return (
    <aside className="dashboard-app__sidebar" aria-label="Navigasi akademi">
      <Link href="/dashboard" className="dashboard-app__brand">
        <span className="dashboard-app__brand-mark">
          <Image
            src="/assets/Senopati-Academy-Logo.png"
            alt=""
            width={96}
            height={96}
          />
        </span>
        <div>
          <strong>Senopati Academy</strong>
          <small>{spaceLabel}</small>
        </div>
      </Link>
      <nav className="dashboard-nav" aria-label="Menu akademi">
        {items.map(({ label, href, Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={label}
              href={href}
              className={
                "dashboard-nav__item" + (active ? " dashboard-nav__item--active" : "")
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="dashboard-help">
        <span className="dashboard-help__badge">24/7</span>
        <strong>Butuh bantuan?</strong>
        <p>Tanya mentor atau support kapan saja lewat live chat.</p>
        <Link className="button button--secondary button--sm" href="#help">
          Hubungi Support
        </Link>
      </div>

      <LogoutButton className="dashboard-nav__logout">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Keluar dari akun
      </LogoutButton>
    </aside>
  );
}
