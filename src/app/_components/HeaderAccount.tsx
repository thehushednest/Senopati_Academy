"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";

const ROLE_LABEL: Record<"student" | "tutor" | "admin", string> = {
  student: "Pelajar",
  tutor: "Tutor",
  admin: "Admin",
};

type Props = {
  onNavigate?: () => void;
};

export function HeaderAccount({ onNavigate }: Props) {
  const { user, isHydrated, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  const handleItemClick = () => {
    setOpen(false);
    onNavigate?.();
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
    onNavigate?.();
    router.push("/home");
  };

  if (!isHydrated) {
    return (
      <span
        className="button button--primary button--sm site-header__cta"
        style={{ opacity: 0.6 }}
      >
        ···
      </span>
    );
  }

  if (!user) {
    return (
      <>
        <Link
          href="/login"
          className="button button--ghost button--sm site-header__login"
          onClick={onNavigate}
        >
          Masuk
        </Link>
        <Link
          className="button button--primary button--sm site-header__cta"
          href="/daftar"
          onClick={onNavigate}
        >
          Daftar Sekarang
        </Link>
      </>
    );
  }

  return (
    <div className="account-menu" ref={wrapperRef}>
      <button
        type="button"
        className="account-menu__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="account-menu__avatar" aria-hidden="true">
          {user.initials}
        </span>
        <span className="account-menu__meta">
          <strong>{user.name.split(" ")[0]}</strong>
          <small>{ROLE_LABEL[user.role]}</small>
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ marginLeft: 4, opacity: 0.6, transform: open ? "rotate(180deg)" : undefined, transition: "transform 0.2s ease" }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open ? (
        <div className="account-menu__panel" role="menu">
          <div className="account-menu__header">
            <span className="account-menu__avatar account-menu__avatar--lg" aria-hidden="true">
              {user.initials}
            </span>
            <div>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>
          <Link role="menuitem" href="/dashboard" onClick={handleItemClick}>
            Dashboard
          </Link>
          <Link role="menuitem" href="/progress" onClick={handleItemClick}>
            Progress
          </Link>
          <Link role="menuitem" href="/modul" onClick={handleItemClick}>
            Katalog Modul
          </Link>
          <Link role="menuitem" href="/akun" onClick={handleItemClick}>
            Akun &amp; Password
          </Link>
          <Link role="menuitem" href="/onboarding/profil" onClick={handleItemClick}>
            Profil Belajar
          </Link>
          <Link role="menuitem" href="/referral" onClick={handleItemClick}>
            Ajak Teman
          </Link>
          <button
            type="button"
            role="menuitem"
            className="account-menu__logout"
            onClick={handleLogout}
          >
            Keluar
          </button>
        </div>
      ) : null}
    </div>
  );
}
