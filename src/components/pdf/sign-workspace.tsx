"use client";

import { useCallback, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Info,
  Signature,
  Trash2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { CreateSignatureModal } from "@/components/pdf/create-signature-modal";
import { EditPageCanvas } from "@/components/pdf/edit-page-canvas";
import { DownloadResult } from "@/components/tools/download-result";
import { ProgressBar } from "@/components/tools/progress-bar";
import { usePdfPageView } from "@/hooks/use-pdf-page-view";
import { usePdfThumbnails } from "@/hooks/use-pdf-thumbnails";
import { cn } from "@/lib/utils";
import type {
  ImageAnnotation,
  PdfFile,
  ProcessProgress,
  ProcessResult,
} from "@/types/pdf";

const BASE_SCALE = 1.5;

type SignWorkspaceProps = {
  file: PdfFile;
  currentPage: number;
  zoom: number;
  pageSignatures: ImageAnnotation[];
  selectedId: string | null;
  selectedSignature: ImageAnnotation | null;
  isProcessing: boolean;
  progress: ProcessProgress | null;
  result: ProcessResult | null;
  canProcess: boolean;
  onPageChange: (pageIndex: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToWidth: (targetZoom: number) => void;
  onAddSignature: (dataUrl: string) => void;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, patch: Partial<ImageAnnotation>) => void;
  onRemove: (id: string) => void;
  onProcess: () => void;
  onReset: () => void;
};

export function SignWorkspace({
  file,
  currentPage,
  zoom,
  pageSignatures,
  selectedId,
  selectedSignature,
  isProcessing,
  progress,
  result,
  canProcess,
  onPageChange,
  onZoomIn,
  onZoomOut,
  onFitToWidth,
  onAddSignature,
  onSelect,
  onUpdate,
  onRemove,
  onProcess,
  onReset,
}: SignWorkspaceProps) {
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const { pages, renderThumbnail } = usePdfThumbnails(file.file, file.pageCount);
  const { render, isLoading: isPageLoading } = usePdfPageView(
    file.file,
    currentPage,
    BASE_SCALE * zoom,
  );

  const handleFitToWidth = useCallback(() => {
    if (!render || !viewerContainerRef.current) return;
    const padding = 48;
    const available = viewerContainerRef.current.clientWidth - padding;
    if (available <= 0) return;
    onFitToWidth(available / render.width);
  }, [onFitToWidth, render]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex min-h-[560px] flex-col lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex gap-2 overflow-x-auto border-b border-gray-200 bg-gray-50 p-2 lg:hidden">
            {pages.map((page) => {
              const active = page.pageIndex === currentPage;
              return (
                <button
                  key={page.pageIndex}
                  type="button"
                  onClick={() => onPageChange(page.pageIndex)}
                  onMouseEnter={() => void renderThumbnail(page.pageIndex)}
                  className={cn(
                    "shrink-0 overflow-hidden rounded-md border bg-white transition-colors",
                    active
                      ? "border-blue-500 ring-2 ring-blue-500/30"
                      : "border-gray-200",
                  )}
                >
                  <div className="aspect-[3/4] w-14">
                    {page.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={page.thumbnailUrl}
                        alt={`Page ${page.pageIndex + 1}`}
                        className="h-full w-full object-contain"
                      />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="relative flex min-h-[420px] min-w-0 flex-1 flex-col bg-[#e8eaed]">
            <div
              ref={viewerContainerRef}
              className="flex flex-1 items-start justify-center overflow-auto p-4 sm:p-6"
            >
              {isPageLoading && !render ? (
                <p className="text-sm text-gray-500">Loading page...</p>
              ) : render ? (
                <div className="relative shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={render.dataUrl}
                    alt={`Page ${currentPage + 1}`}
                    width={Math.round(render.width)}
                    height={Math.round(render.height)}
                    className="block max-w-none"
                    draggable={false}
                  />
                  <EditPageCanvas
                    pageIndex={currentPage}
                    pageWidth={render.width}
                    pageHeight={render.height}
                    annotations={pageSignatures}
                    activeTool="select"
                    activeShape="rectangle"
                    selectedId={selectedId}
                    color="#000000"
                    strokeWidth={2}
                    fontSize={16}
                    fontFamily="helvetica"
                    bold={false}
                    italic={false}
                    onSelect={onSelect}
                    onAdd={() => undefined}
                    onUpdate={(id, patch) =>
                      onUpdate(id, patch as Partial<ImageAnnotation>)
                    }
                    onRemove={onRemove}
                  />
                </div>
              ) : null}
            </div>

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-lg bg-gray-800 px-2 py-1.5 text-white shadow-lg">
              <button
                type="button"
                aria-label="Previous page"
                disabled={currentPage === 0}
                onClick={() => onPageChange(currentPage - 1)}
                className="rounded p-1.5 hover:bg-white/10 disabled:opacity-40"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Next page"
                disabled={currentPage >= file.pageCount - 1}
                onClick={() => onPageChange(currentPage + 1)}
                className="rounded p-1.5 hover:bg-white/10 disabled:opacity-40"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <span className="min-w-[4rem] text-center text-xs tabular-nums">
                {currentPage + 1} / {file.pageCount}
              </span>
              <span className="mx-1 h-4 w-px bg-white/20" />
              <button
                type="button"
                aria-label="Zoom out"
                onClick={onZoomOut}
                className="rounded p-1.5 hover:bg-white/10"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="min-w-[3rem] text-center text-xs tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                aria-label="Zoom in"
                onClick={onZoomIn}
                className="rounded p-1.5 hover:bg-white/10"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Fit to width"
                onClick={handleFitToWidth}
                disabled={!render}
                className="rounded px-2 py-1.5 text-xs hover:bg-white/10 disabled:opacity-40"
              >
                Fit
              </button>
            </div>
          </div>
        </div>

        <div className="flex w-full min-w-0 shrink-0 flex-col border-t border-gray-200 lg:w-[320px] lg:border-l lg:border-t-0">
          <div className="space-y-3 border-b border-gray-100 px-5 py-4">
            <h2 className="text-center text-xl font-bold text-brand-charcoal">
              Sign PDF
            </h2>

            {progress && isProcessing ? <ProgressBar progress={progress} /> : null}
            {result ? (
              <DownloadResult result={result} onReset={onReset} compact />
            ) : null}

            <button
              type="button"
              onClick={onProcess}
              disabled={!canProcess || isProcessing}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-red px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-red-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? "Saving..." : "Download signed PDF"}
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-4">
            <div className="mb-4 flex gap-2 rounded-lg bg-blue-50 px-3 py-3 text-sm text-blue-800">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden />
              <p>
                Create a signature, place it on the page, then repeat on other
                pages if needed.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSignatureModalOpen(true)}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Signature className="h-4 w-4" />
              Add signature
            </button>

            {selectedSignature ? (
              <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                <p className="text-sm font-semibold text-brand-charcoal">
                  Selected signature
                </p>
                <p className="text-xs text-muted-foreground">
                  Drag to move, rotate from the top handle, or drag corner and
                  edge handles to resize.
                </p>
                <button
                  type="button"
                  onClick={() => onRemove(selectedSignature.id)}
                  className="inline-flex items-center gap-2 text-sm text-destructive hover:underline"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove signature
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <CreateSignatureModal
        open={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        onCreate={onAddSignature}
      />
    </div>
  );
}
