import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightIcon,
  BookIcon,
  CheckIcon,
  CompassIcon,
  MessageIcon,
  SparklesIcon,
  UsersIcon
} from "../_components/Icon";
import { MENTORS } from "../../lib/content";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Senopati Academy adalah platform belajar AI untuk pelajar Indonesia — lahir dari riset AI Literacy Senopati Strategic Institute.",
  alternates: { canonical: "/tentang" }
};

const VALUES = [
  {
    Icon: SparklesIcon,
    title: "Literasi dulu, skill kemudian",
    desc: "Kami percaya paham 'kenapa' lebih penting dari paham 'bagaimana'. Semua modul kami mulai dari literasi sebelum masuk teknik."
  },
  {
    Icon: UsersIcon,
    title: "Dirancang untuk Indonesia",
    desc: "Contoh, studi kasus, dan konteks bahasa kami sesuaikan dengan realita pelajar Indonesia — bukan sekadar terjemahan materi luar."
  },
  {
    Icon: MessageIcon,
    title: "Bisa dipraktikkan hari itu juga",
    desc: "Setiap modul punya challenge langsung. Nggak ada teori yang cuma dibaca lalu dilupakan."
  },
  {
    Icon: CheckIcon,
    title: "Etika jadi bagian utama",
    desc: "Kami nggak cuma ngajarin cara pakai AI, tapi juga kapan harus hati-hati, kenali bias, dan jaga privasi data."
  }
];

const MILESTONES = [
  {
    year: "2024",
    title: "Riset AI Literacy dimulai",
    desc: "Senopati Strategic Institute meluncurkan program riset literasi AI untuk pelajar Indonesia."
  },
  {
    year: "2025",
    title: "Pilot kurikulum 25 modul",
    desc: "Kurikulum awal diuji bersama komunitas pelajar SMP, SMA, dan mahasiswa di beberapa kota."
  },
  {
    year: "2026",
    title: "Senopati Academy resmi launch",
    desc: "Platform ini resmi dibuka untuk umum. Fokus awal: literasi dasar AI untuk semua level pelajar."
  },
  {
    year: "Selanjutnya",
    title: "Ekspansi modul & komunitas",
    desc: "Menambah modul Advanced, Teaching Track, dan program ambassador untuk penggerak literasi AI lokal."
  }
];

