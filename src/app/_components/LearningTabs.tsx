"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookIcon, MessageIcon, PenIcon, PresentIcon } from "./Icon";

type Props = {
  moduleSlug: string;
};

const TABS = [
  { key: "overview", label: "Sesi", href: "", icon: BookIcon },
  { key: "diskusi", label: "Diskusi", href: "/diskusi", icon: MessageIcon },
  { key: "catatan", label: "Catatan", href: "/catatan", icon: PenIcon },
  { key: "tugas", label: "Tugas", href: "/tugas", icon: PresentIcon }
];

export function LearningTabs({ moduleSlug }: Props) {
  const pathname = usePathname() ?? "";
  return (
    <nav className="learning-tabs" aria-label="Navigasi modul">
      {TABS.map(({ key, label, href, icon: Icon }) => {
        const target = `/belajar/${moduleSlug}${href}`;
        const isOverview = key === "overview";
        const isActive = isOverview
          ? pathname === target
          : pathname === target || pathname.startsWith(`${target}/`);
        return (
          <Link
            key={key}
            href={target}
            className={`learning-tabs__item${isActive ? " learning-tabs__item--active" : ""}`}
          >
            <Icon size={16} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
