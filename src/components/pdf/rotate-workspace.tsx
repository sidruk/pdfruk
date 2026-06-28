"use client";

import { useEffect, useRef } from "react";
import { FileText, RotateCcw, RotateCw, X } from "lucide-react";

import { usePdfThumbnails } from "@/hooks/use-pdf-thumbnails";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PdfFile, RotationAngle } from "@/types/pdf";

type RotatePageCardProps = {
  pageIndex: number;
  thumbnailUrl?: string;
  rotation: RotationAngle;
  disabled?: boolean;
  onRotatePage: (pageIndex: number, delta: 90 | -90) => void;
  onVisible: (pageIndex: number) => void;
};

function RotatePageCard({
  pageIndex,
  thumbnailUrl,
  rotation,
  disabled,
  onRotatePage,
  onVisible,
}: RotatePageCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onVisible(pageIndex);
          }
        });
      },
      { rootMargin: "100px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [onVisible, pageIndex]);

  return (
    <div ref={ref} className="overflow-hidden rounded-lg border bg-card">
      <div className="relative aspect-[3/4] w-full bg-muted">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={`Page ${pageIndex + 1}`}
            className="h-full w-full object-contain transition-transform duration-200"
            style={{ transform: `rotate(${rotation}deg)` }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Loading...
          </div>
        )}
        <span
          className={cn(
            "absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium text-white",
            rotation === 0 ? "bg-muted-foreground/80" : "bg-brand-red",
          )}
        >
          {rotation}°
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 border-t px-2 py-2">
        <span className="text-xs font-medium">Page {pageIndex + 1}</span>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            aria-label={`Rotate page ${pageIndex + 1} left`}
            onClick={() => onRotatePage(pageIndex, -90)}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            aria-label={`Rotate page ${pageIndex + 1} right`}
            onClick={() => onRotatePage(pageIndex, 90)}
          >
            <RotateCw className="h-3.5 w-3.5" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}

type RotateWorkspaceProps = {
  file: PdfFile;
  rotations: Record<number, RotationAngle>;
  disabled?: boolean;
  onRotatePage: (pageIndex: number, delta: 90 | -90) => void;
  onRotateAll: (delta: 90 | -90) => void;
  onRemove: () => void;
};

export function RotateWorkspace({
  file,
  rotations,
  disabled = false,
  onRotatePage,
  onRotateAll,
  onRemove,
}: RotateWorkspaceProps) {
  const { pages, isLoading, renderThumbnail } = usePdfThumbnails(
    file.file,
    file.pageCount,
  );

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

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => onRotateAll(-90)}
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          Rotate all left
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => onRotateAll(90)}
        >
          <RotateCw className="h-4 w-4" aria-hidden />
          Rotate all right
        </Button>
      </div>

      {isLoading && pages.length === 0 ? (
        <p className="text-sm text-muted-foreground">Loading page previews...</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {pages.map((page) => (
            <RotatePageCard
              key={page.pageIndex}
              pageIndex={page.pageIndex}
              thumbnailUrl={page.thumbnailUrl}
              rotation={rotations[page.pageIndex] ?? 0}
              disabled={disabled}
              onRotatePage={onRotatePage}
              onVisible={renderThumbnail}
            />
          ))}
        </div>
      )}
    </div>
  );
}
