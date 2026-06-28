import type { CropMargins, CropRect } from "@/types/pdf";

export const FULL_PAGE_CROP: CropRect = {
  x: 0,
  y: 0,
  width: 1,
  height: 1,
};

const MIN_CROP_SIZE = 0.05;

export function clampCropRect(rect: CropRect): CropRect {
  const width = Math.max(MIN_CROP_SIZE, Math.min(rect.width, 1));
  const height = Math.max(MIN_CROP_SIZE, Math.min(rect.height, 1));
  const x = Math.max(0, Math.min(rect.x, 1 - width));
  const y = Math.max(0, Math.min(rect.y, 1 - height));

  return { x, y, width, height };
}

export function cropRectToMargins(rect: CropRect): CropMargins {
  const normalized = clampCropRect(rect);

  return {
    left: normalized.x,
    top: normalized.y,
    right: 1 - normalized.x - normalized.width,
    bottom: 1 - normalized.y - normalized.height,
  };
}

export function marginsToCropRect(margins: CropMargins): CropRect {
  return clampCropRect({
    x: margins.left,
    y: margins.top,
    width: 1 - margins.left - margins.right,
    height: 1 - margins.top - margins.bottom,
  });
}

export function isFullPageCrop(rect: CropRect): boolean {
  const normalized = clampCropRect(rect);
  const epsilon = 0.001;

  return (
    normalized.x <= epsilon &&
    normalized.y <= epsilon &&
    normalized.width >= 1 - epsilon &&
    normalized.height >= 1 - epsilon
  );
}

export function isValidCropRect(rect: CropRect): boolean {
  const normalized = clampCropRect(rect);
  return normalized.width > 0 && normalized.height > 0;
}
