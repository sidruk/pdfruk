"use client";

import { FileText, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PdfFile } from "@/types/pdf";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type UnlockOptionsProps = {
  file: PdfFile;
  password: string;
  onPasswordChange: (value: string) => void;
  onRemove: () => void;
  disabled?: boolean;
};

export function UnlockOptions({
  file,
  password,
  onPasswordChange,
  onRemove,
  disabled = false,
}: UnlockOptionsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
        <FileText className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{file.name}</p>
          <p className="text-sm text-muted-foreground">
            {file.pageCount > 0
              ? `${file.pageCount} page${file.pageCount === 1 ? "" : "s"}`
              : "Password protected"}{" "}
            · {formatBytes(file.file.size)}
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

      <div className="space-y-4 rounded-lg border bg-card p-4">
        <div>
          <h2 className="text-sm font-medium">Enter password</h2>
          <p className="text-sm text-muted-foreground">
            Provide the password used to protect this PDF.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unlock-password">PDF password</Label>
          <Input
            id="unlock-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            disabled={disabled}
            placeholder="Enter password"
          />
        </div>
      </div>
    </div>
  );
}
