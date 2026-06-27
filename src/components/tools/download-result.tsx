"use client";

import { Download, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProcessResult } from "@/types/pdf";

type DownloadResultProps = {
  result: ProcessResult;
  onReset?: () => void;
  compact?: boolean;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatSavings(originalSize: number, compressedSize: number): string {
  if (compressedSize >= originalSize) {
    const increase = ((compressedSize - originalSize) / originalSize) * 100;
    return `${increase.toFixed(0)}% larger`;
  }

  const savings = ((originalSize - compressedSize) / originalSize) * 100;
  return `${savings.toFixed(0)}% smaller`;
}

export function DownloadResult({
  result,
  onReset,
  compact = false,
}: DownloadResultProps) {
  const handleDownload = () => {
    const url = URL.createObjectURL(result.blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = result.filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const metadata = result.metadata;

  return (
    <div
      className={cn(
        "rounded-lg border border-green-500/30 bg-green-500/5 p-3",
        compact
          ? "flex flex-col gap-3"
          : "flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="font-medium text-green-700 dark:text-green-400">
          Ready to download
        </p>
        <p className="truncate text-sm text-muted-foreground">
          {result.filename}
        </p>
        {metadata ? (
          <p className="text-sm text-muted-foreground">
            {formatBytes(metadata.originalSize)} →{" "}
            {formatBytes(metadata.compressedSize)} (
            {formatSavings(metadata.originalSize, metadata.compressedSize)})
          </p>
        ) : null}
      </div>
      <div
        className={cn(
          "flex shrink-0 gap-2",
          compact ? "flex-col" : "flex-col sm:flex-row sm:items-center",
        )}
      >
        <Button
          type="button"
          className={compact ? "w-full" : "w-full sm:w-auto"}
          onClick={handleDownload}
        >
          <Download className="mr-2 h-4 w-4 shrink-0" aria-hidden />
          Download
        </Button>
        {onReset ? (
          <Button
            type="button"
            variant="outline"
            className={compact ? "w-full" : "w-full sm:w-auto"}
            onClick={onReset}
          >
            <RotateCcw className="mr-2 h-4 w-4 shrink-0" aria-hidden />
            Process another
          </Button>
        ) : null}
      </div>
    </div>
  );
}
