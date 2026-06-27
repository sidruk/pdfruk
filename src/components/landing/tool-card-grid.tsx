import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  TOOL_CATEGORIES,
  getToolsByCategory,
  type ToolCategory,
  type ToolDefinition,
} from "@/config/tools";
import { cn } from "@/lib/utils";

const CATEGORY_BAR: Record<ToolCategory, string> = {
  Organize: "bg-violet-500",
  Convert: "bg-sky-500",
  Edit: "bg-amber-500",
  Security: "bg-emerald-500",
};

function ToolCard({ tool }: { tool: ToolDefinition }) {
  const Icon = tool.icon;
  const isLive = tool.status === "live";

  return (
    <Link
      href={tool.href}
      className={cn(
        "group block h-full",
        !isLive && "opacity-80",
      )}
    >
      <article
        className={cn(
          "flex h-full flex-col gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all",
          isLive &&
            "hover:-translate-y-0.5 hover:border-brand-red/30 hover:shadow-md",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br",
              isLive
                ? "from-brand-red/15 to-brand-red/5 text-brand-red"
                : "from-muted to-muted/50 text-muted-foreground",
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <div className="flex items-center gap-2">
            {!isLive ? <Badge variant="secondary">Coming soon</Badge> : null}
            <ArrowRight
              className="h-4 w-4 text-muted-foreground/0 transition-all group-hover:text-brand-red sm:text-muted-foreground/40 sm:group-hover:translate-x-0.5 sm:group-hover:text-brand-red"
              aria-hidden
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <h4 className="font-semibold text-brand-charcoal dark:text-foreground">
            {tool.title}
          </h4>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {tool.description}
          </p>
        </div>

        <p className="text-xs font-medium text-muted-foreground">
          {tool.requiresServer
            ? "Requires server"
            : isLive
              ? "Available now"
              : "In development"}
        </p>
      </article>
    </Link>
  );
}

export function ToolCardGrid() {
  return (
    <section id="tools" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-20 sm:px-6">
      <div className="mb-10 space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-red">
          Full toolkit
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-brand-charcoal dark:text-foreground sm:text-4xl">
          All PDF tools
        </h2>
        <p className="mx-auto max-w-xl text-muted-foreground">
          Organize, convert, edit, and secure your PDFs — all in your browser.
        </p>
      </div>

      <div className="flex flex-col gap-14">
        {TOOL_CATEGORIES.map((category) => {
          const tools = getToolsByCategory(category);
          return (
            <div key={category} className="space-y-5">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-8 w-1 rounded-full",
                    CATEGORY_BAR[category],
                  )}
                />
                <h3 className="text-xl font-semibold text-brand-charcoal dark:text-foreground">
                  {category}
                </h3>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {tools.length}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
