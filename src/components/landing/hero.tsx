import Link from "next/link";
import { ArrowDown, Combine, Minimize2, Scissors } from "lucide-react";

import { HeroVisual } from "@/components/landing/hero-visual";
import { PrivacyBadge } from "@/components/tools/privacy-badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const QUICK_LINKS = [
  { href: "/merge", label: "Merge", icon: Combine },
  { href: "/split", label: "Split", icon: Scissors },
  { href: "/compress", label: "Compress", icon: Minimize2 },
] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background decoration */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
      >
        <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-brand-red/10 blur-3xl dark:bg-brand-red/15" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-brand-charcoal/5 blur-3xl dark:bg-brand-charcoal/20" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-12 lg:py-20">
        {/* Copy */}
        <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
          <PrivacyBadge />
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-brand-charcoal dark:text-foreground sm:text-5xl lg:text-[3.25rem]">
              Free PDF tools that{" "}
              <span className="bg-gradient-to-r from-brand-red to-brand-red-hover bg-clip-text text-transparent">
                respect your privacy
              </span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              pdfruk is a free, privacy-first PDF toolkit. Merge, split, convert,
              and edit PDFs entirely in your browser — no uploads, no accounts.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Link
              href="#tools"
              className={cn(
                buttonVariants({ size: "lg" }),
                "inline-flex h-11 items-center justify-center bg-brand-red px-6 hover:bg-brand-red-hover",
              )}
            >
              Explore all tools
              <ArrowDown className="ml-2 h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/merge"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "inline-flex h-11 items-center justify-center px-6",
              )}
            >
              Merge PDF now
            </Link>
          </div>

          {/* Quick tool pills — horizontal scroll on small screens */}
          <div className="w-full space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Quick access
            </p>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
              {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-brand-charcoal shadow-sm transition-colors hover:border-brand-red/30 hover:bg-brand-red/5 hover:text-brand-red dark:text-foreground"
                >
                  <Icon className="h-4 w-4 text-brand-red" aria-hidden />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Visual */}
        <div className="order-first lg:order-last">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
