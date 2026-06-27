"use client";

import { Upload } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import { useDropzone, type Accept } from "react-dropzone";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FileDropzoneOptions = {
  onFilesAccepted: (files: File[]) => void;
  accept?: Accept;
  multiple?: boolean;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
};

type FileDropzoneContextValue = {
  open: () => void;
  isDragActive: boolean;
  isDragReject: boolean;
  disabled: boolean;
};

const FileDropzoneContext = createContext<FileDropzoneContextValue | null>(
  null,
);

function useFileDropzoneContext() {
  const context = useContext(FileDropzoneContext);
  if (!context) {
    throw new Error("FileDropzone components must be used within FileDropzoneProvider");
  }
  return context;
}

export function FileDropzoneProvider({
  onFilesAccepted,
  accept,
  multiple = true,
  disabled = false,
  children,
  className,
}: FileDropzoneOptions) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFilesAccepted(acceptedFiles);
      }
    },
    [onFilesAccepted],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject, open } =
    useDropzone({
      onDrop,
      accept,
      multiple,
      disabled,
      noClick: true,
      noKeyboard: disabled,
    });

  return (
    <FileDropzoneContext.Provider
      value={{ open, isDragActive, isDragReject, disabled }}
    >
      <div
        {...getRootProps()}
        className={cn("relative outline-none", className)}
      >
        <input {...getInputProps()} />
        {isDragActive && !disabled ? (
          <div
            className={cn(
              "pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-xl border-2 border-dashed transition-colors",
              isDragReject
                ? "border-destructive bg-destructive/10"
                : "border-primary bg-primary/10",
            )}
            aria-hidden
          >
            <div className="flex flex-col items-center gap-2 px-6 text-center">
              <Upload className="h-10 w-10 text-primary" />
              <p className="text-base font-semibold">
                {isDragReject ? "Unsupported file type" : "Drop files to upload"}
              </p>
            </div>
          </div>
        ) : null}
        {children}
      </div>
    </FileDropzoneContext.Provider>
  );
}

type FileDropzoneProps = {
  label?: string;
  description?: string;
  selectLabel?: string;
};

export function FileDropzone({
  label = "Drop files here",
  description = "or select files from your device",
  selectLabel = "Select files",
}: FileDropzoneProps) {
  const { open, isDragActive, isDragReject, disabled } =
    useFileDropzoneContext();

  return (
    <div
      className={cn(
        "flex min-h-40 flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
        isDragActive && !isDragReject && "border-primary bg-primary/5",
        isDragReject && "border-destructive bg-destructive/5",
        disabled && "opacity-60",
        !isDragActive && !isDragReject && "border-border",
      )}
    >
      <Upload className="mb-3 h-10 w-10 text-muted-foreground" aria-hidden />
      <p className="text-base font-semibold">{label}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <Button
        type="button"
        size="lg"
        className="mt-4 bg-brand-red text-base hover:bg-brand-red-hover"
        onClick={open}
        disabled={disabled}
      >
        {selectLabel}
      </Button>
    </div>
  );
}
