"use client";

import { useEffect, type CSSProperties } from "react";

import { FileText, X } from "lucide-react";

import { usePdfThumbnails } from "@/hooks/use-pdf-thumbnails";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { PageNumberOptions, PageNumberPosition, PdfFile } from "@/types/pdf";

const POSITIONS: { value: PageNumberPosition; label: string }[] = [
  { value: "top-left", label: "Top left" },
  { value: "top-center", label: "Top center" },
  { value: "top-right", label: "Top right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-center", label: "Bottom center" },
  { value: "bottom-right", label: "Bottom right" },
];

function formatPreviewText(
  format: string,
  pageNumber: number,
  totalPages: number,
): string {
  return format
    .replace(/\{total\}/g, String(totalPages))
    .replace(/\{n\}/g, String(pageNumber));
}

function getPreviewPositionStyle(
  position: PageNumberPosition,
  marginPt: number,
): CSSProperties {
  const margin = `${Math.max(6, marginPt * 0.35)}px`;

  switch (position) {
    case "top-left":
      return { top: margin, left: margin };
    case "top-center":
      return { top: margin, left: "50%", transform: "translateX(-50%)" };
    case "top-right":
      return { top: margin, right: margin };
    case "bottom-left":
      return { bottom: margin, left: margin };
    case "bottom-center":
      return { bottom: margin, left: "50%", transform: "translateX(-50%)" };
    case "bottom-right":
      return { bottom: margin, right: margin };
  }
}

type PageNumbersOptionsProps = {
  file: PdfFile;
  options: PageNumberOptions;
  onOptionChange: <K extends keyof PageNumberOptions>(
    key: K,
    value: PageNumberOptions[K],
  ) => void;
  onRemove: () => void;
  disabled?: boolean;
};

export function PageNumbersOptions({
  file,
  options,
  onOptionChange,
  onRemove,
  disabled = false,
}: PageNumbersOptionsProps) {
  const { pages, isLoading, renderThumbnail } = usePdfThumbnails(
    file.file,
    1,
  );
  const preview = pages[0];
  const previewText = formatPreviewText(
    options.format,
    options.startNumber,
    file.pageCount,
  );

  useEffect(() => {
    if (preview && !preview.thumbnailUrl) {
      void renderThumbnail(0);
    }
  }, [preview, renderThumbnail]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
        <FileText className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{file.name}</p>
          <p className="text-sm text-muted-foreground">
            {file.pageCount} page{file.pageCount === 1 ? "" : "s"}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          disabled={disabled}
          aria-label={`Remove ${file.name}`}
        >
          <X className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border bg-card p-4">
          <div>
            <h2 className="text-sm font-medium">Numbering options</h2>
            <p className="text-sm text-muted-foreground">
              Use {"{n}"} for the page number and {"{total}"} for the page count.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="page-number-format">Format</Label>
              <Input
                id="page-number-format"
                value={options.format}
                disabled={disabled}
                onChange={(event) => onOptionChange("format", event.target.value)}
                placeholder="Page {n} of {total}"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="page-number-position">Position</Label>
              <Select
                value={options.position}
                onValueChange={(value) =>
                  onOptionChange("position", value as PageNumberPosition)
                }
                disabled={disabled}
              >
                <SelectTrigger id="page-number-position" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POSITIONS.map((position) => (
                    <SelectItem key={position.value} value={position.value}>
                      {position.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="page-number-start">Start at</Label>
              <Input
                id="page-number-start"
                type="number"
                min={1}
                value={options.startNumber}
                disabled={disabled}
                onChange={(event) =>
                  onOptionChange("startNumber", Number(event.target.value) || 1)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="page-number-size">Font size</Label>
              <Input
                id="page-number-size"
                type="number"
                min={8}
                max={48}
                value={options.fontSize}
                disabled={disabled}
                onChange={(event) =>
                  onOptionChange("fontSize", Number(event.target.value) || 12)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="page-number-margin">Margin (pt)</Label>
              <Input
                id="page-number-margin"
                type="number"
                min={0}
                max={120}
                value={options.margin}
                disabled={disabled}
                onChange={(event) =>
                  onOptionChange("margin", Number(event.target.value) || 0)
                }
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="page-number-color">Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="page-number-color"
                  type="color"
                  value={options.color}
                  disabled={disabled}
                  className="h-8 w-14 p-1"
                  onChange={(event) => onOptionChange("color", event.target.value)}
                />
                <span className="text-sm text-muted-foreground">{options.color}</span>
              </div>
            </div>
          </div>

          <div className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            Preview text:{" "}
            <span className={cn("font-medium text-foreground")}>{previewText}</span>
          </div>
        </div>

        <div className="space-y-2 rounded-lg border bg-card p-4">
          <h2 className="text-sm font-medium">Preview (page 1)</h2>
          <div className="relative mx-auto aspect-[3/4] max-w-xs overflow-hidden rounded-md bg-muted">
            {isLoading || !preview?.thumbnailUrl ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Loading preview...
              </div>
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview.thumbnailUrl}
                  alt="Page number preview"
                  className="h-full w-full object-contain"
                />
                <span
                  className="pointer-events-none absolute font-sans font-normal leading-none"
                  style={{
                    color: options.color,
                    fontSize: Math.max(10, options.fontSize * 0.55),
                    ...getPreviewPositionStyle(options.position, options.margin),
                  }}
                >
                  {previewText}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
