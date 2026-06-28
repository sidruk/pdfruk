import {
  PDFDocument,
  degrees,
  type PDFPage,
} from "pdf-lib";

import { resolveStandardFont } from "@/lib/pdf/edit-fonts";
import { dataUrlToBytes, parseHexColor, toPdfY } from "@/lib/pdf/pdf-utils";
import type {
  DrawAnnotation,
  EditAnnotation,
  EditFontFamily,
  ImageAnnotation,
  ShapeAnnotation,
  TextAnnotation,
} from "@/types/pdf";

type EmbeddedFont = Awaited<ReturnType<PDFDocument["embedFont"]>>;

function normalizeTextAnnotation(annotation: TextAnnotation): TextAnnotation {
  return {
    ...annotation,
    fontFamily: annotation.fontFamily ?? "helvetica",
    bold: annotation.bold ?? false,
    italic: annotation.italic ?? false,
  };
}

async function getTextFont(
  doc: PDFDocument,
  cache: Map<string, EmbeddedFont>,
  annotation: TextAnnotation,
): Promise<EmbeddedFont> {
  const normalized = normalizeTextAnnotation(annotation);
  const key = `${normalized.fontFamily}-${normalized.bold}-${normalized.italic}`;

  const cached = cache.get(key);
  if (cached) return cached;

  const font = await doc.embedFont(
    resolveStandardFont(
      normalized.fontFamily,
      normalized.bold,
      normalized.italic,
    ),
  );
  cache.set(key, font);
  return font;
}

function applyTextAnnotation(
  page: PDFPage,
  annotation: TextAnnotation,
  font: EmbeddedFont,
): void {
  const normalized = normalizeTextAnnotation(annotation);
  const { width: pageWidth, height: pageHeight } = page.getSize();
  const color = parseHexColor(normalized.color);
  const x = normalized.x * pageWidth;
  const y = toPdfY(pageHeight, normalized.y + normalized.height);
  const size = normalized.fontSize;

  page.drawText(normalized.text, {
    x,
    y,
    size,
    font,
    color,
    rotate: degrees(normalized.rotation),
  });
}

async function applyImageAnnotation(
  doc: PDFDocument,
  page: PDFPage,
  annotation: ImageAnnotation,
): Promise<void> {
  const bytes = dataUrlToBytes(annotation.imageData);
  const image = annotation.imageData.includes("image/png")
    ? await doc.embedPng(bytes)
    : await doc.embedJpg(bytes);

  const { width: pageWidth, height: pageHeight } = page.getSize();
  const width = annotation.width * pageWidth;
  const height = annotation.height * pageHeight;
  const x = annotation.x * pageWidth;
  const y = toPdfY(pageHeight, annotation.y + annotation.height);

  page.drawImage(image, {
    x,
    y,
    width,
    height,
    rotate: degrees(annotation.rotation),
  });
}

function applyDrawAnnotation(page: PDFPage, annotation: DrawAnnotation): void {
  if (annotation.points.length < 2) return;

  const { width: pageWidth, height: pageHeight } = page.getSize();
  const color = parseHexColor(annotation.color);
  const thickness = annotation.strokeWidth;

  for (let index = 1; index < annotation.points.length; index += 1) {
    const start = annotation.points[index - 1];
    const end = annotation.points[index];
    page.drawLine({
      start: {
        x: start.x * pageWidth,
        y: toPdfY(pageHeight, start.y),
      },
      end: {
        x: end.x * pageWidth,
        y: toPdfY(pageHeight, end.y),
      },
      thickness,
      color,
    });
  }
}

function applyShapeAnnotation(page: PDFPage, annotation: ShapeAnnotation): void {
  const { width: pageWidth, height: pageHeight } = page.getSize();
  const color = parseHexColor(annotation.color);
  const thickness = annotation.strokeWidth;

  const x1 = annotation.x1 * pageWidth;
  const y1 = toPdfY(pageHeight, annotation.y1);
  const x2 = annotation.x2 * pageWidth;
  const y2 = toPdfY(pageHeight, annotation.y2);

  const left = Math.min(x1, x2);
  const bottom = Math.min(y1, y2);
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);

  switch (annotation.shape) {
    case "rectangle":
      page.drawRectangle({
        x: left,
        y: bottom,
        width: Math.max(width, 1),
        height: Math.max(height, 1),
        borderColor: color,
        borderWidth: thickness,
      });
      break;
    case "ellipse":
      page.drawEllipse({
        x: left + width / 2,
        y: bottom + height / 2,
        xScale: Math.max(width / 2, 1),
        yScale: Math.max(height / 2, 1),
        borderColor: color,
        borderWidth: thickness,
      });
      break;
    case "line":
      page.drawLine({
        start: { x: x1, y: y1 },
        end: { x: x2, y: y2 },
        thickness,
        color,
      });
      break;
    case "triangle": {
      const topX = (x1 + x2) / 2;
      const topY = Math.max(y1, y2);
      const baseLeft = { x: Math.min(x1, x2), y: Math.min(y1, y2) };
      const baseRight = { x: Math.max(x1, x2), y: Math.min(y1, y2) };
      page.drawLine({
        start: { x: topX, y: topY },
        end: baseLeft,
        thickness,
        color,
      });
      page.drawLine({
        start: baseLeft,
        end: baseRight,
        thickness,
        color,
      });
      page.drawLine({
        start: baseRight,
        end: { x: topX, y: topY },
        thickness,
        color,
      });
      break;
    }
  }
}

export async function applyEditAnnotations(
  buffer: ArrayBuffer,
  annotations: EditAnnotation[],
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer);
  const fontCache = new Map<string, EmbeddedFont>();
  const pages = doc.getPages();

  const byPage = new Map<number, EditAnnotation[]>();
  for (const annotation of annotations) {
    const list = byPage.get(annotation.pageIndex) ?? [];
    list.push(annotation);
    byPage.set(annotation.pageIndex, list);
  }

  for (const [pageIndex, pageAnnotations] of Array.from(byPage.entries())) {
    const page = pages[pageIndex];
    if (!page) continue;

    for (const annotation of pageAnnotations) {
      if (annotation.type === "text") {
        const font = await getTextFont(doc, fontCache, annotation);
        applyTextAnnotation(page, annotation, font);
      } else if (annotation.type === "image") {
        await applyImageAnnotation(doc, page, annotation);
      } else if (annotation.type === "draw") {
        applyDrawAnnotation(page, annotation);
      } else if (annotation.type === "shape") {
        applyShapeAnnotation(page, annotation);
      }
    }
  }

  return doc.save();
}

export type { EditFontFamily };
