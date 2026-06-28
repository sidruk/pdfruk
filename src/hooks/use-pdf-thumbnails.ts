"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  loadPdfDocument,
  renderPageThumbnail,
  revokeThumbnailUrl,
} from "@/lib/pdf/thumbnails";
import type { PdfPage } from "@/types/pdf";

export function usePdfThumbnails(file: File | null, pageCount: number) {
  const [pages, setPages] = useState<PdfPage[]>([]);
  const [loadingPages, setLoadingPages] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const renderedRef = useRef<Set<number>>(new Set());
  const pendingRef = useRef<Set<number>>(new Set());
  const pdfRef = useRef<Awaited<ReturnType<typeof loadPdfDocument>> | null>(
    null,
  );

  const revokeAllThumbnails = useCallback((currentPages: PdfPage[]) => {
    currentPages.forEach((page) => revokeThumbnailUrl(page.thumbnailUrl));
  }, []);

  const applyThumbnail = useCallback((pageIndex: number, thumbnailUrl: string) => {
    setPages((current) =>
      current.map((page) => {
        if (page.pageIndex !== pageIndex) return page;
        if (page.thumbnailUrl && page.thumbnailUrl !== thumbnailUrl) {
          revokeThumbnailUrl(page.thumbnailUrl);
        }
        return { ...page, thumbnailUrl };
      }),
    );
  }, []);

  const setPageLoading = useCallback((pageIndex: number, loading: boolean) => {
    setLoadingPages((current) => {
      const next = new Set(current);
      if (loading) {
        next.add(pageIndex);
      } else {
        next.delete(pageIndex);
      }
      return next;
    });
  }, []);

  const renderPage = useCallback(
    async (pdf: NonNullable<typeof pdfRef.current>, pageIndex: number) => {
      if (renderedRef.current.has(pageIndex)) return;

      renderedRef.current.add(pageIndex);
      setPageLoading(pageIndex, true);
      try {
        const thumbnailUrl = await renderPageThumbnail(pdf, pageIndex);
        applyThumbnail(pageIndex, thumbnailUrl);
      } catch {
        renderedRef.current.delete(pageIndex);
      } finally {
        setPageLoading(pageIndex, false);
      }
    },
    [applyThumbnail, setPageLoading],
  );

  const flushPending = useCallback(
    async (pdf: NonNullable<typeof pdfRef.current>) => {
      const pending = Array.from(pendingRef.current);
      pendingRef.current.clear();
      await Promise.all(pending.map((pageIndex) => renderPage(pdf, pageIndex)));
    },
    [renderPage],
  );

  useEffect(() => {
    if (!file || pageCount === 0) {
      setPages([]);
      setLoadingPages(new Set());
      return;
    }

    setPages(
      Array.from({ length: pageCount }, (_, pageIndex) => ({ pageIndex })),
    );
    setLoadingPages(new Set());
    renderedRef.current.clear();
    pendingRef.current.clear();
  }, [file, pageCount]);

  useEffect(() => {
    if (!file) {
      pdfRef.current = null;
      renderedRef.current.clear();
      pendingRef.current.clear();
      return;
    }

    const renderedPages = renderedRef.current;
    const pendingPages = pendingRef.current;
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const buffer = await file.arrayBuffer();
        const pdf = await loadPdfDocument(buffer);
        if (cancelled) return;
        pdfRef.current = pdf;
        await flushPending(pdf);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
      pdfRef.current = null;
      renderedPages.clear();
      pendingPages.clear();
      setPages((current) => {
        revokeAllThumbnails(current);
        return [];
      });
      setLoadingPages(new Set());
    };
  }, [file, flushPending, revokeAllThumbnails]);

  const renderThumbnail = useCallback(
    async (pageIndex: number, force = false) => {
      if (!force && renderedRef.current.has(pageIndex)) return;

      if (force) {
        renderedRef.current.delete(pageIndex);
        setPages((current) =>
          current.map((page) => {
            if (page.pageIndex !== pageIndex) return page;
            if (page.thumbnailUrl) revokeThumbnailUrl(page.thumbnailUrl);
            return { ...page, thumbnailUrl: undefined };
          }),
        );
      }

      const pdf = pdfRef.current;
      if (!pdf) {
        pendingRef.current.add(pageIndex);
        setPageLoading(pageIndex, true);
        return;
      }

      await renderPage(pdf, pageIndex);
    },
    [renderPage, setPageLoading],
  );

  const isPageLoading = useCallback(
    (pageIndex: number) => loadingPages.has(pageIndex),
    [loadingPages],
  );

  const retryThumbnail = useCallback(
    (pageIndex: number) => {
      void renderThumbnail(pageIndex, true);
    },
    [renderThumbnail],
  );

  return {
    pages,
    isLoading,
    isPageLoading,
    renderThumbnail,
    retryThumbnail,
  };
}
