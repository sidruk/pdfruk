export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

export const PDF_ACCEPT = {
  "application/pdf": [".pdf"],
  "application/x-pdf": [".pdf"],
  "application/octet-stream": [".pdf"],
} as const;

/** Native file-picker accept string (Windows often omits PDF MIME types). */
export const PDF_ACCEPT_STRING =
  ".pdf,application/pdf,application/x-pdf,application/octet-stream";

export const IMAGE_ACCEPT = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
} as const;

/** Native file-picker accept string (Windows often omits image MIME types). */
export const IMAGE_ACCEPT_STRING =
  ".jpg,.jpeg,.png,image/jpeg,image/png";

export const THUMBNAIL_SCALE = 0.3;
