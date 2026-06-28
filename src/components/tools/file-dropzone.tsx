"use client";

import { Upload } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import { useDropzone, type Accept } from "react-dropzone";

import {
  DropzoneChooseButton,
  DropzoneFileIcons,
  DropzoneHint,
  DropzoneSurface,
} from "@/components/tools/dropzone-content";
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
              "pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden rounded-xl transition-colors",
              isDragReject ? "bg-destructive" : "bg-brand-red-hover",
            )}
            aria-hidden
          >
            <div className="absolute inset-3 rounded-lg border-2 border-dashed border-white/60" />
            <div className="relative flex flex-col items-center gap-2 px-6 text-center">
              <Upload className="h-10 w-10 text-white" />
              <p className="text-base font-semibold text-white">
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
  hint?: string;
  selectLabel?: string;
};

export function FileDropzone({
  hint = "or drop files here",
  selectLabel = "Choose files",
}: FileDropzoneProps) {
  const { open, isDragActive, isDragReject, disabled } =
    useFileDropzoneContext();

  return (
    <DropzoneSurface
      disabled={disabled}
      isDragActive={isDragActive}
      isDragReject={isDragReject}
    >
      <DropzoneFileIcons />
      <DropzoneChooseButton
        onClick={open}
        disabled={disabled}
        label={selectLabel}
      />
      <DropzoneHint>{hint}</DropzoneHint>
    </DropzoneSurface>
  );
}
