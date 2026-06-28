"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PdfToImagesScale } from "@/lib/pdf/pdf-to-images";

const SCALE_OPTIONS: Array<{ value: PdfToImagesScale; label: string }> = [
  { value: 1, label: "Standard (1x)" },
  { value: 1.5, label: "High (1.5x)" },
  { value: 2, label: "Maximum (2x)" },
];

type PdfToImagesOptionsProps = {
  scale: PdfToImagesScale;
  disabled?: boolean;
  onScaleChange: (scale: PdfToImagesScale) => void;
};

export function PdfToImagesOptions({
  scale,
  disabled = false,
  onScaleChange,
}: PdfToImagesOptionsProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="space-y-2">
        <Label htmlFor="pdf-to-images-scale">Image quality</Label>
        <Select
          value={String(scale)}
          disabled={disabled}
          onValueChange={(value) => onScaleChange(Number(value) as PdfToImagesScale)}
        >
          <SelectTrigger id="pdf-to-images-scale">
            <SelectValue placeholder="Choose quality" />
          </SelectTrigger>
          <SelectContent>
            {SCALE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Each page is exported as PNG. Multi-page PDFs download as a ZIP file.
        </p>
      </div>
    </div>
  );
}
