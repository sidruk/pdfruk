import Link from "next/link";

import { getToolById } from "@/config/tools";
import type { ToolSeoContent } from "@/lib/seo/tool-content";

type ToolSeoContentProps = {
  content: ToolSeoContent;
};

export function ToolSeoContentBlock({ content }: ToolSeoContentProps) {
  const relatedTools = content.relatedToolIds
    .map((id) => getToolById(id))
    .filter((tool) => tool !== undefined);

  return (
    <section
      aria-label="About this tool"
      className="border-t border-border/60 bg-muted/30"
    >
      <div className="mx-auto max-w-4xl space-y-10 px-4 py-12 sm:px-6 sm:py-16">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-red">
            Quick answer
          </p>
          <p className="text-base leading-relaxed text-muted-foreground">
            {content.directAnswer}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-brand-charcoal dark:text-foreground">
            {content.howToTitle}
          </h2>
          <ol className="list-decimal space-y-2 pl-5 text-base leading-relaxed text-muted-foreground">
            {content.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-brand-charcoal dark:text-foreground">
            Frequently asked questions
          </h2>
          <dl className="space-y-4">
            {content.faqs.map((item) => (
              <div
                key={item.question}
                className="rounded-2xl border border-border/60 bg-card/90 p-6 shadow-sm backdrop-blur-sm dark:bg-card/70"
              >
                <dt className="text-base font-semibold text-brand-charcoal dark:text-foreground">
                  {item.question}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {relatedTools.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-brand-charcoal dark:text-foreground">
              Related PDF tools
            </h2>
            <ul className="flex flex-wrap gap-2">
              {relatedTools.map((tool) => (
                <li key={tool.id}>
                  <Link
                    href={tool.href}
                    className="inline-flex rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-brand-charcoal transition-colors hover:border-brand-red/30 hover:bg-brand-red/5 hover:text-brand-red dark:text-foreground"
                  >
                    {tool.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
