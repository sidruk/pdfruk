"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bold,
  ChevronDown,
  ChevronUp,
  Circle,
  FileText,
  Hand,
  ImageIcon,
  Info,
  Italic,
  Loader2,
  Minus,
  Pencil,
  RotateCw,
  Shapes,
  Signature,
  Square,
  Trash2,
  Triangle,
  Type,
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
  EditAnnotation,
  EditFontFamily,
  EditTool,
  ImageAnnotation,
  PdfFile,
  ProcessProgress,
  ProcessResult,
  ShapeKind,
  TextAnnotation,
} from "@/types/pdf";

type EditWorkspaceProps = {
  file: PdfFile;
  currentPage: number;
  zoom: number;
  activeTool: EditTool;
  activeShape: ShapeKind;
  pageAnnotations: EditAnnotation[];
  selectedId: string | null;
  selectedAnnotation: EditAnnotation | null;
  color: string;
  strokeWidth: number;
  fontSize: number;
  fontFamily: EditFontFamily;
  bold: boolean;
  italic: boolean;
  isProcessing: boolean;
  progress: ProcessProgress | null;
  result: ProcessResult | null;
  canProcess: boolean;
  onPageChange: (pageIndex: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToWidth: (targetZoom: number) => void;
  onToolChange: (tool: EditTool) => void;
  onShapeChange: (shape: ShapeKind) => void;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (value: number) => void;
  onFontSizeChange: (value: number) => void;
  onFontFamilyChange: (value: EditFontFamily) => void;
  onBoldChange: (value: boolean) => void;
  onItalicChange: (value: boolean) => void;
  onAddImageFromFile: (
    file: File,
    sourceKind: "image" | "signature" | "pdf",
  ) => void;
  onAddSignature: (dataUrl: string) => void;
  onSelect: (id: string | null) => void;
  onAdd: (annotation: EditAnnotation) => void;
  onUpdate: (id: string, patch: Partial<EditAnnotation>) => void;
  onRemove: (id: string) => void;
  onProcess: () => void;
  onReset: () => void;
};


const BASE_SCALE = 1.5;

const FONT_FAMILIES: { id: EditFontFamily; label: string }[] = [
  { id: "helvetica", label: "Helvetica" },
  { id: "times", label: "Times New Roman" },
  { id: "courier", label: "Courier" },
];

const SHAPES: { id: ShapeKind; label: string; icon: typeof Square }[] = [
  { id: "rectangle", label: "Rectangle", icon: Square },
  { id: "ellipse", label: "Circle", icon: Circle },
  { id: "line", label: "Line", icon: Minus },
  { id: "triangle", label: "Triangle", icon: Triangle },
];

function ModeTab({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: typeof Pencil;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-brand-charcoal text-white"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
      {label}
    </button>
  );
}

function ToolbarIcon({
  active,
  label,
  icon: Icon,
  disabled,
  onClick,
}: {
  active?: boolean;
  label: string;
  icon?: typeof Hand;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors",
        disabled
          ? "cursor-not-allowed text-gray-300"
          : active
            ? "bg-brand-charcoal text-white"
            : "text-gray-600 hover:bg-gray-100",
      )}
    >
      {Icon ? (
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      ) : (
        <span className="text-xs font-semibold">{label}</span>
      )}
    </button>
  );
}

function ShapeButton({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: typeof Square;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-center gap-1 rounded-md px-2 py-2 text-xs transition-colors",
        active
          ? "bg-blue-100 text-blue-700"
          : "bg-gray-50 text-gray-600 hover:bg-gray-100",
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
      <span>{label}</span>
    </button>
  );
}

function ExportButton({
  onClick,
  disabled,
  isProcessing,
}: {
  onClick: () => void;
  disabled: boolean;
  isProcessing: boolean;
}) {
  const isDisabled = disabled || isProcessing;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "flex w-full items-center justify-center gap-3 rounded-md px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors",
        isDisabled
          ? "cursor-not-allowed bg-brand-red/35"
          : "bg-brand-red hover:bg-brand-red-hover",
      )}
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          Export
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
            <ArrowRight className="h-4 w-4" />
          </span>
        </>
      )}
    </button>
  );
}

