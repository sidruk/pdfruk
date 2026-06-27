import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { ToolDefinition } from "@/config/tools";
import { cn } from "@/lib/utils";

type ComingSoonProps = {
  tool: ToolDefinition;
};

export function ComingSoon({ tool }: ComingSoonProps) {
  const Icon = tool.icon;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <Icon className="h-8 w-8 text-muted-foreground" aria-hidden />
      </div>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {tool.title}
          </h1>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" aria-hidden />
            Coming soon
          </Badge>
        </div>
        <p className="text-muted-foreground">{tool.description}</p>
        {tool.requiresServer ? (
          <p className="text-sm text-muted-foreground">
            Requires backend service — planned for a future release.
          </p>
        ) : null}
      </div>
      <Link
        href="/"
        className={cn(buttonVariants({ variant: "outline" }), "inline-flex items-center")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
        Back to all tools
      </Link>
    </div>
  );
}
