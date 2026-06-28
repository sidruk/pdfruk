"use client";

import {
  ChevronDown,
  FilePlus2,
  FileSpreadsheet,
  FileText,
  PieChart,
} from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DropzoneSurfaceProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  isDragActive?: boolean;
  isDragReject?: boolean;
};

export function DropzoneSurface({
  children,
  className,
  disabled,
  isDragActive,
  isDragReject,
}: DropzoneSurfaceProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-brand-red px-6 py-10 transition-colors",
        isDragActive && !isDragReject && "bg-brand-red-hover",
        isDragReject && "bg-destructive",
        disabled && "opacity-60",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-3 rounded-lg border-2 border-dashed border-white/50"
        aria-hidden
      />
      <div className="relative flex flex-col items-center justify-center gap-4 text-center">
        {children}
      </div>
    </div>
  );
}

export function DropzoneFileIcons() {
  return (
    <div
      className="relative flex h-[72px] w-[200px] items-end justify-center"
      aria-hidden
    >
      <div className="absolute bottom-1 left-3 -rotate-12 rounded-md border-2 border-white/80 bg-white/10 p-2 shadow-sm backdrop-blur-[1px]">
        <FileSpreadsheet className="h-7 w-7 text-white" strokeWidth={1.5} />
      </div>
      <div className="relative z-10 flex flex-col items-center rounded-md border-2 border-white bg-white/15 px-3 py-2 shadow-md backdrop-blur-[1px]">
        <FileText className="h-8 w-8 text-white" strokeWidth={1.5} />
        <span className="mt-0.5 text-[10px] font-bold tracking-wide text-white">
          PDF
        </span>
      </div>
      <div className="absolute bottom-1 right-3 rotate-12 rounded-md border-2 border-white/80 bg-white/10 p-2 shadow-sm backdrop-blur-[1px]">
        <PieChart className="h-7 w-7 text-white" strokeWidth={1.5} />
      </div>
    </div>
  );
}

type DropzoneChooseButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
};

export function DropzoneChooseButton({
  onClick,
  disabled,
  label = "Choose files",
}: DropzoneChooseButtonProps) {
  return (
    <div className="flex overflow-hidden rounded-md shadow-md">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="inline-flex items-center gap-2 bg-white px-5 py-2.5 text-sm font-bold tracking-wide text-brand-charcoal transition-colors hover:bg-white/95 disabled:pointer-events-none disabled:opacity-70"
      >
        <FilePlus2 className="h-4 w-4 shrink-0" strokeWidth={2.25} />
        {label.toUpperCase()}
      </button>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={`${label} options`}
        className="inline-flex items-center border-l border-border/60 bg-white px-2.5 py-2.5 text-brand-charcoal transition-colors hover:bg-white/95 disabled:pointer-events-none disabled:opacity-70"
      >
        <ChevronDown className="h-4 w-4" strokeWidth={2.25} />
      </button>
    </div>
  );
}

export function DropzoneHint({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm font-medium text-white/90">{children}</p>
  );
}