export function EditWorkspace({
  file,
  currentPage,
  zoom,
  activeTool,
  activeShape,
  pageAnnotations,
  selectedId,
  selectedAnnotation,
  color,
  strokeWidth,
  fontSize,
  fontFamily,
  bold,
  italic,
  isProcessing,
  progress,
  result,
  canProcess,
  onPageChange,
  onZoomIn,
  onZoomOut,
  onFitToWidth,
  onToolChange,
  onShapeChange,
  onColorChange,
  onStrokeWidthChange,
  onFontSizeChange,
  onFontFamilyChange,
  onBoldChange,
  onItalicChange,
  onAddImageFromFile,
  onAddSignature,
  onSelect,
  onAdd,
  onUpdate,
  onRemove,
  onProcess,
  onReset,
}: EditWorkspaceProps) {
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const { pages, isLoading, renderThumbnail } = usePdfThumbnails(
    file.file,
    file.pageCount,
  );
  const { render, isLoading: isPageLoading } = usePdfPageView(
    file.file,
    currentPage,
    BASE_SCALE * zoom,
  );

  useEffect(() => {
    if (isLoading) return;

    void renderThumbnail(currentPage);
    if (currentPage > 0) {
      void renderThumbnail(currentPage - 1);
    }
    if (currentPage < file.pageCount - 1) {
      void renderThumbnail(currentPage + 1);
    }
  }, [currentPage, file.pageCount, isLoading, renderThumbnail]);

  const selectedText =
    selectedAnnotation?.type === "text" ? selectedAnnotation : null;
  const selectedImage =
    selectedAnnotation?.type === "image" ? selectedAnnotation : null;

  const showStyleControls =
    activeTool !== "select" || selectedId !== null;

  const handleFitToWidth = useCallback(() => {
    const container = viewerContainerRef.current;
    if (!container || !render || zoom <= 0) return;

    const style = window.getComputedStyle(container);
    const availableWidth =
      container.clientWidth -
      parseFloat(style.paddingLeft) -
      parseFloat(style.paddingRight);

    if (availableWidth <= 0) return;

    const pageWidthAtBaseScale = render.width / zoom;
    onFitToWidth(availableWidth / pageWidthAtBaseScale);
  }, [onFitToWidth, render, zoom]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex min-h-[560px] min-w-0">
        {/* Page thumbnails */}
        <div className="hidden w-28 shrink-0 flex-col gap-2 overflow-y-auto border-r border-gray-200 bg-gray-50 p-3 sm:flex">
          {isLoading && pages.length === 0 ? (
            <p className="p-2 text-xs text-gray-500">Loading...</p>
          ) : (
            pages.map((page) => {
              const thumbnailUrl = page.thumbnailUrl;
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
                      : "border-gray-200 hover:border-gray-300",
                  )}
                >
                  <div className="aspect-[3/4] w-full">
                    {thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumbnailUrl}
                        alt={`Page ${page.pageIndex + 1}`}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-gray-400">
                        ...
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
          {/* Viewer column */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Top toolbar */}
            <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-gray-200 bg-white px-4 py-2.5">
              <div className="flex items-center gap-1">
                <ModeTab
                  active
                  label="Edit"
                  icon={Pencil}
                  onClick={() => undefined}
                />
              </div>

              <div className="mx-auto flex items-center gap-0.5">
                <ToolbarIcon
                  active={activeTool === "select"}
                  label="Select"
                  icon={Hand}
                  onClick={() => onToolChange("select")}
                />
                <ToolbarIcon
                  label="Image"
                  icon={ImageIcon}
                  onClick={() => imageInputRef.current?.click()}
                />
                <ToolbarIcon
                  active={activeTool === "text"}
                  label="Add text"
                  icon={Type}
                  onClick={() => onToolChange("text")}
                />
                <ToolbarIcon
                  active={activeTool === "draw"}
                  label="Draw"
                  icon={Pencil}
                  onClick={() => onToolChange("draw")}
                />
                <ToolbarIcon
                  active={activeTool === "shape"}
                  label="Shapes"
                  icon={Shapes}
                  onClick={() => onToolChange("shape")}
                />
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(event) => {
                  const nextFile = event.target.files?.[0];
                  if (nextFile) onAddImageFromFile(nextFile, "image");
                  event.target.value = "";
                }}
              />
            </div>

            {/* Mobile page strip */}
            <div className="flex gap-2 overflow-x-auto border-b border-gray-200 bg-gray-50 p-2 sm:hidden">
              {pages.map((page) => {
                const thumbnailUrl = page.thumbnailUrl;
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
                      {thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumbnailUrl}
                          alt={`Page ${page.pageIndex + 1}`}
                          className="h-full w-full object-contain"
                        />
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Page viewer */}
            <div className="relative flex min-h-[420px] min-w-0 flex-1 flex-col bg-[#e8eaed]">
              <div
                ref={viewerContainerRef}
                className="flex flex-1 items-start justify-center overflow-auto p-4 sm:p-6"
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
                    <EditPageCanvas
                      pageIndex={currentPage}
                      pageWidth={render.width}
                      pageHeight={render.height}
                      annotations={pageAnnotations}
                      activeTool={activeTool}
                      activeShape={activeShape}
                      selectedId={selectedId}
                      color={color}
                      strokeWidth={strokeWidth}
                      fontSize={fontSize}
                      fontFamily={fontFamily}
                      bold={bold}
                      italic={italic}
                      onSelect={onSelect}
                      onAdd={onAdd}
                      onUpdate={onUpdate}
                      onRemove={onRemove}
                      onTextPlaced={() => onToolChange("select")}
                    />
                  </div>
                ) : null}
              </div>

              {/* Floating toolbar */}
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

          {/* Edit panel */}
          <div className="flex w-full min-w-0 shrink-0 flex-col border-t border-gray-200 lg:w-[340px] lg:border-l lg:border-t-0">
            <div className="space-y-3 border-b border-gray-100 px-5 py-4">
              <h2 className="text-center text-xl font-bold text-brand-charcoal">
                Edit PDF
              </h2>

              {progress && isProcessing ? (
                <ProgressBar progress={progress} />
              ) : null}
              {result ? (
                <DownloadResult result={result} onReset={onReset} compact />
              ) : null}

              <ExportButton
                onClick={onProcess}
                disabled={!canProcess || isProcessing}
                isProcessing={isProcessing}
              />
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-4">
              <div className="mb-4 flex gap-2 rounded-lg bg-blue-50 px-3 py-3 text-sm text-blue-800">
                <Info
                  className="mt-0.5 h-4 w-4 shrink-0 text-blue-600"
                  aria-hidden
                />
                <p>
                  Use the toolbar to add text, images, signatures, and PDF
                  pages to your document.
                </p>
              </div>

              <div className="mb-4 space-y-2 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                <p className="text-sm font-semibold text-brand-charcoal">Insert</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignatureModalOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <Signature className="h-4 w-4" />
                    Signature
                  </button>
                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <FileText className="h-4 w-4" />
                    PDF page
                  </button>
                </div>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(event) => {
                    const nextFile = event.target.files?.[0];
                    if (nextFile) onAddImageFromFile(nextFile, "pdf");
                    event.target.value = "";
                  }}
                />
              </div>

              {activeTool === "shape" ? (
                <div className="mb-4 grid grid-cols-4 gap-2">
                  {SHAPES.map((shape) => (
                    <ShapeButton
                      key={shape.id}
                      active={activeShape === shape.id}
                      label={shape.label}
                      icon={shape.icon}
                      onClick={() => onShapeChange(shape.id)}
                    />
                  ))}
                </div>
              ) : null}

              {showStyleControls ? (
                <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                  <p className="text-sm font-semibold text-brand-charcoal">
                    Style
                  </p>

                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="edit-color" className="text-sm text-gray-600">
                      Color
                    </label>
                    <input
                      id="edit-color"
                      type="color"
                      value={color}
                      onChange={(event) => onColorChange(event.target.value)}
                      className="h-8 w-12 cursor-pointer rounded border border-gray-200 bg-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-stroke"
                      className="mb-1 block text-sm text-gray-600"
                    >
                      Stroke width: {strokeWidth}px
                    </label>
                    <input
                      id="edit-stroke"
                      type="range"
                      min={1}
                      max={12}
                      value={strokeWidth}
                      onChange={(event) =>
                        onStrokeWidthChange(Number(event.target.value))
                      }
                      className="w-full"
                    />
                  </div>

                  {activeTool === "text" || selectedText ? (
                    <>
                      <div>
                        <label
                          htmlFor="edit-font-size"
                          className="mb-1 block text-sm text-gray-600"
                        >
                          Font size: {fontSize}px
                        </label>
                        <input
                          id="edit-font-size"
                          type="range"
                          min={8}
                          max={72}
                          value={fontSize}
                          onChange={(event) =>
                            onFontSizeChange(Number(event.target.value))
                          }
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="edit-font-family"
                          className="mb-1 block text-sm text-gray-600"
                        >
                          Font style
                        </label>
                        <select
                          id="edit-font-family"
                          value={selectedText?.fontFamily ?? fontFamily}
                          onChange={(event) =>
                            onFontFamilyChange(
                              event.target.value as EditFontFamily,
                            )
                          }
                          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                        >
                          {FONT_FAMILIES.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          aria-pressed={selectedText?.bold ?? bold}
                          onClick={() =>
                            onBoldChange(!(selectedText?.bold ?? bold))
                          }
                          className={cn(
                            "flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-sm transition-colors",
                            (selectedText?.bold ?? bold)
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                          )}
                        >
                          <Bold className="h-4 w-4" />
                          Bold
                        </button>
                        <button
                          type="button"
                          aria-pressed={selectedText?.italic ?? italic}
                          onClick={() =>
                            onItalicChange(!(selectedText?.italic ?? italic))
                          }
                          className={cn(
                            "flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-sm transition-colors",
                            (selectedText?.italic ?? italic)
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                          )}
                        >
                          <Italic className="h-4 w-4" />
                          Italic
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              ) : null}

              {selectedText ? (
                <div className="mt-4 space-y-4 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                  <p className="text-sm font-semibold text-brand-charcoal">
                    Selected text
                  </p>

                  <div>
                    <label
                      htmlFor="edit-rotation"
                      className="mb-1 flex items-center gap-1.5 text-sm text-gray-600"
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                      Rotation: {selectedText.rotation}°
                    </label>
                    <input
                      id="edit-rotation"
                      type="range"
                      min={-180}
                      max={180}
                      value={selectedText.rotation}
                      onChange={(event) =>
                        onUpdate(selectedText.id, {
                          rotation: Number(event.target.value),
                        } as Partial<TextAnnotation>)
                      }
                      className="w-full"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemove(selectedText.id)}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete text
                  </button>
                </div>
              ) : null}

              {selectedImage ? (
                <div className="mt-4 space-y-4 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                  <p className="text-sm font-semibold text-brand-charcoal">
                    Selected{" "}
                    {selectedImage.sourceKind === "signature"
                      ? "signature"
                      : selectedImage.sourceKind === "pdf"
                        ? "PDF page"
                        : "image"}
                  </p>

                  <div>
                    <label
                      htmlFor="edit-image-rotation"
                      className="mb-1 flex items-center gap-1.5 text-sm text-gray-600"
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                      Rotation: {selectedImage.rotation}°
                    </label>
                    <input
                      id="edit-image-rotation"
                      type="range"
                      min={-180}
                      max={180}
                      value={selectedImage.rotation}
                      onChange={(event) =>
                        onUpdate(selectedImage.id, {
                          rotation: Number(event.target.value),
                        } as Partial<ImageAnnotation>)
                      }
                      className="w-full"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemove(selectedImage.id)}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              ) : null}

              {selectedId &&
              selectedAnnotation &&
              selectedAnnotation.type !== "text" &&
              selectedAnnotation.type !== "image" ? (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => onRemove(selectedId)}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete selection
                  </button>
                </div>
              ) : null}
            </div>

            <div className="min-w-0 border-t border-gray-100 px-5 py-4">
              <ExportButton
                onClick={onProcess}
                disabled={!canProcess || isProcessing}
                isProcessing={isProcessing}
              />
            </div>
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
