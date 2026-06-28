"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PdfToImagesFormat, PdfToImagesScale } from "@/lib/pdf/pdf-to-images";
import { scaleToApproxDpi } from "@/lib/pdf/pdf-to-images";

const SCALE_OPTIONS: PdfToImagesScale[] = [2, 3, 4];

const FORMAT_OPTIONS: Array<{ value: PdfToImagesFormat; label: string }> = [
  { value: "png", label: "PNG (lossless)" },
  { value: "jpeg", label: "JPEG (smaller files)" },
];

type PdfToImagesOptionsProps = {
  scale: PdfToImagesScale;
  format: PdfToImagesFormat;
  disabled?: boolean;
  onScaleChange: (scale: PdfToImagesScale) => void;
  onFormatChange: (format: PdfToImagesFormat) => void;
};

export function PdfToImagesOptions({
  scale,
  format,
  disabled = false,
  onScaleChange,
  onFormatChange,
}: PdfToImagesOptionsProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pdf-to-images-scale">Resolution</Label>
          <Select
            value={String(scale)}
            disabled={disabled}
            onValueChange={(value) => onScaleChange(Number(value) as PdfToImagesScale)}
          >
            <SelectTrigger id="pdf-to-images-scale">
              <SelectValue placeholder="Choose resolution" />
            </SelectTrigger>
            <SelectContent>
              {SCALE_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {scaleToApproxDpi(option)} DPI ({option}x)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pdf-to-images-format">Format</Label>
          <Select
            value={format}
            disabled={disabled}
            onValueChange={(value) => onFormatChange(value as PdfToImagesFormat)}
          >
            <SelectTrigger id="pdf-to-images-format">
              <SelectValue placeholder="Choose format" />
            </SelectTrigger>
            <SelectContent>
              {FORMAT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        Rendered with PDF.js in your browser. Higher DPI gives sharper text and
        images. Multi-page PDFs download as a ZIP file.
      </p>
    </div>
  );
}
