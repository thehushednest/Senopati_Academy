"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { useAuth } from "./AuthProvider";
import {
  BookIcon,
  BookOpenIcon,
  ChartIcon,
  CheckIcon,
  ClipboardIcon,
  ClockIcon,
  FolderIcon,
  GlobeIcon,
  GraduateIcon,
  LibraryIcon,
  MessageIcon,
  PenIcon,
  PlayIcon,
  PresentIcon,
  SettingsIcon,
  ShieldIcon,
  SparklesIcon,
  TargetIcon,
  TrophyIcon,
  UserIcon,
  UsersIcon,
  VideoIcon,
  WalletIcon
} from "./Icon";
import { LogoutButton } from "./LogoutButton";

type IconType = ComponentType<{ size?: number }>;

type LeafItem = {
  kind: "leaf";
  label: string;
  href: string;
  Icon: IconType;
};

type GroupItem = {
  kind: "group";
  id: string;
  label: string;
  Icon: IconType;
  children: LeafItem[];
};

type NavItem = LeafItem | GroupItem;

const STUDENT_NAV: NavItem[] = [
  { kind: "leaf", label: "Dashboard", href: "/dashboard", Icon: PresentIcon },
  {
    kind: "group",
    id: "belajar",
    label: "Belajar",
    Icon: BookIcon,
    children: [
      { kind: "leaf", label: "Kelas Aktif", href: "/kelas", Icon: BookIcon },
      { kind: "leaf", label: "Live Session", href: "/live-session", Icon: PlayIcon },
      { kind: "leaf", label: "Modul Mandiri", href: "/belajar-mandiri", Icon: BookOpenIcon },
      { kind: "leaf", label: "Perpustakaan", href: "/perpustakaan", Icon: LibraryIcon }
    ]
  },
  {
    kind: "group",
    id: "simulasi",
    label: "Simulasi & Permainan",
    Icon: ClipboardIcon,
    children: [
      { kind: "leaf", label: "Simulasi IELTS", href: "/karir/ielts", Icon: BookOpenIcon },
      { kind: "leaf", label: "Cerita Interaktif", href: "/cerita", Icon: BookOpenIcon }
    ]
  },
  {
    kind: "group",
    id: "lab-ai",
    label: "Laboratorium AI",
    Icon: SparklesIcon,
    children: [
      { kind: "leaf", label: "Analisis Gambar AI", href: "/lab/deepfake", Icon: SparklesIcon },
      { kind: "leaf", label: "Generator Video AI", href: "/lab/wan-video", Icon: VideoIcon }
    ]
  },
  {
    kind: "group",
    id: "pencapaian",
    label: "Pencapaian",
    Icon: TrophyIcon,
    children: [
      { kind: "leaf", label: "Skor Belajarku", href: "/siswa/skor", Icon: TargetIcon },
      { kind: "leaf", label: "Papan Skor", href: "/siswa/papan", Icon: TrophyIcon }
    ]
  },
  { kind: "leaf", label: "Eksplorasi Karir", href: "/karir", Icon: GraduateIcon },
  { kind: "leaf", label: "Catatan Keuanganku", href: "/keuangan", Icon: WalletIcon },
  { kind: "leaf", label: "Pesan", href: "/pesan", Icon: MessageIcon },
  { kind: "leaf", label: "Profil Saya", href: "/siswa/profil", Icon: UserIcon }
];

// Feature flag — set NEXT_PUBLIC_REVIEW_ENABLED=true di env untuk aktifkan
// kembali. Default off untuk Paham AI launch karena belum dipakai.
const REVIEW_ENABLED = process.env.NEXT_PUBLIC_REVIEW_ENABLED === "true";

const TUTOR_NAV: NavItem[] = [
  { kind: "leaf", label: "Dashboard", href: "/dashboard", Icon: PresentIcon },
  { kind: "leaf", label: "Modul Saya", href: "/tutor/modul", Icon: BookIcon },
  { kind: "leaf", label: "Bahan Ajar", href: "/tutor/bahan-ajar", Icon: FolderIcon },
  ...(REVIEW_ENABLED
    ? [{ kind: "leaf" as const, label: "Review Tugas", href: "/tutor/review", Icon: CheckIcon }]
    : []),
  { kind: "leaf", label: "Review IELTS Writing", href: "/tutor/review/writing", Icon: PenIcon },
  { kind: "leaf", label: "Live Session", href: "/tutor/live", Icon: PlayIcon },
  { kind: "leaf", label: "Pesan", href: "/pesan", Icon: MessageIcon },
  { kind: "leaf", label: "Siswa & Diskusi", href: "/tutor/siswa", Icon: UsersIcon },
  { kind: "leaf", label: "Materi & Soal", href: "/tutor/materi", Icon: PenIcon },
  { kind: "leaf", label: "Analitik", href: "/tutor/analitik", Icon: ChartIcon },
  { kind: "leaf", label: "Cerita Interaktif", href: "/tutor/cerita", Icon: BookIcon },
  { kind: "leaf", label: "Generator Video AI", href: "/lab/wan-video", Icon: VideoIcon },
  { kind: "leaf", label: "AskSenopati App", href: "/asksenopati", Icon: MessageIcon },
  { kind: "leaf", label: "Profil Saya", href: "/tutor/profil", Icon: UserIcon },
  { kind: "leaf", label: "Panduan Tutor (Video)", href: "/panduan-tutor", Icon: PlayIcon }
];

