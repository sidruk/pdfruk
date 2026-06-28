"use client";

import { useEffect, useMemo } from "react";
import {
  ArrowRight,
  Archive,
  Check,
  Crown,
  FileText,
  Info,
  Loader2,
  Plus,
  ScanLine,
  Sparkles,
  SquareStack,
  Scaling,
  Trash2,
} from "lucide-react";

import { SplitRangePreview } from "@/components/pdf/split-range-preview";
import { PageThumbnailGrid } from "@/components/pdf/page-thumbnail-grid";
import { ProgressBar } from "@/components/tools/progress-bar";
import { DownloadResult } from "@/components/tools/download-result";
import { usePdfThumbnails } from "@/hooks/use-pdf-thumbnails";
import { parsePageInput } from "@/lib/pdf/range-entries";
import { cn } from "@/lib/utils";
import type { PageRangeEntry } from "@/lib/pdf/range-entries";
import type {
  PdfFile,
  ProcessProgress,
  ProcessResult,
  RangeMode,
  SplitTab,
} from "@/types/pdf";

type SplitWorkspaceProps = {
  file: PdfFile;
  tab: SplitTab;
  rangeMode: RangeMode;
  rangeEntries: PageRangeEntry[];
  fixedPagesPerRange: number;
  mergeRanges: boolean;
  selectedPages: number[];
  isProcessing: boolean;
  progress: ProcessProgress | null;
  result: ProcessResult | null;
  canProcess: boolean;
  onTabChange: (tab: SplitTab) => void;
  onRangeModeChange: (mode: RangeMode) => void;
  onRangeChange: (id: string, field: "from" | "to", value: number) => void;
  onAddRange: () => void;
  onRemoveRange: (id: string) => void;
  onFixedPagesChange: (value: number) => void;
  onMergeRangesChange: (value: boolean) => void;
  onTogglePage: (pageIndex: number) => void;
  onProcess: () => void;
  onReset: () => void;
};

const TABS: { id: SplitTab; label: string; icon: typeof ScanLine; premium?: boolean }[] = [
  { id: "range", label: "Range", icon: ScanLine },
  { id: "pages", label: "Pages", icon: SquareStack },
  { id: "size", label: "Size", icon: Scaling, premium: true },
];

function RangePageInput({
  id,
  label,
  value,
  pageCount,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  pageCount: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex-1">
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium text-gray-500"
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        maxLength={String(pageCount).length}
        value={value}
        onChange={(event) => {
          const parsed = parsePageInput(event.target.value, pageCount);
          if (parsed !== null) {
            onChange(parsed);
          }
        }}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm tabular-nums focus:border-split-red focus:outline-none focus:ring-2 focus:ring-split-red/20"
      />
    </div>
  );
}

function TabButton({
  tab,
  active,
  onClick,
}: {
  tab: (typeof TABS)[number];
  active: boolean;
  onClick: () => void;
}) {
  const Icon = tab.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-1 flex-col items-center gap-2 rounded-lg border-2 px-2 py-3 transition-colors",
        active
          ? "border-gray-200 bg-white shadow-sm"
          : "border-transparent bg-transparent hover:bg-gray-50",
      )}
    >
      {active ? (
        <span className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
          <Check className="h-3 w-3 text-white" strokeWidth={3} />
        </span>
      ) : null}
      {tab.premium ? (
        <Crown className="absolute right-1 top-1 h-3.5 w-3.5 text-amber-500" />
      ) : null}
      <Icon
        className={cn("h-7 w-7", active ? "text-gray-700" : "text-gray-400")}
        strokeWidth={1.5}
      />
      <span
        className={cn(
          "text-xs font-medium",
          active ? "text-gray-800" : "text-gray-500",
        )}
      >
        {tab.label}
      </span>
    </button>
  );
}

