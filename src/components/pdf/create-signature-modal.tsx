"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Pencil,
  Redo2,
  Type,
  Undo2,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropzoneChooseButton,
  DropzoneHint,
  DropzoneSurface,
} from "@/components/tools/dropzone-content";
import { cn } from "@/lib/utils";

const SIGNATURE_COLORS = [
  { id: "black", value: "#000000", label: "Black" },
  { id: "blue", value: "#2563eb", label: "Blue" },
  { id: "red", value: "#dc2626", label: "Red" },
] as const;

const SIGNATURE_FONT =
  '"Segoe Script", "Brush Script MT", "Lucida Handwriting", cursive';

type SignatureTab = "draw" | "type" | "upload";

type Stroke = {
  color: string;
  points: Array<{ x: number; y: number }>;
};

type CreateSignatureModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (dataUrl: string) => void;
};

function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {SIGNATURE_COLORS.map((color) => (
        <button
          key={color.id}
          type="button"
          aria-label={color.label}
          onClick={() => onChange(color.value)}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md border transition-colors",
            value === color.value
              ? "border-blue-400 bg-blue-50"
              : "border-transparent hover:bg-gray-50",
          )}
        >
          <span
            className="h-5 w-5 rounded-full border border-black/10"
            style={{ backgroundColor: color.value }}
          />
        </button>
      ))}
    </div>
  );
}

function useCanvasSize(
  containerRef: React.RefObject<HTMLDivElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      const width = container.clientWidth;
      const height = 180;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [canvasRef, containerRef]);
}

function drawStroke(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  lineWidth = 2.5,
) {
  if (stroke.points.length < 2) return;
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
  for (let i = 1; i < stroke.points.length; i += 1) {
    ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
  }
  ctx.stroke();
}

function redrawCanvas(canvas: HTMLCanvasElement, strokes: Stroke[]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  ctx.clearRect(0, 0, width, height);
  for (const stroke of strokes) {
    drawStroke(ctx, stroke);
  }
}

function DrawSignaturePanel({
  color,
  onColorChange,
  onCanCreateChange,
  exportRef,
}: {
  color: string;
  onColorChange: (color: string) => void;
  onCanCreateChange: (canCreate: boolean) => void;
  exportRef: React.MutableRefObject<(() => string | null) | null>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);

  useCanvasSize(containerRef, canvasRef);

  useEffect(() => {
    onCanCreateChange(strokes.length > 0);
  }, [onCanCreateChange, strokes.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    redrawCanvas(canvas, strokes);
  }, [strokes]);

  exportRef.current = () => {
    const canvas = canvasRef.current;
    if (!canvas || strokes.length === 0) return null;
    return canvas.toDataURL("image/png");
  };

  const getPoint = (event: React.MouseEvent | MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handlePointerDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getPoint(event);
    if (!point) return;
    isDrawing.current = true;
    setRedoStack([]);
    setStrokes((current) => [...current, { color, points: [point] }]);
  };

  const handlePointerMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const point = getPoint(event);
    if (!point) return;
    setStrokes((current) => {
      if (current.length === 0) return current;
      const next = [...current];
      const last = next[next.length - 1];
      next[next.length - 1] = {
        ...last,
        points: [...last.points, point],
      };
      return next;
    });
  };

  const stopDrawing = useCallback(() => {
    isDrawing.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener("mouseup", stopDrawing);
    return () => window.removeEventListener("mouseup", stopDrawing);
  }, [stopDrawing]);

  const handleUndo = () => {
    setStrokes((current) => {
      if (current.length === 0) return current;
      const next = [...current];
      const removed = next.pop();
      if (removed) {
        setRedoStack((redo) => [...redo, removed]);
      }
      return next;
    });
  };

  const handleRedo = () => {
    setRedoStack((current) => {
      if (current.length === 0) return current;
      const next = [...current];
      const restored = next.pop();
      if (restored) {
        setStrokes((strokes) => [...strokes, restored]);
      }
      return next;
    });
  };

  const handleClear = () => {
    setStrokes([]);
    setRedoStack([]);
  };

  return (
    <div className="space-y-3">
      <ColorPicker value={color} onChange={onColorChange} />
      <div
        ref={containerRef}
        className="overflow-hidden rounded-lg border border-gray-200 bg-white"
      >
        <canvas
          ref={canvasRef}
          className="block w-full cursor-crosshair touch-none"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
        <div className="flex items-center justify-between border-t border-blue-200 bg-white px-3 py-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Undo"
              disabled={strokes.length === 0}
              onClick={handleUndo}
              className="rounded p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Redo"
              disabled={redoStack.length === 0}
              onClick={handleRedo}
              className="rounded p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

function TypeSignaturePanel({
  color,
  onColorChange,
  onCanCreateChange,
  exportRef,
}: {
  color: string;
  onColorChange: (color: string) => void;
  onCanCreateChange: (canCreate: boolean) => void;
  exportRef: React.MutableRefObject<(() => string | null) | null>;
}) {
  const [text, setText] = useState("");

  useEffect(() => {
    onCanCreateChange(text.trim().length > 0);
  }, [onCanCreateChange, text]);

  exportRef.current = () => {
    const trimmed = text.trim();
    if (!trimmed) return null;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const fontSize = 64;
    ctx.font = `${fontSize}px ${SIGNATURE_FONT}`;
    const metrics = ctx.measureText(trimmed);
    const padding = 24;
    canvas.width = Math.ceil(metrics.width + padding * 2);
    canvas.height = fontSize + padding * 2;

    ctx.font = `${fontSize}px ${SIGNATURE_FONT}`;
    ctx.fillStyle = color;
    ctx.textBaseline = "middle";
    ctx.fillText(trimmed, padding, canvas.height / 2);

    return canvas.toDataURL("image/png");
  };

  return (
    <div className="space-y-3">
      <ColorPicker value={color} onChange={onColorChange} />
      <input
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Type your signature"
        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
      />
      <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-gray-200 bg-white px-4">
        <span
          className="text-5xl"
          style={{ color, fontFamily: SIGNATURE_FONT }}
        >
          {text.trim() || "Preview"}
        </span>
      </div>
    </div>
  );
}

function UploadSignaturePanel({
  onCanCreateChange,
  exportRef,
}: {
  onCanCreateChange: (canCreate: boolean) => void;
  exportRef: React.MutableRefObject<(() => string | null) | null>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    onCanCreateChange(preview !== null);
  }, [onCanCreateChange, preview]);

  exportRef.current = () => preview;

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/") && !/\.(png|jpe?g)$/i.test(file.name)) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleFile(file);
          event.target.value = "";
        }}
      />
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
      >
        <DropzoneSurface className="min-h-[220px]">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Signature preview"
              className="max-h-36 max-w-full object-contain"
            />
          ) : (
            <>
              <DropzoneChooseButton
                onClick={() => inputRef.current?.click()}
                label="Choose image"
              />
              <DropzoneHint>or drop a PNG or JPG here</DropzoneHint>
            </>
          )}
        </DropzoneSurface>
      </div>
      {preview ? (
        <button
          type="button"
          onClick={() => setPreview(null)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Remove image
        </button>
      ) : null}
    </div>
  );
}

