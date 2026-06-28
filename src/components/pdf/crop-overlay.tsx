"use client";

import { useCallback, useRef, useState } from "react";

import { clampCropRect, isFullPageCrop } from "@/lib/pdf/crop-utils";
import { cn } from "@/lib/utils";
import type { CropRect } from "@/types/pdf";

type CropOverlayProps = {
  pageWidth: number;
  pageHeight: number;
  cropRect: CropRect;
  disabled?: boolean;
  onChange: (rect: CropRect) => void;
};

type DragMode =
  | "move"
  | "create"
  | "n"
  | "s"
  | "e"
  | "w"
  | "ne"
  | "nw"
  | "se"
  | "sw";

type DragState = {
  mode: DragMode;
  startX: number;
  startY: number;
  startRect: CropRect;
};

const HANDLE_SIZE = 10;

function toNormalizedPoint(
  clientX: number,
  clientY: number,
  bounds: DOMRect,
): { x: number; y: number } {
  return {
    x: Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width)),
    y: Math.max(0, Math.min(1, (clientY - bounds.top) / bounds.height)),
  };
}

function resizeRect(
  mode: DragMode,
  startRect: CropRect,
  deltaX: number,
  deltaY: number,
): CropRect {
  let { x, y, width, height } = startRect;
  const right = x + width;
  const bottom = y + height;

  if (mode.includes("w")) {
    x = Math.min(startRect.x + deltaX, right - 0.05);
    width = right - x;
  }

  if (mode.includes("e")) {
    width = Math.max(0.05, startRect.width + deltaX);
  }

  if (mode.includes("n")) {
    y = Math.min(startRect.y + deltaY, bottom - 0.05);
    height = bottom - y;
  }

  if (mode.includes("s")) {
    height = Math.max(0.05, startRect.height + deltaY);
  }

  return clampCropRect({ x, y, width, height });
}

export function CropOverlay({
  pageWidth,
  pageHeight,
  cropRect,
  disabled = false,
  onChange,
}: CropOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const finishDrag = useCallback(() => {
    dragRef.current = null;
    setIsDragging(false);
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent, mode: DragMode) => {
      if (disabled) return;

      const bounds = containerRef.current?.getBoundingClientRect();
      if (!bounds) return;

      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);

      const point = toNormalizedPoint(event.clientX, event.clientY, bounds);
      dragRef.current = {
        mode,
        startX: point.x,
        startY: point.y,
        startRect: cropRect,
      };
      setIsDragging(true);
    },
    [cropRect, disabled],
  );

  const handleContainerPointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (disabled || event.target !== event.currentTarget) return;

      const bounds = containerRef.current?.getBoundingClientRect();
      if (!bounds) return;

      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);

      const point = toNormalizedPoint(event.clientX, event.clientY, bounds);
      dragRef.current = {
        mode: "create",
        startX: point.x,
        startY: point.y,
        startRect: { x: point.x, y: point.y, width: 0, height: 0 },
      };
      setIsDragging(true);
    },
    [disabled],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      const bounds = containerRef.current?.getBoundingClientRect();
      if (!bounds) return;

      const point = toNormalizedPoint(event.clientX, event.clientY, bounds);
      const deltaX = point.x - drag.startX;
      const deltaY = point.y - drag.startY;

      if (drag.mode === "create") {
        const x = Math.min(drag.startX, point.x);
        const y = Math.min(drag.startY, point.y);
        const width = Math.abs(point.x - drag.startX);
        const height = Math.abs(point.y - drag.startY);

        if (width < 0.005 && height < 0.005) {
          return;
        }

        onChange(clampCropRect({ x, y, width, height }));
        return;
      }

      if (drag.mode === "move") {
        onChange(
          clampCropRect({
            x: drag.startRect.x + deltaX,
            y: drag.startRect.y + deltaY,
            width: drag.startRect.width,
            height: drag.startRect.height,
          }),
        );
        return;
      }

      onChange(resizeRect(drag.mode, drag.startRect, deltaX, deltaY));
    },
    [onChange],
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent) => {
      if (!dragRef.current) return;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      finishDrag();
    },
    [finishDrag],
  );

  const left = cropRect.x * pageWidth;
  const top = cropRect.y * pageHeight;
  const width = cropRect.width * pageWidth;
  const height = cropRect.height * pageHeight;

  const handles: Array<{ mode: DragMode; className: string; label: string }> = [
    {
      mode: "nw",
      className: "left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize",
      label: "Resize top left",
    },
    {
      mode: "n",
      className: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize",
      label: "Resize top",
    },
    {
      mode: "ne",
      className: "right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize",
      label: "Resize top right",
    },
    {
      mode: "e",
      className: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize",
      label: "Resize right",
    },
    {
      mode: "se",
      className: "right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize",
      label: "Resize bottom right",
    },
    {
      mode: "s",
      className: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-ns-resize",
      label: "Resize bottom",
    },
    {
      mode: "sw",
      className: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize",
      label: "Resize bottom left",
    },
    {
      mode: "w",
      className: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize",
      label: "Resize left",
    },
  ];

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 touch-none select-none",
        disabled ? "pointer-events-none" : "cursor-crosshair",
        isDragging && "cursor-grabbing",
      )}
      onPointerDown={handleContainerPointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={finishDrag}
    >
      <div
        className="absolute border-2 border-white bg-white/5 shadow-[0_0_0_9999px_rgba(55,65,81,0.45)]"
        style={{
          left,
          top,
          width,
          height,
        }}
        onPointerDown={(event) => {
          if (isFullPageCrop(cropRect)) {
            handlePointerDown(event, "create");
            return;
          }

          handlePointerDown(event, "move");
        }}
      >
        {!disabled
          ? handles.map((handle) => (
              <button
                key={handle.mode}
                type="button"
                aria-label={handle.label}
                className={cn(
                  "absolute z-10 rounded-full border-2 border-white bg-blue-500 shadow-sm",
                  handle.className,
                )}
                style={{ width: HANDLE_SIZE, height: HANDLE_SIZE }}
                onPointerDown={(event) => handlePointerDown(event, handle.mode)}
              />
            ))
          : null}
      </div>
    </div>
  );
}
