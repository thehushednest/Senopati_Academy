"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HeaderAccount } from "./HeaderAccount";
import { CartIcon, SearchIcon } from "./Icon";

type SiteHeaderProps = {
  variant?: "home" | "detail";
};

export function SiteHeader({ variant = "home" }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <header
      className={`site-header${open ? " site-header--open" : ""}`}
      aria-label="Navigasi utama"
      data-menu-open={open}
    >
      <Link
        className="brand"
        href="/home"
        aria-label="Senopati Academy — beranda"
        onClick={closeMenu}
      >
        <span className="brand__mark">
          <Image
            src="/assets/Senopati-Academy-Logo.png"
            alt=""
            width={96}
            height={96}
            priority
          />
        </span>
        <span className="brand__label">
          <strong>Senopati Academy</strong>
          <small>
            {variant === "detail" ? "Detail Program" : "Belajar AI, Siap Hadapi Masa Depan"}
          </small>
        </span>
      </Link>

      <nav className="site-nav" aria-label="Menu" data-open={open}>
        <Link href="/home#catalog" onClick={closeMenu}>Program</Link>
        <Link href="/home#categories" onClick={closeMenu}>Kategori</Link>
        <Link href="/home#experience" onClick={closeMenu}>Keunggulan</Link>
        <Link href="/home#spotlight" onClick={closeMenu}>Unggulan</Link>
        <Link href="/blog" onClick={closeMenu}>
          Majalah
        </Link>
      </nav>

      <div className="site-header__actions">
        <button
          className="icon-button site-header__search"
          type="button"
          aria-label="Cari program"
        >
          <SearchIcon size={18} />
        </button>
        <button
          className="icon-button site-header__cart"
          type="button"
          aria-label="Keranjang"
        >
          <CartIcon size={18} />
        </button>
        <HeaderAccount onNavigate={closeMenu} />
        <button
          className="icon-button site-header__toggle"
          type="button"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            width="18"
            height="18"
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
      </div>

      {open ? (
        <div
          className="site-header__backdrop"
          aria-hidden="true"
          onClick={closeMenu}
        />
      ) : null}
    </header>
  );
}