export function CreateSignatureModal({
  open,
  onClose,
  onCreate,
}: CreateSignatureModalProps) {
  const [tab, setTab] = useState<SignatureTab>("draw");
  const [color, setColor] = useState<string>(SIGNATURE_COLORS[0].value);
  const [canCreate, setCanCreate] = useState(false);
  const exportRef = useRef<(() => string | null) | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  useEffect(() => {
    if (open) return;
    setTab("draw");
    setColor(SIGNATURE_COLORS[0].value);
    setCanCreate(false);
  }, [open]);

  useEffect(() => {
    setCanCreate(false);
  }, [tab]);

  if (!open) return null;

  const handleCreate = () => {
    const dataUrl = exportRef.current?.();
    if (!dataUrl) return;
    onCreate(dataUrl);
    onClose();
  };

  const tabs: Array<{
    id: SignatureTab;
    label: string;
    icon: typeof Pencil;
  }> = [
    { id: "draw", label: "Draw", icon: Pencil },
    { id: "type", label: "Type", icon: Type },
    { id: "upload", label: "Upload", icon: Upload },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-signature-title"
        className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2
            id="create-signature-title"
            className="text-lg font-bold text-brand-charcoal"
          >
            Create signature
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 pt-4">
          <div className="mb-4 grid grid-cols-3 gap-2 rounded-lg bg-gray-100 p-1">
            {tabs.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-white/70",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {tab === "draw" ? (
            <DrawSignaturePanel
              color={color}
              onColorChange={setColor}
              onCanCreateChange={setCanCreate}
              exportRef={exportRef}
            />
          ) : null}
          {tab === "type" ? (
            <TypeSignaturePanel
              color={color}
              onColorChange={setColor}
              onCanCreateChange={setCanCreate}
              exportRef={exportRef}
            />
          ) : null}
          {tab === "upload" ? (
            <UploadSignaturePanel
              onCanCreateChange={setCanCreate}
              exportRef={exportRef}
            />
          ) : null}
        </div>

        <div className="flex justify-end gap-3 px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canCreate}
            className="min-w-24 bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleCreate}
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}
