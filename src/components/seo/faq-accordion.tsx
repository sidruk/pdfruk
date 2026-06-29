import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type FaqAccordionItem = {
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  items: readonly FaqAccordionItem[];
  title?: string;
  showTitle?: boolean;
  titleClassName?: string;
};

export function FaqAccordion({
  items,
  title = "FAQ",
  showTitle = true,
  titleClassName,
}: FaqAccordionProps) {
  return (
    <div className="space-y-4">
      {showTitle ? (
        <h2
          className={cn(
            "text-xl font-semibold text-brand-charcoal dark:text-foreground",
            titleClassName,
          )}
        >
          {title}
        </h2>
      ) : null}
      <div className="space-y-3">
        {items.map((item) => (
          <details
            key={item.question}
            className="group rounded-2xl border border-border/60 bg-card/90 shadow-sm backdrop-blur-sm dark:bg-card/70 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 text-base font-semibold text-brand-charcoal marker:content-none dark:text-foreground">
              <span className="text-left">{item.question}</span>
              <ChevronDown
                className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <p className="border-t border-border/40 px-6 pb-6 pt-4 text-sm leading-relaxed text-muted-foreground">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
