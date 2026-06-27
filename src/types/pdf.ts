export type PdfFile = {
  id: string;
  file: File;
  name: string;
  pageCount: number;
};

export type PdfPage = {
  pageIndex: number;
  thumbnailUrl?: string;
};

export type SplitMode = "range" | "extract";

export type SplitTab = "range" | "pages" | "size";

export type RangeMode = "custom" | "fixed" | "smart";

export type SplitOptions = {
  mode: SplitMode;
  ranges?: string;
  rangeSegments?: string[];
  mergeRanges?: boolean;
  selectedPages?: number[];
};

export type ProcessResultMetadata = {
  originalSize: number;
  compressedSize: number;
};

export type ProcessResult = {
  blob: Blob;
  filename: string;
  metadata?: ProcessResultMetadata;
};

export type ProcessProgress = {
  current: number;
  total: number;
  message: string;
};

export type PdfValidationErrorCode =
  | "too_large"
  | "corrupt"
  | "encrypted"
  | "invalid_type";

export type PdfValidationError = {
  code: PdfValidationErrorCode;
  message: string;
  fileName: string;
};

export type MergeWorkerRequest = {
  type: "merge";
  buffers: ArrayBuffer[];
};

export type SplitWorkerRequest = {
  type: "split";
  buffer: ArrayBuffer;
  options: SplitOptions;
};

export type CompressPreset = "low" | "medium" | "high";

export type CompressWorkerRequest = {
  type: "compress";
  buffer: ArrayBuffer;
  preset: CompressPreset;
  originalName: string;
  originalSize: number;
};

export type WorkerProgressMessage = {
  type: "progress";
  current: number;
  total: number;
  message: string;
};

export type WorkerSuccessMessage = {
  type: "success";
  data: ArrayBuffer;
  filename: string;
  contentType?: string;
  metadata?: ProcessResultMetadata;
};

export type WorkerErrorMessage = {
  type: "error";
  message: string;
};

export type WorkerMessage =
  | WorkerProgressMessage
  | WorkerSuccessMessage
  | WorkerErrorMessage;
