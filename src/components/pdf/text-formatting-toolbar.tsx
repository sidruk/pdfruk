"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Italic,
  PaintBucket,
  Trash2,
  Underline,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { TextAlign, TextAnnotation } from "@/types/pdf";

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 24, 28, 36, 48, 60, 72];

const OPACITY_OPTIONS = [25, 50, 75, 100];

const ALIGN_OPTIONS: { id: TextAlign; icon: typeof AlignLeft; label: string }[] =
  [
    { id: "left", icon: AlignLeft, label: "Align left" },
    { id: "center", icon: AlignCenter, label: "Align center" },
    { id: "right", icon: AlignRight, label: "Align right" },
  ];

type TextFormattingToolbarProps = {
  annotation: TextAnnotation;
  style?: React.CSSProperties;
  variant?: "floating" | "overlay";
  onUpdate: (patch: Partial<TextAnnotation>) => void;
  onRemove: () => void;
};

function ToolbarDivider() {
  return <div className="mx-1 h-6 w-px shrink-0 bg-gray-200" aria-hidden />;
}

function ToolbarButton({
  active,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded text-gray-700 transition-colors hover:bg-gray-100",
        active && "bg-blue-50 text-blue-700",
      )}
    >
      {children}
    </button>
  );
}

function ToolbarSelect({
  value,
  onChange,
  options,
  ariaLabel,
  className,
}: {
  value: string | number;
  onChange: (value: string) => void;
  options: { value: string | number; label: string }[];
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div className={cn("relative shrink-0", className)}>
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 appearance-none rounded border border-gray-200 bg-white pl-2 pr-6 text-sm text-gray-800 outline-none hover:border-gray-300 focus:border-blue-400"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
        aria-hidden
      />
    </div>
  );
}

export function TextFormattingToolbar({
  annotation,
  style,
  variant = "floating",
  onUpdate,
  onRemove,
}: TextFormattingToolbarProps) {
  const opacity = annotation.opacity ?? 100;
  const textAlign = annotation.textAlign ?? "left";
  const fillColor = annotation.backgroundColor ?? "#ffff00";
  const isOverlay = variant === "overlay";

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-center gap-0.5 rounded-md border border-gray-200 bg-white px-2 py-1.5 shadow-lg",
        isOverlay
          ? "max-w-[calc(100%-1rem)] justify-center overflow-x-auto"
          : "absolute z-10 max-w-[calc(100%-1rem)] overflow-x-auto",
      )}
      style={isOverlay ? undefined : style}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <span className="mx-0.5 text-xs font-semibold text-gray-500" aria-hidden>
        T<sub className="text-[10px]">t</sub>
      </span>
      <ToolbarSelect
        ariaLabel="Font size"
        value={annotation.fontSize}
        onChange={(value) => onUpdate({ fontSize: Number(value) })}
        options={FONT_SIZES.map((size) => ({
          value: size,
          label: String(size),
        }))}
        className="w-[4.5rem]"
      />

      <ToolbarDivider />

      <ToolbarButton
        label="Bold"
        active={annotation.bold}
        onClick={() => onUpdate({ bold: !annotation.bold })}
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={annotation.italic}
        onClick={() => onUpdate({ italic: !annotation.italic })}
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        active={annotation.underline ?? false}
        onClick={() => onUpdate({ underline: !(annotation.underline ?? false) })}
      >
        <Underline className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <label
        className="relative flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded hover:bg-gray-100"
        aria-label="Text color"
      >
        <span className="text-sm font-semibold text-gray-800">A</span>
        <span
          className="absolute bottom-1.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full"
          style={{ backgroundColor: annotation.color }}
        />
        <input
          type="color"
          value={annotation.color}
          onMouseDown={(event) => event.preventDefault()}
          onChange={(event) => onUpdate({ color: event.target.value })}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>

      <label
        className="relative flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded hover:bg-gray-100"
        aria-label="Fill color"
      >
        <PaintBucket className="h-4 w-4 text-gray-700" />
        <span
          className="absolute bottom-1 left-1/2 h-0.5 w-3 -translate-x-1/2 rounded-full"
          style={{
            backgroundColor:
              annotation.backgroundColor === null
                ? "transparent"
                : fillColor,
          }}
        />
        <input
          type="color"
          value={fillColor}
          onMouseDown={(event) => event.preventDefault()}
          onChange={(event) =>
            onUpdate({ backgroundColor: event.target.value })
          }
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>

      <ToolbarDivider />

      {ALIGN_OPTIONS.map((option) => {
        const Icon = option.icon;
        return (
          <ToolbarButton
            key={option.id}
            label={option.label}
            active={textAlign === option.id}
            onClick={() => onUpdate({ textAlign: option.id })}
          >
            <Icon className="h-4 w-4" />
          </ToolbarButton>
        );
      })}

      <ToolbarDivider />

      <div
        className="mx-0.5 h-4 w-4 shrink-0 rounded-sm border border-gray-300 bg-[length:4px_4px] bg-[position:0_0,2px_2px] bg-white"
        style={{
          backgroundImage:
            "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
        }}
        aria-hidden
      />
      <ToolbarSelect
        ariaLabel="Opacity"
        value={opacity}
        onChange={(value) => onUpdate({ opacity: Number(value) })}
        options={OPACITY_OPTIONS.map((value) => ({
          value,
          label: `${value}%`,
        }))}
        className="w-[5rem]"
      />

      <ToolbarDivider />

      <ToolbarButton label="Delete text" onClick={onRemove}>
        <Trash2 className="h-4 w-4 text-gray-600" />
      </ToolbarButton>
    </div>
  );
}
