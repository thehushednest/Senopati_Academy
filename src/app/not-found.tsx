import Link from "next/link";

export default function NotFound() {
  return (
    <main className="academy-shell">
      <div className="container">
        <section className="card not-found" style={{ marginTop: 40 }}>
          <p className="eyebrow">404</p>
          <h1>Halaman tidak ditemukan</h1>
          <p className="lede" style={{ marginTop: 0 }}>
            Program atau halaman yang kamu tuju belum tersedia. Kembali ke beranda atau jelajahi
            katalog program yang sedang aktif.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <Link className="button button--primary" href="/home">
              Kembali ke beranda
            </Link>
            <Link className="button button--secondary" href="/home#catalog">
              Lihat katalog
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
