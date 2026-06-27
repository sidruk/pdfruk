"use client";

import { FileText, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { COMPRESS_PRESETS } from "@/lib/pdf/compress-presets";
import { cn } from "@/lib/utils";
import type { CompressPreset, PdfFile } from "@/types/pdf";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type CompressOptionsProps = {
  file: PdfFile;
  preset: CompressPreset;
  onPresetChange: (preset: CompressPreset) => void;
  onRemove: () => void;
  disabled?: boolean;
};

export function CompressOptions({
  file,
  preset,
  onPresetChange,
  onRemove,
  disabled = false,
}: CompressOptionsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
        <FileText className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{file.name}</p>
          <p className="text-sm text-muted-foreground">
            {file.pageCount} page{file.pageCount === 1 ? "" : "s"} ·{" "}
            {formatBytes(file.file.size)}
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

      <div className="space-y-3 rounded-lg border bg-card p-4">
        <div>
          <h2 className="text-sm font-medium">Compression level</h2>
          <p className="text-sm text-muted-foreground">
            Pages are re-encoded as JPEG images. Text and links will not remain
            selectable.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {(Object.keys(COMPRESS_PRESETS) as CompressPreset[]).map((key) => {
            const option = COMPRESS_PRESETS[key];
            const isSelected = preset === key;

            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={() => onPresetChange(key)}
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-background hover:bg-muted/50",
                  disabled && "cursor-not-allowed opacity-50",
                )}
              >
                <p className="text-sm font-medium">{option.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