export default function TentangPage() {
  return (
    <main className="academy-shell">
      <div className="container">
        <section className="lp-hero" aria-label="Tentang Senopati Academy">
          <p className="eyebrow eyebrow--brand">Tentang Kami</p>
          <h1 className="lp-hero__title">
            Platform belajar AI untuk pelajar Indonesia —{" "}
            <span className="highlight-text">dari riset, bukan hype</span>.
          </h1>
          <p className="lede lp-hero__lede">
            Senopati Academy dibangun untuk menjawab pertanyaan sederhana: bagaimana cara pelajar
            Indonesia memahami AI sebelum terlambat? Kurikulum kami lahir dari program riset
            Senopati Strategic Institute soal literasi AI.
          </p>
        </section>

        <section aria-label="Misi kami">
          <div className="about-split">
            <div>
              <p className="eyebrow eyebrow--brand">Misi</p>
              <h2>Buat literasi AI bisa diakses siapa saja — apapun background-nya.</h2>
              <p style={{ marginTop: 16, color: "var(--muted)", lineHeight: 1.75 }}>
                AI akan mempengaruhi hampir semua aspek hidup: sekolah, kerja, hubungan sosial,
                sampai cara kita cari informasi. Kalau literasi AI cuma milik segelintir orang, gap
                pengetahuan akan jadi gap peluang. Kami nggak mau itu terjadi di generasi pelajar
                Indonesia hari ini.
              </p>
              <p style={{ marginTop: 12, color: "var(--muted)", lineHeight: 1.75 }}>
                Makanya kami rancang 25 modul yang bisa dicerna pelajar SMP, SMA, mahasiswa, bahkan
                guru — dengan fondasi yang sama, tapi jalur yang berbeda sesuai kebutuhan.
              </p>
            </div>
            <div>
              <p className="eyebrow">Visi</p>
              <h2>Indonesia yang punya generasi melek AI — siap beradaptasi, bukan ditinggalkan.</h2>
              <p style={{ marginTop: 16, color: "var(--muted)", lineHeight: 1.75 }}>
                Kami membayangkan 5 tahun ke depan: pelajar Indonesia yang tahu cara memakai AI
                untuk mempercepat belajar, mengenali bias saat AI jawab, dan berani membuat tools AI
                sendiri untuk masalah di komunitasnya.
              </p>
              <p style={{ marginTop: 12, color: "var(--muted)", lineHeight: 1.75 }}>
                Itu bukan visi yang muluk. Itu base line yang kami percaya harus dicapai.
              </p>
            </div>
          </div>
        </section>

        <section aria-label="Nilai kami">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Nilai Kami</p>
            <h2>4 prinsip yang mengarahkan setiap modul yang kami buat</h2>
          </div>
          <div className="lp-benefit-grid">
            {VALUES.map(({ Icon, title, desc }) => (
              <article className="lp-benefit-card" key={title}>
                <span className="lp-benefit-card__icon">
                  <Icon size={22} />
                </span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-label="Koneksi dengan Senopati Strategic Institute">
          <div className="about-institute">
            <div className="about-institute__copy">
              <p className="eyebrow eyebrow--brand">Koneksi Kami</p>
              <h2>Lahir dari Senopati Strategic Institute</h2>
              <p style={{ marginTop: 12, color: "var(--muted)", lineHeight: 1.75 }}>
                Senopati Academy bukan proyek yang berdiri sendiri. Ia merupakan lengan edukasi dari
                program riset AI Literacy yang dikembangkan Senopati Strategic Institute sejak 2024.
              </p>
              <p style={{ marginTop: 12, color: "var(--muted)", lineHeight: 1.75 }}>
                Artinya: setiap modul yang kami buat punya rujukan riset yang dapat ditelusuri, dan
                kurikulumnya selalu diuji ulang berdasarkan temuan lapangan dari sekolah dan
                komunitas yang kami dampingi.
              </p>
              <div style={{ marginTop: 18 }}>
                <Link className="button button--secondary" href="https://asksenopati.com">
                  Kunjungi Senopati
                  <ArrowRightIcon size={16} />
                </Link>
              </div>
            </div>
            <ul className="about-institute__list">
              <li>
                <CompassIcon size={18} />
                <div>
                  <strong>Riset AI Literacy</strong>
                  <span>Program riset berlanjut sejak 2024 tentang literasi AI di Indonesia.</span>
                </div>
              </li>
              <li>
                <BookIcon size={18} />
                <div>
                  <strong>25 modul berbasis kurikulum resmi</strong>
                  <span>Struktur kurikulum diturunkan dari framework AI Literacy Senopati.</span>
                </div>
              </li>
              <li>
                <UsersIcon size={18} />
                <div>
                  <strong>Jaringan praktisi & akademisi</strong>
                  <span>Mentor kami datang dari ekosistem yang sama dengan Senopati News & Policy Lab.</span>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <section aria-label="Tim mentor">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Tim Mentor</p>
            <h2>Dijalankan oleh tim yang memang bekerja dengan AI setiap hari</h2>
          </div>
          <div className="mentor-grid">
            {MENTORS.map((mentor) => (
              <Link
                href={`/mentor/${mentor.slug}`}
                className="mentor-card"
                key={mentor.slug}
              >
                <span className="mentor-card__avatar">{mentor.initials}</span>
                <h3>{mentor.name}</h3>
                <p className="mentor-card__role">{mentor.role}</p>
                <p className="mentor-card__headline">{mentor.headline}</p>
                <span className="mentor-card__cta">
                  Lihat profil
                  <ArrowRightIcon size={14} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section aria-label="Timeline">
          <div className="section-heading section-heading--center">
            <p className="eyebrow eyebrow--brand">Perjalanan</p>
            <h2>Milestone yang sudah dan akan kami lewati bersama</h2>
          </div>
          <ol className="timeline">
            {MILESTONES.map((item) => (
              <li className="timeline__item" key={item.year}>
                <span className="timeline__year">{item.year}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-label="Call to action">
          <div className="cta-banner">
            <div>
              <p className="eyebrow">Mulai Sekarang</p>
              <h2>Kenalan lebih dekat lewat modul, bukan cuma halaman tentang kami.</h2>
              <p className="lede" style={{ marginTop: 12 }}>
                Cara paling cepat memahami visi kami ya dengan ikut satu modul. Mulai dari
                Foundations — gratis dicoba 10 menit pertama.
              </p>
            </div>
            <div className="cta-banner__actions">
              <Link className="button button--accent" href="/modul">
                Lihat Semua Modul
                <ArrowRightIcon size={16} />
              </Link>
              <Link className="button button--ghost" href="/mulai">
                Daftar Sekarang
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
