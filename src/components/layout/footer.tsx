import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { getVisibleTools } from "@/config/tools";
import {
  SITE_FACEBOOK_URL,
  SITE_PHONE,
} from "@/lib/seo/site";

const FOOTER_TOOLS = getVisibleTools().slice(0, 8);

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border/60 bg-card/80 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute -left-32 bottom-0 h-48 w-48 rounded-full bg-brand-red/8 blur-3xl dark:bg-brand-red/12" />
        <div className="absolute -right-24 top-0 h-40 w-40 rounded-full bg-brand-charcoal/5 blur-3xl dark:bg-brand-charcoal/15" />
      </div>
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
            <Logo size="sm" />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Free, privacy-first PDF tools. Your files never leave your device.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-2 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              100% browser-based · No uploads
            </div>
          </div>

          <nav
            aria-label="PDF tools"
            className="text-center sm:text-left"
          >
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-charcoal dark:text-foreground">
              Popular tools
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {FOOTER_TOOLS.map((tool) => (
                <li key={tool.id}>
                  <Link
                    href={tool.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-brand-red"
                  >
                    {tool.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav
            aria-label="Site links"
            className="text-center sm:text-left"
          >
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-charcoal dark:text-foreground">
              Site
            </h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/#tools"
                  className="text-sm text-muted-foreground transition-colors hover:text-brand-red"
                >
                  All tools
                </Link>
              </li>
              <li>
                <Link
                  href="/#faq"
                  className="text-sm text-muted-foreground transition-colors hover:text-brand-red"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/merge"
                  className="text-sm text-muted-foreground transition-colors hover:text-brand-red"
                >
                  Merge PDF
                </Link>
              </li>
            </ul>
          </nav>

          <nav
            aria-label="Contact"
            className="text-center sm:text-left"
          >
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-charcoal dark:text-foreground">
              Contact
            </h2>
            <ul className="space-y-2">
              <li>
                <a
                  href={SITE_FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-brand-red"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href={`tel:${SITE_PHONE}`}
                  className="text-sm text-muted-foreground transition-colors hover:text-brand-red"
                >
                  {SITE_PHONE}
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <p className="mt-12 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} pdfruk. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
