"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  pdfUrl: string;
  slide: number;
  onTotalPages?: (n: number) => void;
};

type PDFPageProxy = {
  getViewport(params: { scale: number }): { width: number; height: number };
  render(params: {
    canvasContext: CanvasRenderingContext2D;
    viewport: { width: number; height: number };
  }): { promise: Promise<void> };
};
type PDFDocumentProxy = {
  numPages: number;
  getPage(pageNum: number): Promise<PDFPageProxy>;
};

// Cache pdfjs lib + doc per URL — re-use antar slide dan antar mount.
type PdfLib = {
  getDocument(args: { url: string }): { promise: Promise<PDFDocumentProxy> };
  GlobalWorkerOptions: { workerSrc: string };
};
let pdfLibPromise: Promise<PdfLib> | null = null;
const docCache = new Map<string, Promise<PDFDocumentProxy>>();

function loadPdfLib(): Promise<PdfLib> {
  if (!pdfLibPromise) {
    pdfLibPromise = import("pdfjs-dist").then((mod) => {
      const lib = mod as unknown as PdfLib;
      lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      return lib;
    });
  }
  return pdfLibPromise;
}

function loadDoc(url: string): Promise<PDFDocumentProxy> {
  let cached = docCache.get(url);
  if (!cached) {
    cached = loadPdfLib().then((lib) => lib.getDocument({ url }).promise);
    docCache.set(url, cached);
  }
  return cached;
}

export function RoomSlideCanvas({ pdfUrl, slide, onTotalPages }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const renderTokenRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    loadDoc(pdfUrl)
      .then((d) => {
        if (cancelled) return;
        setDoc(d);
        onTotalPages?.(d.numPages);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Gagal memuat slide");
      });
    return () => {
      cancelled = true;
    };
  }, [pdfUrl, onTotalPages]);

  useEffect(() => {
    if (!doc || !canvasRef.current || !wrapperRef.current) return;
    const pageNum = Math.max(1, Math.min(doc.numPages, slide + 1));
    const myToken = ++renderTokenRef.current;

    (async () => {
      try {
        const page = await doc.getPage(pageNum);
        if (myToken !== renderTokenRef.current) return;
        const wrapper = wrapperRef.current;
        const canvas = canvasRef.current;
        if (!wrapper || !canvas) return;

        const wrapperWidth = wrapper.clientWidth;
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = Math.min(2.5, wrapperWidth / baseViewport.width);
        const viewport = page.getViewport({ scale });

        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch (err) {
        if (myToken !== renderTokenRef.current) return;
        setError(err instanceof Error ? err.message : "Gagal render slide");
      }
    })();
  }, [doc, slide]);

  if (error) {
    return (
      <div
        style={{
          padding: 24,
          border: "1px solid rgba(198, 40, 40, 0.3)",
          background: "rgba(198, 40, 40, 0.06)",
          borderRadius: 12,
          color: "#c62828",
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      style={{
        width: "100%",
        background: "#0f172a",
        borderRadius: 12,
        padding: 12,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: 320,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          maxWidth: "100%",
          background: "#fff",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          borderRadius: 4,
        }}
      />
    </div>
  );
}
