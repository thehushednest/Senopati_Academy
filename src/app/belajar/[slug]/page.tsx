import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  LevelIcon,
  MessageIcon,
  PenIcon,
  PlayIcon
} from "../../_components/Icon";
import { LearningTabs } from "../../_components/LearningTabs";
import { ProgressRing } from "../../_components/ProgressRing";
import {
  buildSessions,
  findCategory,
  findMentor,
  findModule,
  MODULES
} from "../../../lib/content";
import { resolveModuleProgress } from "../../../lib/progress-server";

export function generateStaticParams() {
  return MODULES.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const mod = findModule(slug);
  if (!mod) return { title: "Modul tidak ditemukan" };
  return {
    title: `Belajar: ${mod.title}`,
    description: mod.excerpt,
    robots: { index: false, follow: false },
    alternates: { canonical: `/belajar/${mod.slug}` }
  };
}

export default async function ActiveModulePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mod = findModule(slug);
  if (!mod) notFound();

  const progress = await resolveModuleProgress(mod.slug);
  const category = findCategory(mod.categorySlug);
  const mentor = findMentor(mod.mentorSlug);
  const sessions = buildSessions(mod, progress?.completed ?? 0);
  const percent = progress?.percent ?? 0;

  return (
    <main className="academy-shell learning-shell">
      <div className="container">
        <section className="learn-header" aria-label="Header modul">
          <nav className="detail-breadcrumb" aria-label="Breadcrumb">
            <Link href="/dashboard">Dashboard</Link>
            <span>/</span>
            <Link href="/modul">Modul</Link>
            <span>/</span>
            <span>{category?.name}</span>
          </nav>
          <div className="learn-header__top">
            <div>
              <p className="eyebrow eyebrow--brand">Modul Aktif</p>
              <h1>{mod.title}</h1>
              <p className="lede" style={{ marginTop: 10 }}>{mod.excerpt}</p>
              <div className="learn-header__meta">
                <span>
                  <LevelIcon size={14} /> {mod.level}
                </span>
                <span>
                  <ClockIcon size={14} /> {mod.duration}
                </span>
                <span>{mod.topics} Topik</span>
                {mentor ? <span>Mentor: {mentor.name}</span> : null}
              </div>
            </div>
            <ProgressRing value={percent} label="Progress" />
          </div>
          <LearningTabs moduleSlug={mod.slug} />
        </section>

        <section aria-label="Daftar sesi">
          <div className="section-heading">
            <p className="eyebrow">Daftar Sesi</p>
            <h2>Ikuti alurnya dari sesi 01 sampai selesai</h2>
          </div>
          <ol className="session-list">
            {sessions.map((session) => {
              const statusLabel =
                session.status === "done"
                  ? "Selesai"
                  : session.status === "active"
                  ? "Sedang dikerjakan"
                  : "Belum dibuka";
              const StatusIcon =
                session.status === "done"
                  ? CheckIcon
                  : session.status === "active"
                  ? PlayIcon
                  : ClockIcon;
              return (
                <li key={session.index} className={`session-row session-row--${session.status}`}>
                  <span className="session-row__marker">
                    <StatusIcon size={16} />
                  </span>
                  <div className="session-row__body">
                    <strong>
                      Sesi {String(session.index + 1).padStart(2, "0")} · {session.title}
                    </strong>
                    <p>{session.summary}</p>
                    <div className="session-row__meta">
                      <span>{session.durationMinutes} menit</span>
                      <span>{statusLabel}</span>
                    </div>
                  </div>
                  <div className="session-row__actions">
                    {session.status !== "locked" ? (
                      <Link
                        className={
                          "button button--sm " +
                          (session.status === "active" ? "button--primary" : "button--secondary")
                        }
                        href={`/belajar/${mod.slug}/sesi/${session.index}`}
                      >
                        {session.status === "done" ? "Review" : "Mulai"}
                        <ArrowRightIcon size={14} />
                      </Link>
                    ) : (
                      <span className="session-row__locked">Terkunci</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section aria-label="Shortcut modul">
          <div className="learn-shortcuts">
            <Link href={`/belajar/${mod.slug}/diskusi`} className="learn-shortcut">
              <MessageIcon size={18} />
              <div>
                <strong>Diskusi Modul</strong>
                <span>Tanya & jawab dengan peserta lain.</span>
              </div>
            </Link>
            <Link href={`/belajar/${mod.slug}/catatan`} className="learn-shortcut">
              <PenIcon size={18} />
              <div>
                <strong>Catatan Pribadi</strong>
                <span>Catat insight tiap sesi secara bebas.</span>
              </div>
            </Link>
            <Link
              href={`/belajar/${mod.slug}/sesi/${(progress?.completed ?? 0)}/tugas`}
              className="learn-shortcut"
            >
              <CheckIcon size={18} />
              <div>
                <strong>Tugas Praktik</strong>
                <span>Kirim tugas challenge untuk review mentor.</span>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
