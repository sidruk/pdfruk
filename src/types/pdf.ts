export type PdfFile = {
  id: string;
  file: File;
  name: string;
  pageCount: number;
};

export type ImageFile = {
  id: string;
  file: File;
  name: string;
  width: number;
  height: number;
  previewUrl: string;
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

export type ImagesToPdfWorkerRequest = {
  type: "images-to-pdf";
  images: Array<{
    buffer: ArrayBuffer;
    mimeType: string;
    name: string;
  }>;
};

export type SplitWorkerRequest = {
  type: "split";
  buffer: ArrayBuffer;
  options: SplitOptions;
};

export type CompressPreset = "low" | "medium" | "high";

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

export type EditTool = "select" | "text" | "draw" | "shape";

export type EditFontFamily = "helvetica" | "times" | "courier";

export type ImageSourceKind = "image" | "signature" | "pdf";

export type ShapeKind = "rectangle" | "ellipse" | "line" | "triangle";

export type EditAnnotationBase = {
  id: string;
  pageIndex: number;
  color: string;
  strokeWidth: number;
};

export type TextAnnotation = EditAnnotationBase & {
  type: "text";
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  fontFamily: EditFontFamily;
  bold: boolean;
  italic: boolean;
  rotation: number;
};

export type ImageAnnotation = EditAnnotationBase & {
  type: "image";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  imageData: string;
  sourceKind: ImageSourceKind;
};

export type DrawAnnotation = EditAnnotationBase & {
  type: "draw";
  points: Array<{ x: number; y: number }>;
};

export type ShapeAnnotation = EditAnnotationBase & {
  type: "shape";
  shape: ShapeKind;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type EditAnnotation =
  | TextAnnotation
  | ImageAnnotation
  | DrawAnnotation
  | ShapeAnnotation;

export type EditPdfWorkerRequest = {
  type: "edit-pdf";
  buffer: ArrayBuffer;
  annotations: EditAnnotation[];
};

export type RotationAngle = 0 | 90 | 180 | 270;

export type RotateOptions = {
  rotations: Record<number, RotationAngle>;
};

export type PageNumberPosition =
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  | "top-left"
  | "top-center"
  | "top-right";

export type PageNumberOptions = {
  position: PageNumberPosition;
  format: string;
  fontSize: number;
  color: string;
  startNumber: number;
  margin: number;
};

export type WatermarkPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "center"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type WatermarkType = "text" | "image";

export type WatermarkOptions = {
  type: WatermarkType;
  text: string;
  opacity: number;
  fontSize: number;
  color: string;
  rotation: number;
  position: WatermarkPosition;
  mosaic: boolean;
  imageData?: string;
  imageScale: number;
};

export type CropMargins = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CropPageScope = "all" | "current";

export type CropOptions = {
  scope: CropPageScope;
  margins: CropMargins;
  pageMargins?: Record<number, CropMargins>;
};

export type PdfFormFieldType = "text" | "checkbox" | "dropdown" | "radio" | "unknown";

export type PdfFormField = {
  name: string;
  type: PdfFormFieldType;
  value: string;
  options?: string[];
};

export type FillFormOptions = {
  fields: Array<{ name: string; value: string | boolean }>;
};

export type RotateWorkerRequest = {
  type: "rotate";
  buffer: ArrayBuffer;
  options: RotateOptions;
};

export type PageNumbersWorkerRequest = {
  type: "page-numbers";
  buffer: ArrayBuffer;
  options: PageNumberOptions;
};

export type WatermarkWorkerRequest = {
  type: "watermark";
  buffer: ArrayBuffer;
  options: WatermarkOptions;
};

export type CropWorkerRequest = {
  type: "crop";
  buffer: ArrayBuffer;
  options: CropOptions;
};

export type FillFormWorkerRequest = {
  type: "fill-form";
  buffer: ArrayBuffer;
  options: FillFormOptions;
};
