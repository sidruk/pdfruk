import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { LandingBg } from "@/components/landing/landing-bg";
import { SectionHeader } from "@/components/landing/section-header";
import { Badge } from "@/components/ui/badge";
import {
  TOOL_CATEGORIES,
  getToolsByCategory,
  type ToolCategory,
  type ToolDefinition,
} from "@/config/tools";
import { cn } from "@/lib/utils";

const CATEGORY_STYLES: Record<
  ToolCategory,
  { bar: string; panel: string; icon: string; glow: string }
> = {
  Organize: {
    bar: "bg-violet-500",
    panel: "from-violet-500/8 via-transparent to-transparent",
    icon: "from-violet-500/20 to-violet-500/5 text-violet-600 dark:text-violet-400",
    glow: "bg-violet-500/15",
  },
  Convert: {
    bar: "bg-sky-500",
    panel: "from-sky-500/8 via-transparent to-transparent",
    icon: "from-sky-500/20 to-sky-500/5 text-sky-600 dark:text-sky-400",
    glow: "bg-sky-500/15",
  },
  Edit: {
    bar: "bg-amber-500",
    panel: "from-amber-500/8 via-transparent to-transparent",
    icon: "from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400",
    glow: "bg-amber-500/15",
  },
  Security: {
    bar: "bg-emerald-500",
    panel: "from-emerald-500/8 via-transparent to-transparent",
    icon: "from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    glow: "bg-emerald-500/15",
  },
};

function ToolCard({
  tool,
  categoryStyle,
}: {
  tool: ToolDefinition;
  categoryStyle: (typeof CATEGORY_STYLES)[ToolCategory];
}) {
  const Icon = tool.icon;
  const isLive = tool.status === "live";

  return (
    <Link
      href={tool.href}
      className={cn("group block h-full", !isLive && "opacity-80")}
    >
      <article
        className={cn(
          "relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-border/60 bg-card/90 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 dark:bg-card/70",
          isLive &&
            "hover:-translate-y-0.5 hover:border-brand-red/25 hover:shadow-md hover:shadow-brand-red/5",
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
            categoryStyle.panel,
          )}
          aria-hidden
        />
        <div className="relative flex items-start justify-between gap-3">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-border/40",
              isLive
                ? "from-brand-red/15 to-brand-red/5 text-brand-red"
                : categoryStyle.icon,
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <div className="flex items-center gap-2">
            {!isLive ? <Badge variant="secondary">Coming soon</Badge> : null}
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-background/80 transition-all duration-300",
                isLive
                  ? "opacity-0 group-hover:opacity-100"
                  : "opacity-0 sm:opacity-100 sm:group-hover:opacity-100",
              )}
            >
              <ArrowRight
                className="h-3.5 w-3.5 text-brand-red"
                aria-hidden
              />
            </div>
          </div>
        </div>

        <div className="relative flex flex-1 flex-col gap-1.5">
          <h4 className="font-semibold text-brand-charcoal dark:text-foreground">
            {tool.title}
          </h4>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {tool.description}
          </p>
        </div>

        <p
          className={cn(
            "relative text-xs font-medium",
            isLive
              ? "text-emerald-700 dark:text-emerald-400"
              : "text-muted-foreground",
          )}
        >
          {tool.requiresServer ? (
            "Requires server"
          ) : isLive ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live
            </span>
          ) : (
            "In development"
          )}
        </p>
      </article>
    </Link>
  );
}

export function ToolCardGrid() {
  return (
    <LandingBg>
      <section
        id="tools"
        className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-24 sm:px-6 sm:pb-28"
      >
        <SectionHeader
          eyebrow="Full toolkit"
          title="All PDF tools"
          description="Organize, convert, edit, and secure your PDFs — all in your browser."
          className="mb-14"
        />

        <div className="flex flex-col gap-10">
          {TOOL_CATEGORIES.map((category) => {
            const tools = getToolsByCategory(category);
            const styles = CATEGORY_STYLES[category];

            return (
              <div
                key={category}
                className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/40 p-6 shadow-sm backdrop-blur-sm sm:p-8 dark:bg-card/25"
              >
                <div
                  className={cn(
                    "pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl",
                    styles.glow,
                  )}
                  aria-hidden
                />
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 bg-gradient-to-br",
                    styles.panel,
                  )}
                  aria-hidden
                />

                <div className="relative mb-6 flex items-center gap-3">
                  <div
                    className={cn("h-9 w-1.5 rounded-full", styles.bar)}
                  />
                  <h3 className="text-xl font-semibold text-brand-charcoal dark:text-foreground">
                    {category}
                  </h3>
                  <span className="rounded-full border border-border/60 bg-background/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {tools.length} tools
                  </span>
                </div>

                <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {tools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      categoryStyle={styles}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </LandingBg>
  );
}
