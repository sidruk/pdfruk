import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { LandingBg } from "@/components/landing/landing-bg";
import { SectionHeader } from "@/components/landing/section-header";
import { buttonVariants } from "@/components/ui/button";
import { TOOLS } from "@/config/tools";
import { cn } from "@/lib/utils";

const POPULAR_TOOL_IDS = ["merge", "split", "pdf-to-jpg"] as const;

const CARD_DECOR = [
  "from-brand-red/10 via-transparent to-transparent",
  "from-violet-500/10 via-transparent to-transparent",
  "from-sky-500/10 via-transparent to-transparent",
] as const;

export function PopularTools() {
  const popularTools = POPULAR_TOOL_IDS.map((id) =>
    TOOLS.find((tool) => tool.id === id),
  ).filter(Boolean);

  return (
    <LandingBg className="py-16 sm:py-20">
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 flex items-end justify-between gap-4">
          <SectionHeader
            eyebrow="Popular"
            title="Popular merge, split & edit tools"
            align="left"
            className="mb-0"
          />
          <Link
            href="#tools"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hidden shrink-0 text-brand-red hover:bg-brand-red/5 hover:text-brand-red sm:inline-flex",
            )}
          >
            View all
            <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0">
          {popularTools.map((tool, index) => {
            if (!tool) return null;
            const Icon = tool.icon;
            const isLive = tool.status === "live";

            return (
              <Link
                key={tool.id}
                href={tool.href}
                className={cn(
                  "group relative flex min-w-[260px] flex-1 flex-col gap-5 overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 sm:min-w-0",
                  isLive
                    ? "hover:-translate-y-1 hover:border-brand-red/30 hover:shadow-lg hover:shadow-brand-red/5"
                    : "opacity-80",
                )}
              >
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                    CARD_DECOR[index % CARD_DECOR.length],
                  )}
                  aria-hidden
                />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-red to-brand-red-hover text-white shadow-md shadow-brand-red/25">
                    <Icon className="h-7 w-7" aria-hidden />
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background/80 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <ArrowRight
                      className="h-4 w-4 text-brand-red"
                      aria-hidden
                    />
                  </div>
                </div>
                <div className="relative space-y-2">
                  <h3 className="text-lg font-semibold text-brand-charcoal dark:text-foreground">
                    {tool.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {tool.description}
                  </p>
                </div>
                {isLive ? (
                  <span className="relative inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Live
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link
            href="#tools"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-brand-red hover:text-brand-red",
            )}
          >
            View all tools
            <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>
    </LandingBg>
  );
}
