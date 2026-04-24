"use client";

import { useAuth } from "./AuthProvider";

type Props = {
  className?: string;
  label?: string;
  children?: React.ReactNode;
};

export function LogoutButton({
  className = "button button--secondary button--sm",
  label = "Keluar",
  children
}: Props) {
  const { logout } = useAuth();

  const handleClick = () => {
    if (window.confirm("Yakin ingin keluar dari Senopati Academy?")) {
      logout();
    }
  };

  return (
    <button type="button" className={className} onClick={handleClick}>
      {children ?? label}
    </button>
  );
}
