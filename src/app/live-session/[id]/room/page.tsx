import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/session";
import { findModule, modulesByMentor } from "../../../../lib/content";
import { PresenterRoom } from "../../../_components/PresenterRoom";
import { ViewerRoom } from "../../../_components/ViewerRoom";

export const metadata: Metadata = {
  title: "Slide Room — Senopati Academy",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function LiveRoomPage({ params }: PageProps) {
  const viewer = await getCurrentUser();
  if (!viewer) redirect("/login");

  const { id } = await params;
  const event = await prisma.liveEvent.findUnique({
    where: { id },
    include: { host: { select: { id: true, name: true } } },
  });
  if (!event) notFound();

  const isPresenter = viewer.role === "admin" || event.hostId === viewer.id;

  // Initial state untuk render server-side, supaya viewer langsung lihat slide
  // tanpa nunggu SSE round-trip pertama.
  let initialPdfUrl: string | null = null;
  let initialFilename: string | null = null;
  if (event.presentMaterialId) {
    const m = await prisma.sessionMaterial.findUnique({
      where: { id: event.presentMaterialId },
      select: { pdfUrl: true, pdfFilename: true },
    });
    initialPdfUrl = m?.pdfUrl ?? null;
    initialFilename = m?.pdfFilename ?? null;
  }

  // Materials yang tersedia untuk presenter — scoped ke modul event,
  // atau ke modul yang host ampu kalau platform-wide.
  let materials: Array<{
    id: string;
    title: string | null;
    pdfFilename: string;
    pdfUrl: string;
    moduleSlug: string;
    moduleTitle: string;
    sessionIndex: number;
  }> = [];
  if (isPresenter) {
    let allowedSlugs: string[] | null = null;
    if (event.moduleSlug) {
      allowedSlugs = [event.moduleSlug];
    } else if (viewer.role === "admin") {
      allowedSlugs = null; // all
    } else {
      const hostRecord = await prisma.user.findUnique({
        where: { id: event.hostId },
        select: { mentorSlug: true },
      });
      allowedSlugs = hostRecord?.mentorSlug
        ? modulesByMentor(hostRecord.mentorSlug).map((m) => m.slug)
        : [];
    }
    const rawMaterials = await prisma.sessionMaterial.findMany({
      where: allowedSlugs ? { moduleSlug: { in: allowedSlugs } } : {},
      orderBy: [{ moduleSlug: "asc" }, { sessionIndex: "asc" }],
      select: {
        id: true,
        title: true,
        pdfFilename: true,
        pdfUrl: true,
        moduleSlug: true,
        sessionIndex: true,
      },
      take: 200,
    });
    materials = rawMaterials.map((m) => ({
      ...m,
      moduleTitle: findModule(m.moduleSlug)?.title ?? m.moduleSlug,
    }));
  }

  const mod = event.moduleSlug ? findModule(event.moduleSlug) : null;

  return (
    <main className="academy-shell">
      <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
        <div style={{ marginBottom: 18 }}>
          <Link href="/live-session" style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
            ← Kembali ke daftar live session
          </Link>
        </div>

        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 18,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p className="eyebrow eyebrow--brand">Slide Room</p>
            <h1 style={{ margin: "4px 0 6px 0" }}>{event.title}</h1>
            <small style={{ color: "var(--muted)" }}>
              {mod ? mod.title : "Untuk semua peserta"} · oleh {event.host.name}
              {isPresenter ? " · kamu adalah presenter" : ""}
            </small>
          </div>
          {event.meetingUrl ? (
            <a
              href={event.meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="button button--ghost button--sm"
            >
              Buka meeting URL
            </a>
          ) : null}
        </header>

        {isPresenter ? (
          <PresenterRoom
            eventId={event.id}
            materials={materials}
            initialMaterialId={event.presentMaterialId}
            initialSlide={event.presentSlide}
            initialPdfUrl={initialPdfUrl}
          />
        ) : (
          <ViewerRoom
            eventId={event.id}
            initialState={{
              presenting: !!event.presentMaterialId,
              pdfUrl: initialPdfUrl,
              filename: initialFilename,
              slide: event.presentSlide,
            }}
          />
        )}
      </div>
    </main>
  );
}
