import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const blogDir = path.join(root, "public", "blog");
const logoPath = path.join(root, "public", "logo.png");

const slugs = [
  "password-protect-pdf-job-applications",
  "pdf-tools-for-hr-gdpr",
  "best-free-pdf-editor-freelancers",
  "is-it-safe-to-merge-pdf-online",
  "why-browser-pdf-tools-are-safer",
  "merge-pdf-without-uploading",
  "free-pdf-tools-no-watermarks",
];

async function buildLogoBadge(logoWidth) {
  const logo = await sharp(logoPath)
    .resize({ width: logoWidth, withoutEnlargement: true })
    .png()
    .toBuffer();

  const logoMeta = await sharp(logo).metadata();
  const padX = Math.round(logoWidth * 0.22);
  const padY = Math.round(logoWidth * 0.14);
  const radius = Math.round(logoWidth * 0.12);

  const badgeWidth = logoMeta.width + padX * 2;
  const badgeHeight = logoMeta.height + padY * 2;

  const roundedRect = Buffer.from(
    `<svg width="${badgeWidth}" height="${badgeHeight}">
      <rect x="0" y="0" width="${badgeWidth}" height="${badgeHeight}" rx="${radius}" ry="${radius}" fill="rgba(255,255,255,0.92)" />
    </svg>`,
  );

  return sharp(roundedRect)
    .composite([{ input: logo, left: padX, top: padY }])
    .png()
    .toBuffer();
}

async function brandCover(slug) {
  const coverPath = path.join(blogDir, `${slug}.png`);
  if (!fs.existsSync(coverPath)) {
    console.warn(`Skipping missing cover: ${coverPath}`);
    return;
  }

  const cover = sharp(coverPath);
  const meta = await cover.metadata();
  const width = meta.width ?? 1200;
  const height = meta.height ?? 675;

  const logoWidth = Math.max(120, Math.round(width * 0.16));
  const badge = await buildLogoBadge(logoWidth);
  const badgeMeta = await sharp(badge).metadata();

  const margin = Math.round(width * 0.04);
  const left = margin;
  const top = height - (badgeMeta.height ?? 0) - margin;

  const output = await cover
    .composite([{ input: badge, left, top }])
    .png({ compressionLevel: 9 })
    .toBuffer();

  await sharp(output).toFile(coverPath);
  console.log(`Branded ${slug}.png`);
}

async function main() {
  if (!fs.existsSync(logoPath)) {
    throw new Error(`Logo not found at ${logoPath}`);
  }

  for (const slug of slugs) {
    await brandCover(slug);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
