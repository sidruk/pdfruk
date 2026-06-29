import Link from "next/link";
import { Download, Mail } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { createStaticPage } from "@/lib/seo/create-static-page";
import { PRESS_PAGE } from "@/lib/seo/static-pages";
import {
  SITE_CONTACT_EMAIL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/seo/site";
import { cn } from "@/lib/utils";

const { metadata, StaticPageShell } = createStaticPage(PRESS_PAGE);

export { metadata };

export default function PressPage() {
  return (
    <StaticPageShell>
      <p>
        Thank you for your interest in {SITE_NAME}. Below you will find
        boilerplate copy, downloadable assets, and how to reach us for press
        enquiries about our free, privacy-first PDF tools.
      </p>

      <h2>Company boilerplate</h2>
      <p>
        <strong>{SITE_NAME}</strong> — {SITE_TAGLINE}. {SITE_DESCRIPTION}
      </p>

      <h2>Key facts</h2>
      <ul>
        <li>Free PDF tools with no sign-up required</li>
        <li>Most processing runs entirely in the user&apos;s browser</li>
        <li>No watermarks on output files</li>
        <li>
          Tools include merge, split, compress, convert, edit, sign, watermark,
          and more
        </li>
        <li>Website: pdfruk.com</li>
      </ul>

      <h2>Brand assets</h2>
      <p>
        Download our logo for editorial use. Please do not alter colours or
        proportions.
      </p>
      <div className="not-prose mt-4 flex flex-wrap gap-3">
        <a
          href="/logo.png"
          download
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "inline-flex items-center gap-2",
          )}
        >
          <Download className="h-4 w-4" aria-hidden />
          Download logo (PNG)
        </a>
        <a
          href="/icon.png"
          download
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "inline-flex items-center gap-2",
          )}
        >
          <Download className="h-4 w-4" aria-hidden />
          Download icon (PNG)
        </a>
      </div>

      <h2>Media contact</h2>
      <p>
        For interview requests, fact-checking, or partnership coverage, email{" "}
        <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a> with
        &quot;Press&quot; in the subject line. You can also use our{" "}
        <Link href="/contact">contact page</Link>.
      </p>

      <div className="not-prose mt-4">
        <a
          href={`mailto:${SITE_CONTACT_EMAIL}?subject=Press%20enquiry`}
          className={cn(
            buttonVariants({ size: "sm" }),
            "inline-flex items-center gap-2 bg-brand-red hover:bg-brand-red-hover",
          )}
        >
          <Mail className="h-4 w-4" aria-hidden />
          Press enquiry
        </a>
      </div>

      <h2>Usage guidelines</h2>
      <ul>
        <li>Please link to pdfruk.com when referencing our tools.</li>
        <li>Do not imply endorsement of third-party products without permission.</li>
        <li>
          Accurately describe our privacy model — most tools are browser-based.
          See our <Link href="/about">about page</Link> and{" "}
          <Link href="/security">security page</Link> for reference.
        </li>
      </ul>
    </StaticPageShell>
  );
}
