import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { TOOLS } from "@/config/tools";
import { cn } from "@/lib/utils";

const POPULAR_TOOL_IDS = ["merge", "split", "pdf-to-jpg"] as const;

export function PopularTools() {
  const popularTools = POPULAR_TOOL_IDS.map((id) =>
    TOOLS.find((tool) => tool.id === id),
  ).filter(Boolean);

  return (
    <section className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-red">
            Popular
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-brand-charcoal dark:text-foreground">
            Start with these tools
          </h2>
        </div>
        <Link
          href="#tools"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "hidden shrink-0 text-brand-red hover:text-brand-red sm:inline-flex",
          )}
        >
          View all
          <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0">
        {popularTools.map((tool) => {
          if (!tool) return null;
          const Icon = tool.icon;
          const isLive = tool.status === "live";

          return (
            <Link
              key={tool.id}
              href={tool.href}
              className={cn(
                "group flex min-w-[240px] flex-1 flex-col gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all sm:min-w-0",
                isLive
                  ? "hover:-translate-y-0.5 hover:border-brand-red/30 hover:shadow-md"
                  : "opacity-80",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-red to-brand-red-hover text-white shadow-sm">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <ArrowRight
                  className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand-red"
                  aria-hidden
                />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-brand-charcoal dark:text-foreground">
                  {tool.title}
                </h3>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
