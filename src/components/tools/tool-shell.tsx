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
  dropzoneLabel?: string;
  dropzoneDescription?: string;
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
};

export function ToolShell({
  title,
  description,
  accept,
  multiple = true,
  onFilesAccepted,
  dropzoneLabel,
  dropzoneDescription,
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
}: ToolShellProps) {
  const fileDropDisabled = dropzoneDisabled || isProcessing || !showDropzone;

  return (
    <FileDropzoneProvider
      onFilesAccepted={onFilesAccepted}
      accept={accept}
      multiple={multiple}
      disabled={fileDropDisabled}
      className={`mx-auto flex min-h-[calc(100vh-12rem)] w-full flex-col gap-6 px-4 py-8 sm:px-6 ${
        wide ? "max-w-6xl" : "max-w-4xl"
      }`}
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-brand-charcoal sm:text-3xl">
            {title}
          </h1>
          <PrivacyBadge />
        </div>
        <p className="max-w-2xl text-base text-muted-foreground">{description}</p>
      </div>

      {showDropzone ? (
        <FileDropzone
          label={dropzoneLabel}
          description={dropzoneDescription}
          selectLabel={multiple ? "Select files" : "Select file"}
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
