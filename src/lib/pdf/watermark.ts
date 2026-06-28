import {
  PDFDocument,
  StandardFonts,
  degrees,
  type PDFImage,
  type PDFPage,
} from "pdf-lib";

import { dataUrlToBytes, parseHexColor } from "@/lib/pdf/pdf-utils";
import type { WatermarkOptions, WatermarkPosition } from "@/types/pdf";

export type WatermarkProgressCallback = (
  current: number,
  total: number,
) => void;

const DEFAULT_MARGIN = 36;

function getPositionCoords(
  position: WatermarkPosition,
  pageWidth: number,
  pageHeight: number,
  contentWidth: number,
  contentHeight: number,
  margin: number = DEFAULT_MARGIN,
): { x: number; y: number } {
  switch (position) {
    case "top-left":
      return { x: margin, y: pageHeight - contentHeight - margin };
    case "top-center":
      return { x: (pageWidth - contentWidth) / 2, y: pageHeight - contentHeight - margin };
    case "top-right":
      return { x: pageWidth - contentWidth - margin, y: pageHeight - contentHeight - margin };
    case "middle-left":
      return { x: margin, y: (pageHeight - contentHeight) / 2 };
    case "center":
      return { x: (pageWidth - contentWidth) / 2, y: (pageHeight - contentHeight) / 2 };
    case "middle-right":
      return { x: pageWidth - contentWidth - margin, y: (pageHeight - contentHeight) / 2 };
    case "bottom-left":
      return { x: margin, y: margin };
    case "bottom-center":
      return { x: (pageWidth - contentWidth) / 2, y: margin };
    case "bottom-right":
      return { x: pageWidth - contentWidth - margin, y: margin };
  }
}

function drawMosaicText(
  page: PDFPage,
  text: string,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  options: Pick<WatermarkOptions, "fontSize" | "color" | "opacity" | "rotation">,
): void {
  const { width, height } = page.getSize();
  const textWidth = font.widthOfTextAtSize(text, options.fontSize);
  const color = parseHexColor(options.color);
  const spacingX = textWidth * 1.8;
  const spacingY = options.fontSize * 2.5;
  const angleRad = (options.rotation * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);

  for (let row = -2; row < Math.ceil(height / spacingY) + 2; row += 1) {
    for (let col = -2; col < Math.ceil(width / spacingX) + 2; col += 1) {
      const offsetX = row % 2 === 0 ? 0 : spacingX / 2;
      const baseX = col * spacingX + offsetX;
      const baseY = row * spacingY;
      const x = baseX * cos - baseY * sin;
      const y = baseX * sin + baseY * cos;

      page.drawText(text, {
        x,
        y,
        size: options.fontSize,
        font,
        color,
        opacity: options.opacity,
        rotate: degrees(options.rotation),
      });
    }
  }
}

function drawMosaicImage(
  page: PDFPage,
  image: PDFImage,
  width: number,
  height: number,
  options: Pick<WatermarkOptions, "opacity" | "rotation">,
): void {
  const { width: pageWidth, height: pageHeight } = page.getSize();
  const spacingX = width * 1.5;
  const spacingY = height * 1.5;

  for (let y = -height; y < pageHeight + height; y += spacingY) {
    for (let x = -width; x < pageWidth + width; x += spacingX) {
      page.drawImage(image, {
        x,
        y,
        width,
        height,
        opacity: options.opacity,
        rotate: degrees(options.rotation),
      });
    }
  }
}

async function embedWatermarkImage(
  doc: PDFDocument,
  imageData: string,
): Promise<PDFImage> {
  const bytes = dataUrlToBytes(imageData);
  return imageData.includes("image/png")
    ? doc.embedPng(bytes)
    : doc.embedJpg(bytes);
}

function getImageDimensions(
  image: PDFImage,
  pageWidth: number,
  pageHeight: number,
  scale: number,
): { width: number; height: number } {
  const maxWidth = pageWidth * scale;
  const maxHeight = pageHeight * scale;
  const aspect = image.width / image.height;

  let width = maxWidth;
  let height = width / aspect;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspect;
  }

  return { width, height };
}

export async function addWatermark(
  buffer: ArrayBuffer,
  options: WatermarkOptions,
  onProgress?: WatermarkProgressCallback,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer);
  const pages = doc.getPages();
  const total = pages.length;

  if (options.type === "text") {
    const text = options.text.trim();
    if (!text) {
      throw new Error("Watermark text is required.");
    }

    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    const color = parseHexColor(options.color);
    const textWidth = font.widthOfTextAtSize(text, options.fontSize);
    const textHeight = options.fontSize;

    for (let index = 0; index < pages.length; index += 1) {
      const page = pages[index];
      const { width, height } = page.getSize();

      if (options.mosaic) {
        drawMosaicText(page, text, font, options);
      } else {
        const { x, y } = getPositionCoords(
          options.position,
          width,
          height,
          textWidth,
          textHeight,
        );

        page.drawText(text, {
          x,
          y,
          size: options.fontSize,
          font,
          color,
          opacity: options.opacity,
          rotate: degrees(options.rotation),
        });
      }

      onProgress?.(index + 1, total);
    }
  } else {
    if (!options.imageData) {
      throw new Error("Attach an image to use as the watermark.");
    }

    const image = await embedWatermarkImage(doc, options.imageData);

    for (let index = 0; index < pages.length; index += 1) {
      const page = pages[index];
      const { width, height } = page.getSize();
      const { width: imageWidth, height: imageHeight } = getImageDimensions(
        image,
        width,
        height,
        options.imageScale,
      );

      if (options.mosaic) {
        drawMosaicImage(page, image, imageWidth, imageHeight, options);
      } else {
        const { x, y } = getPositionCoords(
          options.position,
          width,
          height,
          imageWidth,
          imageHeight,
        );

        page.drawImage(image, {
          x,
          y,
          width: imageWidth,
          height: imageHeight,
          opacity: options.opacity,
          rotate: degrees(options.rotation),
        });
      }

      onProgress?.(index + 1, total);
    }
  }

  return doc.save();
}
