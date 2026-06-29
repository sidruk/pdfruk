import Link from "next/link";
import { Phone } from "lucide-react";

import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { Logo } from "@/components/layout/logo";
import { COMPANY_LINKS, LEGAL_LINKS } from "@/config/footer-links";
import { getVisibleTools } from "@/config/tools";
import {
  SITE_FACEBOOK_URL,
  SITE_PHONE,
  SITE_WHATSAPP_URL,
} from "@/lib/seo/site";
import { cn } from "@/lib/utils";

const FOOTER_TOOLS = getVisibleTools().slice(0, 6);

const footerLinkClass =
  "text-sm text-muted-foreground transition-colors hover:text-brand-red";

function FooterNav({
  title,
  label,
  children,
  className,
}: {
  title: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <nav
      aria-label={label}
      className={cn("text-center sm:text-left", className)}
    >
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand-charcoal dark:text-foreground">
        {title}
      </h2>
      {children}
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border/60 bg-card/90 backdrop-blur-md">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-red/30 to-transparent" />
        <div className="absolute -left-32 bottom-0 h-48 w-48 rounded-full bg-brand-red/8 blur-3xl dark:bg-brand-red/12" />
        <div className="absolute -right-24 top-0 h-40 w-40 rounded-full bg-brand-charcoal/5 blur-3xl dark:bg-brand-charcoal/15" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col items-center gap-4 text-center sm:col-span-2 sm:items-start sm:text-left lg:col-span-4">
            <Logo size="sm" />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Free, privacy-first PDF tools. Your files never leave your device.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-2 text-xs font-medium text-muted-foreground shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              100% browser-based · No uploads
            </div>
          </div>

          <FooterNav
            title="Popular tools"
            label="PDF tools"
            className="lg:col-span-2"
          >
            <ul className="space-y-2.5">
              {FOOTER_TOOLS.map((tool) => (
                <li key={tool.id}>
                  <Link href={tool.href} className={footerLinkClass}>
                    {tool.title}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterNav>

          <FooterNav title="Legal" label="Legal" className="lg:col-span-2">
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterNav>

          <FooterNav title="Company" label="Company" className="lg:col-span-2">
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterNav>

          <FooterNav title="Contact" label="Contact" className="lg:col-span-2">
            <ul className="space-y-2.5">
              <li>
                <a
                  href={SITE_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    footerLinkClass,
                    "inline-flex items-center gap-2",
                  )}
                >
                  <WhatsAppIcon />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={`tel:${SITE_PHONE}`}
                  className={cn(
                    footerLinkClass,
                    "inline-flex items-center gap-2",
                  )}
                >
                  <Phone className="h-4 w-4 shrink-0" aria-hidden />
                  {SITE_PHONE}
                </a>
              </li>
              <li>
                <a
                  href={SITE_FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerLinkClass}
                >
                  Facebook
                </a>
              </li>
            </ul>
          </FooterNav>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row">
          <p className="text-center text-xs text-muted-foreground sm:text-left">
            &copy; {new Date().getFullYear()} pdfruk. All rights reserved.
          </p>
          <nav aria-label="Legal quick links" className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-muted-foreground transition-colors hover:text-brand-red"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
