"use client";

import type { ReactNode } from "react";
import type { Accept } from "react-dropzone";

import { DownloadResult } from "@/components/tools/download-result";
import {
  FileDropzone,
  FileDropzoneProvider,
} from "@/components/tools/file-dropzone";
import { PrivacyBadge } from "@/components/tools/privacy-badge";
import { ProcessButton } from "@/components/tools/process-button";
import { ProgressBar } from "@/components/tools/progress-bar";
import type { ProcessProgress, ProcessResult } from "@/types/pdf";

type ToolShellProps = {
  title: string;
  description: string;
  accept?: Accept;
  multiple?: boolean;
  onFilesAccepted: (files: File[]) => void;
  dropzoneHint?: string;
  dropzoneSelectLabel?: string;
  showDropzone?: boolean;
  children?: ReactNode;
  canProcess: boolean;
  onProcess: () => void;
  isProcessing?: boolean;
  progress?: ProcessProgress | null;
  result?: ProcessResult | null;
  onReset?: () => void;
  processLabel?: string;
  dropzoneDisabled?: boolean;
  showProcessButton?: boolean;
  wide?: boolean;
  hideIntro?: boolean;
  privacyLabel?: string;
};

export function ToolShell({
  title,
  description,
  accept,
  multiple = true,
  onFilesAccepted,
  dropzoneHint,
  dropzoneSelectLabel,
  showDropzone = true,
  children,
  canProcess,
  onProcess,
  isProcessing = false,
  progress,
  result,
  onReset,
  processLabel,
  dropzoneDisabled = false,
  showProcessButton = true,
  wide = false,
  hideIntro = false,
  privacyLabel,
}: ToolShellProps) {
  const fileDropDisabled = dropzoneDisabled || isProcessing || !showDropzone;

  return (
    <FileDropzoneProvider
      onFilesAccepted={onFilesAccepted}
      accept={accept}
      multiple={multiple}
      disabled={fileDropDisabled}
      className={`mx-auto flex min-h-[calc(100vh-12rem)] w-full flex-col px-4 sm:px-6 ${
        hideIntro ? "gap-0 py-4" : "gap-6 py-8"
      } ${wide ? "max-w-[1280px]" : "max-w-4xl"}`}
    >
      {hideIntro ? null : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-brand-charcoal sm:text-3xl">
              {title}
            </h1>
            <PrivacyBadge label={privacyLabel} />
          </div>
          <p className="max-w-2xl text-base text-muted-foreground">{description}</p>
        </div>
      )}

      {showDropzone ? (
        <FileDropzone
          hint={dropzoneHint}
          selectLabel={
            dropzoneSelectLabel ?? (multiple ? "Choose files" : "Choose file")
          }
        />
      ) : null}

      {children}

      {showProcessButton ? (
        <div className="flex flex-col gap-4">
          <ProcessButton
            onProcess={onProcess}
            disabled={!canProcess}
            isProcessing={isProcessing}
            label={processLabel}
          />

          {progress && isProcessing ? <ProgressBar progress={progress} /> : null}

          {result ? <DownloadResult result={result} onReset={onReset} /> : null}
        </div>
      ) : null}
    </FileDropzoneProvider>
  );
}
