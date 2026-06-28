"use client";

import { useEffect, useRef, type CSSProperties } from "react";

import { FileText, ImagePlus, X } from "lucide-react";

import { usePdfThumbnails } from "@/hooks/use-pdf-thumbnails";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type {
  PdfFile,
  WatermarkOptions,
  WatermarkPosition,
  WatermarkType,
} from "@/types/pdf";

const POSITIONS: WatermarkPosition[] = [
  "top-left",
  "top-center",
  "top-right",
  "middle-left",
  "center",
  "middle-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

const POSITION_LABELS: Record<WatermarkPosition, string> = {
  "top-left": "Top left",
  "top-center": "Top center",
  "top-right": "Top right",
  "middle-left": "Middle left",
  center: "Center",
  "middle-right": "Middle right",
  "bottom-left": "Bottom left",
  "bottom-center": "Bottom center",
  "bottom-right": "Bottom right",
};

const IMAGE_ACCEPT = "image/png,image/jpeg,image/jpg,image/webp";

function getPreviewPositionStyle(
  position: WatermarkPosition,
  mosaic: boolean,
): CSSProperties {
  if (mosaic) {
    return {
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    };
  }

  const margin = "8%";

  switch (position) {
    case "top-left":
      return { top: margin, left: margin };
    case "top-center":
      return { top: margin, left: "50%", transform: "translateX(-50%)" };
    case "top-right":
      return { top: margin, right: margin };
    case "middle-left":
      return { top: "50%", left: margin, transform: "translateY(-50%)" };
    case "center":
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    case "middle-right":
      return { top: "50%", right: margin, transform: "translateY(-50%)" };
    case "bottom-left":
      return { bottom: margin, left: margin };
    case "bottom-center":
      return { bottom: margin, left: "50%", transform: "translateX(-50%)" };
    case "bottom-right":
      return { bottom: margin, right: margin };
  }
}

function MosaicTextPreview({
  text,
  color,
  opacity,
  fontSize,
  rotation,
}: {
  text: string;
  color: string;
  opacity: number;
  fontSize: number;
  rotation: number;
}) {
  const label = text.trim() || "Preview";
  const items = Array.from({ length: 12 }, (_, index) => index);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {items.map((item) => (
        <span
          key={item}
          className="absolute select-none whitespace-nowrap font-bold"
          style={{
            color,
            opacity,
            fontSize: Math.max(8, fontSize * 0.22),
            transform: `rotate(${rotation}deg)`,
            left: `${(item % 4) * 28 - 8}%`,
            top: `${Math.floor(item / 4) * 30 + 5}%`,
          }}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

function MosaicImagePreview({
  imageData,
  opacity,
  rotation,
  scale,
}: {
  imageData: string;
  opacity: number;
  rotation: number;
  scale: number;
}) {
  const items = Array.from({ length: 9 }, (_, index) => index);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {items.map((item) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={item}
          src={imageData}
          alt=""
          className="absolute object-contain"
          style={{
            opacity,
            transform: `rotate(${rotation}deg)`,
            width: `${scale * 55}%`,
            left: `${(item % 3) * 32 + 2}%`,
            top: `${Math.floor(item / 3) * 32 + 2}%`,
          }}
        />
      ))}
    </div>
  );
}

type WatermarkOptionsPanelProps = {
  file: PdfFile;
  options: WatermarkOptions;
  onOptionChange: <K extends keyof WatermarkOptions>(
    key: K,
    value: WatermarkOptions[K],
  ) => void;
  onRemove: () => void;
  disabled?: boolean;
};

export function WatermarkOptionsPanel({
  file,
  options,
  onOptionChange,
  onRemove,
  disabled = false,
}: WatermarkOptionsPanelProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { pages, isLoading, renderThumbnail } = usePdfThumbnails(file.file, 1);
  const preview = pages[0];

  useEffect(() => {
    if (preview && !preview.thumbnailUrl) {
      void renderThumbnail(0);
    }
  }, [preview, renderThumbnail]);

  const handleTypeChange = (type: WatermarkType) => {
    onOptionChange("type", type);
  };

  const handleImageAttach = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onOptionChange("imageData", reader.result);
        onOptionChange("type", "image");
      }
    };
    reader.readAsDataURL(nextFile);
    event.target.value = "";
  };

  const previewPositionStyle = getPreviewPositionStyle(options.position, options.mosaic);
  const previewFontSize = Math.min(options.fontSize * 0.35, 28);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
        <FileText className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{file.name}</p>
          <p className="text-sm text-muted-foreground">
            {file.pageCount} page{file.pageCount === 1 ? "" : "s"}
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

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border bg-card p-4">
          <div>
            <h2 className="text-sm font-medium">Watermark settings</h2>
            <p className="text-sm text-muted-foreground">
              Add a text stamp or attach an image watermark to every page.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant={options.type === "text" ? "default" : "outline"}
              size="sm"
              disabled={disabled}
              onClick={() => handleTypeChange("text")}
            >
              Text
            </Button>
            <Button
              type="button"
              variant={options.type === "image" ? "default" : "outline"}
              size="sm"
              disabled={disabled}
              onClick={() => handleTypeChange("image")}
            >
              Attached image
            </Button>
          </div>

          {options.type === "text" ? (
            <div className="space-y-2">
              <Label htmlFor="watermark-text">Text</Label>
              <Input
                id="watermark-text"
                value={options.text}
                disabled={disabled}
                onChange={(event) => onOptionChange("text", event.target.value)}
                placeholder="CONFIDENTIAL"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <Label>Attached image</Label>
              <input
                ref={imageInputRef}
                type="file"
                accept={IMAGE_ACCEPT}
                className="hidden"
                disabled={disabled}
                onChange={handleImageAttach}
              />
              {options.imageData ? (
                <div className="flex items-center gap-3 rounded-md border bg-muted/30 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={options.imageData}
                    alt="Attached watermark"
                    className="h-14 w-14 rounded object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Image attached</p>
                    <p className="text-xs text-muted-foreground">
                      PNG or JPG recommended
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    onClick={() => onOptionChange("imageData", undefined)}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={disabled}
                  onClick={() => imageInputRef.current?.click()}
                >
                  <ImagePlus className="h-4 w-4" aria-hidden />
                  Attach image
                </Button>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="watermark-image-scale">Image size</Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(options.imageScale * 100)}%
                  </span>
                </div>
                <Slider
                  id="watermark-image-scale"
                  min={0.1}
                  max={0.6}
                  step={0.05}
                  value={[options.imageScale]}
                  disabled={disabled}
                  onValueChange={(next) => {
                    const nextValue = Array.isArray(next) ? next[0] : next;
                    onOptionChange("imageScale", nextValue ?? 0.25);
                  }}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="watermark-opacity">Opacity</Label>
              <span className="text-sm text-muted-foreground">
                {Math.round(options.opacity * 100)}%
              </span>
            </div>
            <Slider
              id="watermark-opacity"
              min={0.05}
              max={1}
              step={0.05}
              value={[options.opacity]}
              disabled={disabled}
              onValueChange={(next) => {
                const nextValue = Array.isArray(next) ? next[0] : next;
                onOptionChange("opacity", nextValue ?? 0.25);
              }}
            />
          </div>

          <div className="flex flex-wrap items-start gap-4">
            <div className="space-y-2">
              <Label>Position</Label>
              <div
                className="grid grid-cols-3 gap-0 rounded-md border border-border p-1"
                role="group"
                aria-label="Watermark position"
              >
                {POSITIONS.map((position) => (
                  <button
                    key={position}
                    type="button"
                    disabled={disabled || options.mosaic}
                    aria-label={POSITION_LABELS[position]}
                    aria-pressed={options.position === position}
                    onClick={() => onOptionChange("position", position)}
                    className={cn(
                      "h-7 w-7 border border-dashed border-border/70 transition-colors",
                      options.position === position && !options.mosaic
                        ? "bg-primary/15 ring-1 ring-primary"
                        : "bg-background hover:bg-muted/60",
                      options.mosaic && "cursor-not-allowed opacity-50",
                    )}
                  />
                ))}
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 pt-6">
              <input
                type="checkbox"
                checked={options.mosaic}
                disabled={disabled}
                onChange={(event) => onOptionChange("mosaic", event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium">Mosaic</span>
            </label>
          </div>

          {options.type === "text" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="watermark-size">Font size</Label>
                <Input
                  id="watermark-size"
                  type="number"
                  min={12}
                  max={120}
                  value={options.fontSize}
                  disabled={disabled}
                  onChange={(event) =>
                    onOptionChange("fontSize", Number(event.target.value) || 48)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="watermark-color">Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="watermark-color"
                    type="color"
                    value={options.color}
                    disabled={disabled}
                    className="h-8 w-14 p-1"
                    onChange={(event) => onOptionChange("color", event.target.value)}
                  />
                  <span className="text-sm text-muted-foreground">{options.color}</span>
                </div>
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="watermark-rotation">Rotation (°)</Label>
            <Input
              id="watermark-rotation"
              type="number"
              min={-180}
              max={180}
              value={options.rotation}
              disabled={disabled}
              onChange={(event) =>
                onOptionChange("rotation", Number(event.target.value) || -45)
              }
            />
          </div>
        </div>

        <div className="space-y-2 rounded-lg border bg-card p-4">
          <h2 className="text-sm font-medium">Preview (page 1)</h2>
          <div className="relative mx-auto aspect-[3/4] max-w-xs overflow-hidden rounded-md bg-muted">
            {isLoading || !preview?.thumbnailUrl ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Loading preview...
              </div>
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview.thumbnailUrl}
                  alt="Watermark preview"
                  className="h-full w-full object-contain"
                />
                {options.mosaic ? (
                  options.type === "text" ? (
                    <MosaicTextPreview
                      text={options.text}
                      color={options.color}
                      opacity={options.opacity}
                      fontSize={options.fontSize}
                      rotation={options.rotation}
                    />
                  ) : options.imageData ? (
                    <MosaicImagePreview
                      imageData={options.imageData}
                      opacity={options.opacity}
                      rotation={options.rotation}
                      scale={options.imageScale}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 text-xs text-muted-foreground">
                      Attach an image to preview
                    </div>
                  )
                ) : options.type === "text" ? (
                  <span
                    className="pointer-events-none absolute select-none font-bold whitespace-nowrap"
                    style={{
                      color: options.color,
                      opacity: options.opacity,
                      fontSize: previewFontSize,
                      transform: `rotate(${options.rotation}deg)`,
                      ...previewPositionStyle,
                    }}
                  >
                    {options.text.trim() || "Preview"}
                  </span>
                ) : options.imageData ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={options.imageData}
                    alt=""
                    className="pointer-events-none absolute object-contain"
                    style={{
                      opacity: options.opacity,
                      width: `${options.imageScale * 100}%`,
                      transform: `rotate(${options.rotation}deg)`,
                      ...previewPositionStyle,
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5 text-xs text-muted-foreground">
                    Attach an image to preview
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
