import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

import type { StaticPageLink } from "@/lib/seo/static-pages";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type ContentPageProps = {
  title: string;
  description?: string;
  lastUpdated?: string;
  publishedDate?: string;
  coverImage?: string;
  coverImageAlt?: string;
  breadcrumbs?: BreadcrumbItem[];
  relatedLinks?: StaticPageLink[];
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
  unstyledContent?: boolean;
};

export function ContentPage({
  title,
  description,
  lastUpdated,
  publishedDate,
  coverImage,
  coverImageAlt,
  breadcrumbs,
  relatedLinks,
  children,
  className,
  wide = false,
  unstyledContent = false,
}: ContentPageProps) {
  const trail: BreadcrumbItem[] = breadcrumbs ?? [
    { label: "Home", href: "/" },
    { label: title },
  ];
  return (
    <article className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -left-32 top-0 h-64 w-64 rounded-full bg-brand-red/8 blur-3xl dark:bg-brand-red/12" />
        <div className="absolute -right-24 bottom-0 h-56 w-56 rounded-full bg-brand-charcoal/5 blur-3xl dark:bg-brand-charcoal/15" />
        <div className="landing-dot-grid absolute inset-0 opacity-40" />
      </div>

      <div
        className={cn(
          "mx-auto px-4 py-12 sm:px-6 sm:py-16",
          wide ? "max-w-5xl" : "max-w-3xl",
        )}
      >
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            {trail.map((item, index) => {
              const isLast = index === trail.length - 1;
              return (
                <li
                  key={`${item.label}-${index}`}
                  className="flex items-center gap-1.5"
                  {...(isLast ? { "aria-current": "page" as const } : {})}
                >
                  {index > 0 ? (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  ) : null}
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="transition-colors hover:text-brand-red"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className={isLast ? "font-medium text-foreground" : undefined}>
                      {item.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <header className="mb-10 space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-brand-charcoal dark:text-foreground sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              {description}
            </p>
          ) : null}
          {publishedDate ? (
            <p className="text-xs text-muted-foreground">
              Published: {publishedDate}
              {lastUpdated ? ` · Last updated: ${lastUpdated}` : null}
            </p>
          ) : lastUpdated ? (
            <p className="text-xs text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          ) : null}
        </header>

        {coverImage ? (
          <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-2xl border border-border/60 shadow-sm">
            <Image
              src={coverImage}
              alt={coverImageAlt ?? title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        ) : null}

        {unstyledContent ? (
          children
        ) : (
          <div
            className={cn(
              "rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur-sm sm:p-8",
              "[&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-brand-charcoal [&_h2]:first:mt-0 dark:[&_h2]:text-foreground",
              "[&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground",
              "[&_p]:mt-3 [&_p]:leading-relaxed [&_p]:text-muted-foreground",
              "[&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-muted-foreground",
              "[&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_ol]:text-muted-foreground",
              "[&_a]:font-medium [&_a]:text-brand-red [&_a]:underline-offset-4 hover:[&_a]:underline",
              "[&_strong]:font-semibold [&_strong]:text-foreground",
              className,
            )}
          >
            {children}
          </div>
        )}

        {relatedLinks && relatedLinks.length > 0 ? (
          <aside
            aria-label="Related pages"
            className="mt-8 rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm"
          >
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-charcoal dark:text-foreground">
              Related pages
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {relatedLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-brand-red/40 hover:text-brand-red"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </div>
    </article>
  );
}
