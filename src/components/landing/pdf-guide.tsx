import Link from "next/link";

import { LandingBg } from "@/components/landing/landing-bg";
import { SectionHeader } from "@/components/landing/section-header";

const GUIDE_SECTIONS = [
  {
    id: "merge",
    title: "Merge PDF files into one document",
    body: (
      <>
        Combining separate PDFs is one of the most common document tasks — whether
        you are bundling invoices, merging scanned pages, or building a single
        report from multiple chapters. pdfruk&apos;s{" "}
        <Link
          href="/merge"
          className="font-medium text-brand-red underline-offset-4 hover:underline"
        >
          merge PDF tool
        </Link>{" "}
        lets you drag and drop files, reorder them visually, and download a
        single combined PDF in seconds. Because merging runs entirely in your
        browser, there is no upload queue and no risk of your files sitting on a
        remote server.
      </>
    ),
  },
  {
    id: "split",
    title: "Split PDF pages by range or selection",
    body: (
      <>
        Need just a few pages from a large file? The{" "}
        <Link
          href="/split"
          className="font-medium text-brand-red underline-offset-4 hover:underline"
        >
          split PDF tool
        </Link>{" "}
        extracts individual pages or page ranges so you can share only what
        matters. Select pages with a visual picker or enter a range like 1–5,
        then download the result instantly. Splitting is processed locally, which
        makes it a practical choice for contracts, bank statements, and other
        sensitive documents you would rather not upload anywhere.
      </>
    ),
  },
  {
    id: "edit",
    title: "Edit PDFs with text, drawings, and annotations",
    body: (
      <>
        Small changes should not require expensive desktop software. With{" "}
        <Link
          href="/edit-pdf"
          className="font-medium text-brand-red underline-offset-4 hover:underline"
        >
          edit PDF
        </Link>
        , you can add text boxes, highlight passages, draw freehand marks, and
        place shapes directly on your document. The editor loads your file in the
        browser and applies changes on your device, so drafts and internal notes
        stay private. Pair editing with{" "}
        <Link
          href="/sign-pdf"
          className="font-medium text-brand-red underline-offset-4 hover:underline"
        >
          sign PDF
        </Link>{" "}
        or{" "}
        <Link
          href="/watermark"
          className="font-medium text-brand-red underline-offset-4 hover:underline"
        >
          watermark
        </Link>{" "}
        tools when you need to finalise a document before sharing.
      </>
    ),
  },
  {
    id: "convert",
    title: "Convert between PDF and images",
    body: (
      <>
        pdfruk includes conversion tools for everyday format changes. Turn JPG
        or PNG photos into a PDF with{" "}
        <Link
          href="/jpg-to-pdf"
          className="font-medium text-brand-red underline-offset-4 hover:underline"
        >
          images to PDF
        </Link>
        , or export individual pages as high-quality images using{" "}
        <Link
          href="/pdf-to-jpg"
          className="font-medium text-brand-red underline-offset-4 hover:underline"
        >
          PDF to images
        </Link>
        . Conversions run client-side for fast results without creating an
        account. You can also rotate pages, delete and reorder sheets, crop
        margins, and add page numbers — useful when preparing documents for
        print or email.
      </>
    ),
  },
  {
    id: "privacy",
    title: "Privacy-first PDF tools for confidential work",
    body: (
      <>
        Most pdfruk tools process files locally in your browser using modern
        web technology. That means your PDFs are not sent to our servers for
        merge, split, edit, sign, or convert tasks. For teams handling HR
        records, legal paperwork, medical forms, or financial statements, local
        processing removes a major privacy concern found in traditional online
        PDF services. pdfruk is free to use, works on desktop and mobile
        browsers, and does not require registration — open a tool, drop your
        file, and download the result.
      </>
    ),
  },
] as const;

export function PdfGuide() {
  return (
    <LandingBg variant="muted">
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionHeader
          eyebrow="Guide"
          title="Free PDF tools for every document task"
          description="pdfruk brings merge, split, edit, convert, and security tools together in one privacy-first toolkit that runs in your browser."
          className="mb-12"
        />

        <div className="space-y-10">
          {GUIDE_SECTIONS.map((section) => (
            <article key={section.id} className="space-y-3">
              <h3 className="text-xl font-semibold text-brand-charcoal dark:text-foreground">
                {section.title}
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                {section.body}
              </p>
            </article>
          ))}
        </div>
      </section>
    </LandingBg>
  );
}
