export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

export const PDF_ACCEPT = {
  "application/pdf": [".pdf"],
} as const;

export const IMAGE_ACCEPT = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
} as const;

export const THUMBNAIL_SCALE = 0.3;
