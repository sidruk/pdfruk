"use client";

import { useCallback, useEffect, useRef } from "react";

import { getFitZoom } from "@/lib/pdf/fit-zoom";
import type { PageRenderResult } from "@/lib/pdf/thumbnails";

type UsePdfViewerAutoFitOptions = {
  containerRef: React.RefObject<HTMLElement | null>;
  render: PageRenderResult | null;
  isPageLoading: boolean;
  currentPage: number;
  fileId: string;
  zoom: number;
  onFit: (targetZoom: number) => void;
};

export function usePdfViewerAutoFit({
  containerRef,
  render,
  isPageLoading,
  currentPage,
  fileId,
  zoom,
  onFit,
}: UsePdfViewerAutoFitOptions) {
  const fittedPageRef = useRef<number | null>(null);

  const handleFitToPage = useCallback(() => {
    const container = containerRef.current;
    if (!container || !render || zoom <= 0) return false;

    const targetZoom = getFitZoom(
      container,
      render.width,
      render.height,
      zoom,
    );
    if (targetZoom === null) return false;

    onFit(targetZoom);
    fittedPageRef.current = currentPage;
    return true;
  }, [containerRef, currentPage, onFit, render, zoom]);

  useEffect(() => {
    fittedPageRef.current = null;
  }, [fileId]);

  useEffect(() => {
    fittedPageRef.current = null;
  }, [currentPage]);

  useEffect(() => {
    if (!render || isPageLoading) return;

    const container = containerRef.current;
    if (!container) return;

    const tryFit = () => {
      if (fittedPageRef.current === currentPage) return;
      handleFitToPage();
    };

    tryFit();

    const observer = new ResizeObserver(() => {
      tryFit();
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [
    containerRef,
    currentPage,
    handleFitToPage,
    isPageLoading,
    render,
  ]);

  return { handleFitToPage };
}