function RangeModeButton({
  label,
  active,
  icon,
  onClick,
}: {
  label: string;
  active: boolean;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "border border-split-red bg-white text-split-red"
          : "border border-transparent bg-gray-100 text-gray-500 hover:bg-gray-200/70",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

export function SplitWorkspace({
  file,
  tab,
  rangeMode,
  rangeEntries,
  fixedPagesPerRange,
  mergeRanges,
  selectedPages,
  isProcessing,
  progress,
  result,
  canProcess,
  onTabChange,
  onRangeModeChange,
  onRangeChange,
  onAddRange,
  onRemoveRange,
  onFixedPagesChange,
  onMergeRangesChange,
  onTogglePage,
  onProcess,
  onReset,
}: SplitWorkspaceProps) {
  const { pages, isLoading, isPageLoading, renderThumbnail, retryThumbnail } =
    usePdfThumbnails(file.file, file.pageCount);

  const getThumbnailUrl = (pageIndex: number) =>
    pages.find((page) => page.pageIndex === pageIndex)?.thumbnailUrl;

  const previewEntries: Array<PageRangeEntry & { label?: string }> = useMemo(
    () =>
      tab === "range" && rangeMode !== "smart"
        ? rangeEntries.map((entry, index) => ({
            ...entry,
            label: `Range ${index + 1}`,
          }))
        : tab === "pages" && selectedPages.length > 0
          ? selectedPages.map((pageIndex, index) => ({
              id: `page-${pageIndex}`,
              from: pageIndex + 1,
              to: pageIndex + 1,
              label: `Page ${index + 1}`,
            }))
          : rangeEntries.length > 0
            ? rangeEntries.map((entry, index) => ({
                ...entry,
                label: `Range ${index + 1}`,
              }))
            : [
                {
                  id: "default",
                  from: 1,
                  to: file.pageCount,
                  label: "Range 1",
                },
              ],
    [tab, rangeMode, rangeEntries, selectedPages, file.pageCount],
  );

  useEffect(() => {
    if (isLoading) return;

    const pageIndices = new Set<number>();
    for (const entry of previewEntries) {
      const start = Math.max(1, entry.from);
      const end = Math.min(entry.to, file.pageCount);

      pageIndices.add(start - 1);
      if (end !== start) {
        pageIndices.add(end - 1);
      }
    }

    pageIndices.forEach((pageIndex) => {
      void renderThumbnail(pageIndex);
    });
  }, [isLoading, previewEntries, file.pageCount, renderThumbnail]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex min-h-[520px] flex-col lg:flex-row">
        {/* Preview panel */}
        <div className="flex flex-1 flex-col items-center bg-split-preview p-6 sm:p-10">
          {isLoading && pages.length === 0 ? (
            <p className="text-sm text-gray-500">Loading page previews...</p>
          ) : (
            <div className="flex w-full max-w-md flex-col items-center gap-10 overflow-y-auto py-2">
              {previewEntries.map((entry) => (
                <SplitRangePreview
                  key={entry.id}
                  label={entry.label ?? "Range 1"}
                  from={entry.from}
                  to={entry.to}
                  getThumbnailUrl={getThumbnailUrl}
                  isPageLoading={isPageLoading}
                  onThumbnailVisible={renderThumbnail}
                  onThumbnailRetry={retryThumbnail}
                />
              ))}
            </div>
          )}
        </div>

        {/* Controls sidebar */}
        <div className="flex w-full min-w-0 flex-col border-t border-gray-200 lg:w-[380px] lg:shrink-0 lg:border-l lg:border-t-0">
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-4">
            <div className="mb-5 flex gap-2">
              {TABS.map((tabItem) => (
                <TabButton
                  key={tabItem.id}
                  tab={tabItem}
                  active={tab === tabItem.id}
                  onClick={() => onTabChange(tabItem.id)}
                />
              ))}
            </div>

            {tab === "range" ? (
              <div className="flex flex-1 flex-col gap-4">
                <div>
                  <p className="mb-2 text-sm font-bold text-brand-charcoal">
                    Range mode:
                  </p>
                  <div className="flex gap-2">
                    <RangeModeButton
                      label="Custom"
                      active={rangeMode === "custom"}
                      onClick={() => onRangeModeChange("custom")}
                    />
                    <RangeModeButton
                      label="Fixed"
                      active={rangeMode === "fixed"}
                      onClick={() => onRangeModeChange("fixed")}
                    />
                    <RangeModeButton
                      label="Smart"
                      active={rangeMode === "smart"}
                      icon={<Sparkles className="h-3.5 w-3.5" />}
                      onClick={() => onRangeModeChange("smart")}
                    />
                  </div>
                </div>

                {rangeMode === "smart" ? (
                  <div className="rounded-lg bg-split-panel px-4 py-6 text-center text-sm text-gray-500">
                    <Sparkles className="mx-auto mb-2 h-6 w-6 text-amber-500" />
                    Smart split analyzes your document to suggest optimal
                    ranges. Coming soon.
                  </div>
                ) : rangeMode === "fixed" ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <label
                        htmlFor="fixed-pages-per-range"
                        className="text-sm text-brand-charcoal"
                      >
                        Split into page ranges of:
                      </label>
                      <input
                        id="fixed-pages-per-range"
                        type="number"
                        min={1}
                        max={file.pageCount}
                        value={fixedPagesPerRange}
                        onChange={(event) =>
                          onFixedPagesChange(Number(event.target.value))
                        }
                        disabled={isProcessing}
                        className="w-16 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-center text-sm focus:border-split-red focus:outline-none focus:ring-1 focus:ring-split-red"
                      />
                    </div>
                    <div className="flex gap-2.5 rounded-lg bg-blue-50 px-3 py-3 text-sm text-blue-800">
                      <Info
                        className="mt-0.5 h-4 w-4 shrink-0 text-blue-600"
                        aria-hidden
                      />
                      <p>
                        This PDF will be split into files of{" "}
                        {fixedPagesPerRange} page
                        {fixedPagesPerRange === 1 ? "" : "s"}.{" "}
                        <strong>{rangeEntries.length} PDFs</strong> will be
                        created.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rangeEntries.map((entry, index) => (
                      <div
                        key={entry.id}
                        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                      >
                        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-split-red/10 text-xs font-bold text-split-red">
                              {index + 1}
                            </span>
                            <p className="text-sm font-semibold text-brand-charcoal">
                              Range {index + 1}
                            </p>
                          </div>
                          {rangeEntries.length > 1 ? (
                            <button
                              type="button"
                              onClick={() => onRemoveRange(entry.id)}
                              disabled={isProcessing}
                              aria-label={`Remove range ${index + 1}`}
                              className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-split-red disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : null}
                        </div>
                        <div className="flex items-end gap-2 px-4 py-3">
                          <RangePageInput
                            id={`range-${entry.id}-from`}
                            label="From page"
                            value={entry.from}
                            pageCount={file.pageCount}
                            disabled={isProcessing}
                            onChange={(value) =>
                              onRangeChange(entry.id, "from", value)
                            }
                          />
                          <span className="mb-2.5 shrink-0 text-xs font-medium uppercase tracking-wide text-gray-400">
                            to
                          </span>
                          <RangePageInput
                            id={`range-${entry.id}-to`}
                            label="To page"
                            value={entry.to}
                            pageCount={file.pageCount}
                            disabled={isProcessing}
                            onChange={(value) =>
                              onRangeChange(entry.id, "to", value)
                            }
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={onAddRange}
                      disabled={isProcessing}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-split-red/40 hover:bg-split-red/5 hover:text-split-red disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                      Add another range
                    </button>
                  </div>
                )}

                {rangeMode !== "smart" && rangeEntries.length > 1 ? (
                  <div className="space-y-3">
                    <div
                      className={cn(
                        "flex gap-3 rounded-xl border px-4 py-3",
                        mergeRanges
                          ? "border-split-red/30 bg-split-red/5"
                          : "border-blue-200 bg-blue-50/80",
                      )}
                    >
                      {mergeRanges ? (
                        <FileText
                          className="mt-0.5 h-4 w-4 shrink-0 text-split-red"
                          aria-hidden
                        />
                      ) : (
                        <Archive
                          className="mt-0.5 h-4 w-4 shrink-0 text-blue-600"
                          aria-hidden
                        />
                      )}
                      <p className="text-sm leading-relaxed text-gray-700">
                        {mergeRanges ? (
                          <>
                            All <strong>{rangeEntries.length} ranges</strong>{" "}
                            will be combined into{" "}
                            <strong>one PDF file</strong>.
                          </>
                        ) : (
                          <>
                            <strong>{rangeEntries.length} separate PDFs</strong>{" "}
                            will be created and downloaded as a{" "}
                            <strong>ZIP file</strong>.
                          </>
                        )}
                      </p>
                    </div>

                    <label
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors",
                        mergeRanges
                          ? "border-split-red bg-white shadow-sm"
                          : "border-gray-200 bg-white hover:border-gray-300",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={mergeRanges}
                        onChange={(event) =>
                          onMergeRangesChange(event.target.checked)
                        }
                        disabled={isProcessing}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-split-red focus:ring-split-red"
                      />
                      <span className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-brand-charcoal">
                          Merge all ranges into one PDF
                        </span>
                        <span className="text-xs text-gray-500">
                          Unchecked (default): each range becomes its own PDF
                          inside a ZIP.
                        </span>
                      </span>
                    </label>
                  </div>
                ) : null}
              </div>
            ) : null}

            {tab === "pages" ? (
              <div className="flex-1 space-y-3 overflow-y-auto">
                <p className="text-sm text-gray-500">
                  Click thumbnails to select pages ({selectedPages.length}{" "}
                  selected)
                </p>
                <PageThumbnailGrid
                  file={file.file}
                  pageCount={file.pageCount}
                  selectedPages={selectedPages}
                  onTogglePage={onTogglePage}
                />
              </div>
            ) : null}

            {tab === "size" ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-lg bg-split-panel px-4 py-8 text-center">
                <Crown className="mb-3 h-8 w-8 text-amber-500" />
                <p className="text-sm font-medium text-gray-700">
                  Split by file size
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Premium feature — coming soon.
                </p>
              </div>
            ) : null}
          </div>

          <div className="min-w-0 space-y-3 border-t border-gray-100 px-5 py-4">
            {progress && isProcessing ? <ProgressBar progress={progress} /> : null}
            {result ? (
              <DownloadResult result={result} onReset={onReset} compact />
            ) : null}

            <button
              type="button"
              onClick={onProcess}
              disabled={!canProcess || isProcessing || tab === "size"}
              className="flex w-full items-center justify-center gap-3 rounded-md bg-split-red px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-split-red-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Split PDF
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
