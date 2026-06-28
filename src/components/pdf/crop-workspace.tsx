"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Info,
  Loader2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { CropOverlay } from "@/components/pdf/crop-overlay";
import { DownloadResult } from "@/components/tools/download-result";
import { ProgressBar } from "@/components/tools/progress-bar";
import { usePdfPageView } from "@/hooks/use-pdf-page-view";
import { parsePageInput } from "@/lib/pdf/range-entries";
import { cn } from "@/lib/utils";
import type {
  CropPageScope,
  CropRect,
  PdfFile,
  ProcessProgress,
  ProcessResult,
} from "@/types/pdf";

type CropWorkspaceProps = {
  file: PdfFile;
  currentPage: number;
  zoom: number;
  scope: CropPageScope;
  activeCrop: CropRect;
  isProcessing: boolean;
  progress: ProcessProgress | null;
  result: ProcessResult | null;
  canProcess: boolean;
  onPageChange: (pageIndex: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToWidth: (targetZoom: number) => void;
  onScopeChange: (scope: CropPageScope) => void;
  onCropChange: (rect: CropRect) => void;
  onResetAllCrops: () => void;
  onProcess: () => void;
  onReset: () => void;
};

const BASE_SCALE = 1.5;
const MIN_ZOOM = 0.1;

function getFitZoom(
  container: HTMLElement,
  renderWidth: number,
  renderHeight: number,
  zoom: number,
): number | null {
  const style = window.getComputedStyle(container);
  const availableWidth =
    container.clientWidth -
    parseFloat(style.paddingLeft) -
    parseFloat(style.paddingRight);
  const availableHeight =
    container.clientHeight -
    parseFloat(style.paddingTop) -
    parseFloat(style.paddingBottom);

  if (availableWidth <= 0 || availableHeight <= 0 || zoom <= 0) return null;

  const baseWidth = renderWidth / zoom;
  const baseHeight = renderHeight / zoom;
  const targetZoom = Math.min(
    availableWidth / baseWidth,
    availableHeight / baseHeight,
  );

  return Math.max(MIN_ZOOM, Math.min(targetZoom, 3));
}

function ScopeOption({
  id,
  label,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center gap-2 text-sm text-brand-charcoal",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <input
        id={id}
        type="radio"
        name="crop-scope"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
      />
      {label}
    </label>
  );
}

export function CropWorkspace({
  file,
  currentPage,
  zoom,
  scope,
  activeCrop,
  isProcessing,
  progress,
  result,
  canProcess,
  onPageChange,
  onZoomIn,
  onZoomOut,
  onFitToWidth,
  onScopeChange,
  onCropChange,
  onResetAllCrops,
  onProcess,
  onReset,
}: CropWorkspaceProps) {
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const autoFitPageRef = useRef<number | null>(null);
  const { render, isLoading: isPageLoading } = usePdfPageView(
    file.file,
    currentPage,
    BASE_SCALE * zoom,
  );

  const handleFitToPage = useCallback(() => {
    const container = viewerContainerRef.current;
    if (!container || !render || zoom <= 0) return;

    const targetZoom = getFitZoom(
      container,
      render.width,
      render.height,
      zoom,
    );
    if (targetZoom !== null) {
      onFitToWidth(targetZoom);
    }
  }, [onFitToWidth, render, zoom]);

  useEffect(() => {
    autoFitPageRef.current = null;
  }, [file.id]);

  useEffect(() => {
    if (!render || isPageLoading) return;
    if (autoFitPageRef.current === currentPage) return;

    autoFitPageRef.current = currentPage;
    const frame = requestAnimationFrame(() => {
      handleFitToPage();
    });

    return () => cancelAnimationFrame(frame);
  }, [currentPage, handleFitToPage, isPageLoading, render]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex min-h-[560px] min-w-0 flex-col lg:flex-row">
        <div className="relative flex min-h-[420px] min-w-0 flex-1 flex-col bg-[#e8eaed]">
          <div
            ref={viewerContainerRef}
            className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-4 sm:p-6"
          >
            {isPageLoading && !render ? (
              <p className="text-sm text-gray-500">Loading page...</p>
            ) : render ? (
              <div
                className="relative shadow-lg"
                style={{ width: render.width, height: render.height }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={render.dataUrl}
                  alt={`Page ${currentPage + 1}`}
                  width={Math.round(render.width)}
                  height={Math.round(render.height)}
                  className="block h-full w-full"
                  draggable={false}
                />
                <CropOverlay
                  pageWidth={render.width}
                  pageHeight={render.height}
                  cropRect={activeCrop}
                  disabled={isProcessing}
                  onChange={onCropChange}
                />
              </div>
            ) : null}
          </div>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-lg bg-gray-800 px-2 py-1.5 text-white shadow-lg">
            <button
              type="button"
              aria-label="Previous page"
              disabled={currentPage === 0 || isProcessing}
              onClick={() => onPageChange(currentPage - 1)}
              className="rounded p-1.5 hover:bg-white/10 disabled:opacity-40"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next page"
              disabled={currentPage >= file.pageCount - 1 || isProcessing}
              onClick={() => onPageChange(currentPage + 1)}
              className="rounded p-1.5 hover:bg-white/10 disabled:opacity-40"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              aria-label="Current page"
              value={currentPage + 1}
              disabled={isProcessing}
              maxLength={String(file.pageCount).length}
              onChange={(event) => {
                const parsed = parsePageInput(event.target.value, file.pageCount);
                if (parsed !== null) {
                  onPageChange(parsed - 1);
                }
              }}
              className="w-10 rounded bg-white/10 px-1 py-0.5 text-center text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-white/40"
            />
            <span className="text-xs tabular-nums text-white/80">
              / {file.pageCount}
            </span>
            <span className="mx-1 h-4 w-px bg-white/20" />
            <button
              type="button"
              aria-label="Zoom out"
              disabled={isProcessing}
              onClick={onZoomOut}
              className="rounded p-1.5 hover:bg-white/10 disabled:opacity-40"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="min-w-[3rem] text-center text-xs tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              aria-label="Zoom in"
              disabled={isProcessing}
              onClick={onZoomIn}
              className="rounded p-1.5 hover:bg-white/10 disabled:opacity-40"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Fit to width"
              disabled={!render || isProcessing}
              onClick={handleFitToPage}
              className="rounded px-2 py-1.5 text-xs hover:bg-white/10 disabled:opacity-40"
            >
              Fit
            </button>
          </div>
        </div>

        <div className="flex w-full min-w-0 shrink-0 flex-col border-t border-gray-200 lg:w-[340px] lg:border-l lg:border-t-0">
          <div className="space-y-4 px-5 py-5">
            <h2 className="text-center text-xl font-bold text-brand-charcoal">
              Crop PDF
            </h2>

            <div className="flex gap-2 rounded-lg bg-blue-50 px-3 py-3 text-sm text-blue-800">
              <Info
                className="mt-0.5 h-4 w-4 shrink-0 text-blue-600"
                aria-hidden
              />
              <p>
                Click and drag to select the area you want to keep. Resize if
                needed.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onResetAllCrops}
                disabled={isProcessing}
                className="text-sm font-medium text-gray-500 transition-colors hover:text-brand-red disabled:opacity-50"
              >
                Reset all
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-brand-charcoal">Pages:</p>
              <div className="flex flex-col gap-2">
                <ScopeOption
                  id="crop-scope-all"
                  label="All pages"
                  checked={scope === "all"}
                  disabled={isProcessing}
                  onChange={() => onScopeChange("all")}
                />
                <ScopeOption
                  id="crop-scope-current"
                  label="Current page"
                  checked={scope === "current"}
                  disabled={isProcessing}
                  onChange={() => onScopeChange("current")}
                />
              </div>
            </div>
          </div>

          <div className="mt-auto min-w-0 space-y-3 border-t border-gray-100 px-5 py-4">
            {progress && isProcessing ? <ProgressBar progress={progress} /> : null}
            {result ? (
              <DownloadResult result={result} onReset={onReset} compact />
            ) : null}

            <button
              type="button"
              onClick={onProcess}
              disabled={!canProcess || isProcessing}
              className="flex w-full items-center justify-center gap-3 rounded-md bg-brand-red px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-red-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Crop PDF
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