const ADMIN_NAV: NavItem[] = [
  { kind: "leaf", label: "Dashboard", href: "/dashboard", Icon: PresentIcon },
  { kind: "leaf", label: "Overview Nasional", href: "/admin/overview", Icon: GlobeIcon },
  { kind: "leaf", label: "Pengguna", href: "/admin/pengguna", Icon: UsersIcon },
  {
    kind: "group",
    id: "admin-konten",
    label: "Konten Belajar",
    Icon: BookIcon,
    children: [
      { kind: "leaf", label: "Modul", href: "/admin/modul", Icon: BookIcon },
      { kind: "leaf", label: "Bahan Ajar", href: "/admin/bahan-ajar", Icon: FolderIcon },
      { kind: "leaf", label: "Konten Static", href: "/admin/konten", Icon: FolderIcon },
      { kind: "leaf", label: "Cerita Interaktif", href: "/admin/cerita", Icon: BookIcon },
      { kind: "leaf", label: "Panduan Karir", href: "/admin/panduan-karir", Icon: BookIcon },
      { kind: "leaf", label: "Panduan Kerja", href: "/admin/panduan-kerja", Icon: BookIcon },
      { kind: "leaf", label: "IELTS Tests", href: "/admin/ielts", Icon: PenIcon },
    ],
  },
  {
    kind: "group",
    id: "admin-karir",
    label: "Karir & Beasiswa",
    Icon: GraduateIcon,
    children: [
      { kind: "leaf", label: "Beasiswa", href: "/admin/beasiswa", Icon: GraduateIcon },
      { kind: "leaf", label: "Jurusan", href: "/admin/jurusan", Icon: BookOpenIcon },
    ],
  },
  {
    kind: "group",
    id: "admin-penilaian",
    label: "Penilaian & Sesi",
    Icon: ClipboardIcon,
    children: [
      { kind: "leaf", label: "Penilaian Tutor", href: "/admin/tutors", Icon: GraduateIcon },
      { kind: "leaf", label: "Penilaian Siswa", href: "/admin/siswa", Icon: ClipboardIcon },
      { kind: "leaf", label: "Live Events", href: "/admin/live-events", Icon: PresentIcon },
      { kind: "leaf", label: "Analitik Tugas", href: "/admin/analitik-tugas", Icon: ChartIcon },
      { kind: "leaf", label: "Sertifikat", href: "/admin/sertifikat", Icon: GraduateIcon },
    ],
  },
  {
    kind: "group",
    id: "admin-engagement",
    label: "Engagement",
    Icon: SparklesIcon,
    children: [
      { kind: "leaf", label: "Kupon Diskon", href: "/admin/kupon", Icon: WalletIcon },
      { kind: "leaf", label: "Referral", href: "/admin/referral", Icon: UsersIcon },
      { kind: "leaf", label: "Broadcast Notif", href: "/admin/notifikasi", Icon: MessageIcon },
    ],
  },
  {
    kind: "group",
    id: "admin-monitoring",
    label: "Monitoring AI",
    Icon: ChartIcon,
    children: [
      { kind: "leaf", label: "AskSenopati Monitor", href: "/admin/asksenopati", Icon: SparklesIcon },
      { kind: "leaf", label: "Lab Video Monitor", href: "/admin/lab-video", Icon: VideoIcon },
      { kind: "leaf", label: "Generator Video AI", href: "/lab/wan-video", Icon: VideoIcon },
    ],
  },
  {
    kind: "group",
    id: "admin-sistem",
    label: "Sistem",
    Icon: SettingsIcon,
    children: [
      { kind: "leaf", label: "Moderasi", href: "/admin/moderasi", Icon: ShieldIcon },
      { kind: "leaf", label: "Audit Log", href: "/admin/audit", Icon: ClockIcon },
      { kind: "leaf", label: "Scrape Manager", href: "/admin/scrape", Icon: GlobeIcon },
      { kind: "leaf", label: "Pengaturan", href: "/admin/pengaturan", Icon: SettingsIcon },
    ],
  },
];

const OPEN_GROUPS_KEY = "senopati:sidebar:open-groups";

function isLeafActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{
        transform: open ? "rotate(90deg)" : "rotate(0deg)",
        transition: "transform 0.18s ease"
      }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname() ?? "";
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  const role = user?.role ?? "student";
  const items = role === "tutor" ? TUTOR_NAV : role === "admin" ? ADMIN_NAV : STUDENT_NAV;
  const spaceLabel =
    role === "tutor" ? "Tutor Space" : role === "admin" ? "Admin Panel" : "Learning Space";
  const isStudent = role !== "tutor" && role !== "admin";

  // Groups containing the currently-active route — these auto-expand.
  const autoOpenGroupIds = useMemo(() => {
    const ids: string[] = [];
    for (const item of items) {
      if (item.kind === "group") {
        const hasActive = item.children.some((c) => isLeafActive(pathname, c.href));
        if (hasActive) ids.push(item.id);
      }
    }
    return ids;
  }, [items, pathname]);

  // Hydrate openGroups from localStorage + auto-open active groups.
  useEffect(() => {
    let stored: string[] = [];
    try {
      const raw = window.localStorage.getItem(OPEN_GROUPS_KEY);
      if (raw) stored = JSON.parse(raw) as string[];
    } catch {
      stored = [];
    }
    setOpenGroups(new Set([...stored, ...autoOpenGroupIds]));
  }, [autoOpenGroupIds]);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        window.localStorage.setItem(OPEN_GROUPS_KEY, JSON.stringify(Array.from(next)));
      } catch {
        /* ignore quota errors */
      }
      return next;
    });
  };

  // Body scroll lock saat drawer open di mobile
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Tutup drawer saat route berubah
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const closeDrawer = () => setOpen(false);

  const renderLeaf = (item: LeafItem, opts?: { nested?: boolean }) => {
    const active = isLeafActive(pathname, item.href);
    const { Icon } = item;
    return (
      <Link
        key={item.label}
        href={item.href}
        className={
          "dashboard-nav__item" +
          (active ? " dashboard-nav__item--active" : "") +
          (opts?.nested ? " dashboard-nav__item--nested" : "")
        }
        onClick={closeDrawer}
      >
        <Icon size={18} />
        <span>{item.label}</span>
      </Link>
    );
  };

  const renderGroup = (group: GroupItem) => {
    const isOpen = openGroups.has(group.id);
    const hasActiveChild = group.children.some((c) => isLeafActive(pathname, c.href));
    const { Icon } = group;
    return (
      <div
        key={group.id}
        className={
          "dashboard-nav__group" +
          (isOpen ? " dashboard-nav__group--open" : "") +
          (hasActiveChild ? " dashboard-nav__group--has-active" : "")
        }
      >
        <button
          type="button"
          className="dashboard-nav__group-header"
          aria-expanded={isOpen}
          onClick={() => toggleGroup(group.id)}
        >
          <Icon size={18} />
          <span>{group.label}</span>
          <ChevronIcon open={isOpen} />
        </button>
        {isOpen ? (
          <div className="dashboard-nav__group-children" role="group">
            {group.children.map((c) => renderLeaf(c, { nested: true }))}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <>
      {/* Toggle button — hanya muncul di mobile via CSS */}
      <button
        type="button"
        className="dashboard-sidebar-toggle"
        aria-label={open ? "Tutup menu" : "Buka menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          {open ? (
            <>
              <path d="M6 6l12 12" />
              <path d="M18 6 6 18" />
            </>
          ) : (
            <>
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </>
          )}
        </svg>
      </button>

      {/* Backdrop — hanya muncul di mobile saat open */}
      {open ? (
        <div
          className="dashboard-sidebar-backdrop"
          aria-hidden="true"
          onClick={closeDrawer}
        />
      ) : null}


      <aside
        className={
          "dashboard-app__sidebar" + (open ? " dashboard-app__sidebar--open" : "")
        }
        aria-label="Navigasi akademi"
      >
        <Link
          href="/dashboard"
          className="dashboard-app__brand"
          onClick={closeDrawer}
        >
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
          {items.map((item) =>
            item.kind === "group" ? renderGroup(item) : renderLeaf(item)
          )}
        </nav>
        <div className="dashboard-help">
          <span className="dashboard-help__badge">24/7</span>
          <strong>Butuh bantuan?</strong>
          <p>Tanya mentor atau support kapan saja lewat live chat.</p>
          <Link
            className="button button--secondary button--sm"
            href="mailto:halo@asksenopati.com?subject=Butuh%20bantuan%20-%20Senopati%20Academy"
            onClick={closeDrawer}
          >
            Hubungi Support
          </Link>
        </div>

        {isStudent ? (
          <Link
            href="/asksenopati"
            className="dashboard-nav__footer-link"
            onClick={closeDrawer}
          >
            <MessageIcon size={14} />
            <span>AskSenopati App</span>
          </Link>
        ) : null}

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
    </>
  );
}
