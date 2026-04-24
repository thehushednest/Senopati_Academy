import Link from "next/link";

type Props = {
  current: "akun" | "profil-belajar";
};

export function AccountNav({ current }: Props) {
  return (
    <nav className="account-nav" aria-label="Menu akun">
      <Link
        href="/akun"
        className={"account-nav__item" + (current === "akun" ? " account-nav__item--active" : "")}
      >
        Akun &amp; Password
      </Link>
      <Link
        href="/onboarding/profil"
        className={
          "account-nav__item" + (current === "profil-belajar" ? " account-nav__item--active" : "")
        }
      >
        Profil Belajar
      </Link>
    </nav>
  );
}
