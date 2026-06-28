"use client";

import { useEffect, useRef, useState } from "react";

import type { PDFDocumentProxy } from "pdfjs-dist";

import { loadPdfDocument, renderPageImage } from "@/lib/pdf/thumbnails";
import type { PageRenderResult } from "@/lib/pdf/thumbnails";

export function usePdfPageView(file: File | null, pageIndex: number, scale: number) {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [render, setRender] = useState<PageRenderResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const requestRef = useRef(0);

  useEffect(() => {
    if (!file) {
      setPdfDoc(null);
      setRender(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setRender(null);

    const load = async () => {
      try {
        const buffer = await file.arrayBuffer();
        const pdf = await loadPdfDocument(buffer);
        if (cancelled) return;
        setPdfDoc(pdf);
      } catch {
        if (!cancelled) {
          setPdfDoc(null);
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
      setPdfDoc(null);
      setRender(null);
    };
  }, [file]);

  useEffect(() => {
    if (!pdfDoc) return;

    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    setIsLoading(true);

    void renderPageImage(pdfDoc, pageIndex, scale)
      .then((result) => {
        if (requestRef.current !== requestId) return;
        setRender(result);
        setIsLoading(false);
      })
      .catch(() => {
        if (requestRef.current !== requestId) return;
        setRender(null);
        setIsLoading(false);
      });
  }, [pdfDoc, pageIndex, scale]);

  return { render, isLoading };
}
