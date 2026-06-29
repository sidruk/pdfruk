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

type ProtectOptionsProps = {
  file: PdfFile;
  password: string;
  confirmPassword: string;
  allowPrint: boolean;
  allowCopy: boolean;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onAllowPrintChange: (value: boolean) => void;
  onAllowCopyChange: (value: boolean) => void;
  onRemove: () => void;
  disabled?: boolean;
};

export function ProtectOptions({
  file,
  password,
  confirmPassword,
  allowPrint,
  allowCopy,
  onPasswordChange,
  onConfirmPasswordChange,
  onAllowPrintChange,
  onAllowCopyChange,
  onRemove,
  disabled = false,
}: ProtectOptionsProps) {
  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

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

      <div className="space-y-4 rounded-lg border bg-card p-4">
        <div>
          <h2 className="text-sm font-medium">Set password</h2>
          <p className="text-sm text-muted-foreground">
            Anyone opening the PDF will need this password.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="protect-password">Password</Label>
          <Input
            id="protect-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            disabled={disabled}
            placeholder="Enter password"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="protect-confirm-password">Confirm password</Label>
          <Input
            id="protect-confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => onConfirmPasswordChange(event.target.value)}
            disabled={disabled}
            placeholder="Confirm password"
            aria-invalid={passwordsMismatch}
          />
          {passwordsMismatch ? (
            <p className="text-sm text-destructive">Passwords do not match.</p>
          ) : null}
        </div>

        <div className="space-y-3 border-t pt-4">
          <p className="text-sm font-medium">Permissions</p>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={allowPrint}
              onChange={(event) => onAllowPrintChange(event.target.checked)}
              disabled={disabled}
              className="rounded border-input"
            />
            Allow printing
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={allowCopy}
              onChange={(event) => onAllowCopyChange(event.target.checked)}
              disabled={disabled}
              className="rounded border-input"
            />
            Allow copying text
          </label>
        </div>
      </div>
    </div>
  );
}
