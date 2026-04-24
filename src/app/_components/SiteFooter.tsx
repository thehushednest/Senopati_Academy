import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer" aria-label="Footer">
      <div className="container">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <Link className="brand" href="/home" aria-label="Senopati Academy">
              <span className="brand__mark">
                <Image
                  src="/assets/Senopati-Academy-Logo.png"
                  alt=""
                  width={96}
                  height={96}
                />
              </span>
              <span className="brand__label">
                <strong>Senopati Academy</strong>
                <small>Belajar AI, Siap Hadapi Masa Depan</small>
              </span>
            </Link>
            <p>
              Platform belajar AI untuk pelajar Indonesia — 25 modul terstruktur yang dirancang
              supaya kamu paham, bisa, dan berani mencoba.
            </p>
            <div className="socials" aria-label="Sosial media">
              <a href="https://twitter.com" aria-label="Twitter" rel="noreferrer noopener" target="_blank">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2H21l-6.52 7.45L22 22h-6.828l-4.77-6.23L4.8 22H2l7.04-8.05L2 2h6.96l4.32 5.71zM16.86 20h1.876L7.27 4H5.28z" />
                </svg>
              </a>
              <a href="https://linkedin.com" aria-label="LinkedIn" rel="noreferrer noopener" target="_blank">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5zM3 9.5h4V21H3zM10 9.5h3.8v1.57h.05c.53-.96 1.82-1.97 3.75-1.97 4 0 4.74 2.47 4.74 5.68V21h-4v-5.57c0-1.33-.02-3.04-1.97-3.04-1.98 0-2.28 1.47-2.28 2.94V21h-4z" />
                </svg>
              </a>
              <a href="https://instagram.com" aria-label="Instagram" rel="noreferrer noopener" target="_blank">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href="https://youtube.com" aria-label="YouTube" rel="noreferrer noopener" target="_blank">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M23.5 6.2a3 3 0 0 0-2.11-2.12C19.55 3.58 12 3.58 12 3.58s-7.55 0-9.39.5A3 3 0 0 0 .5 6.2C0 8 0 12 0 12s0 4 .5 5.8a3 3 0 0 0 2.11 2.12c1.84.5 9.39.5 9.39.5s7.55 0 9.39-.5A3 3 0 0 0 23.5 17.8C24 16 24 12 24 12s0-4-.5-5.8zM9.6 15.57V8.43L15.82 12z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="site-footer__col">
            <h4>Program</h4>
            <ul>
              <li><Link href="/home#catalog">Semua program</Link></li>
              <li><Link href="/home#categories">Kategori</Link></li>
              <li><Link href="/home#featured-course">Program unggulan</Link></li>
              <li><Link href="/home#spotlight">Modul Terbaru</Link></li>
            </ul>
          </div>

          <div className="site-footer__col">
            <h4>Senopati</h4>
            <ul>
              <li><a href="https://asksenopati.com">Beranda</a></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><a href="mailto:halo@asksenopati.com">Kontak</a></li>
              <li><Link href="/home#experience">Tentang</Link></li>
            </ul>
          </div>

          <div className="site-footer__col subscribe">
            <h4>Newsletter</h4>
            <p>Dapat info modul baru, tips belajar AI, dan konten eksklusif langsung ke emailmu. Gratis.</p>
            <form className="subscribe__form" action="#" method="post" aria-label="Subscribe newsletter">
              <label htmlFor="subscribe-email" className="visually-hidden" style={{ position: "absolute", left: "-9999px" }}>
                Email
              </label>
              <input id="subscribe-email" type="email" name="email" placeholder="email@domain.com" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>

        <div className="site-footer__bottom">
          <span>© {new Date().getFullYear()} Senopati Academy. Semua hak dilindungi.</span>
          <div style={{ display: "flex", gap: "18px", flexWrap: "wrap" }}>
            <Link href="/home#privacy">Privacy</Link>
            <Link href="/home#terms">Terms</Link>
            <Link href="/home#cookies">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
