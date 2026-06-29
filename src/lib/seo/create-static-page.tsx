import type { ReactNode } from "react";
import type { Metadata } from "next";

import { ContentPage } from "@/components/layout/content-page";
import { JsonLd } from "@/lib/seo/json-ld";

import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildPageMetadata,
  buildWebPageJsonLd,
} from "./metadata";
import type { StaticPageConfig } from "./static-pages";

function formatLastUpdated(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function createStaticPage(config: StaticPageConfig) {
  const metadata: Metadata = buildPageMetadata({
    title: config.metaTitle,
    description: config.metaDescription,
    path: config.path,
    keywords: config.keywords,
  });

  function StaticPageShell({
    children,
    showLastUpdated = true,
    extraJsonLd,
  }: {
    children: ReactNode;
    showLastUpdated?: boolean;
    extraJsonLd?: Record<string, unknown> | Record<string, unknown>[];
  }) {
    const jsonLd: Record<string, unknown>[] = [
      buildWebPageJsonLd({
        title: config.metaTitle,
        description: config.metaDescription,
        path: config.path,
        dateModified: config.dateModified,
      }),
      buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: config.title, path: config.path },
      ]),
      ...(config.faqs ? [buildFaqJsonLd(config.faqs)] : []),
      ...(extraJsonLd
        ? Array.isArray(extraJsonLd)
          ? extraJsonLd
          : [extraJsonLd]
        : []),
    ];

    return (
      <>
        <JsonLd data={jsonLd} />
        <ContentPage
          title={config.title}
          description={config.description}
          lastUpdated={showLastUpdated ? formatLastUpdated(config.dateModified) : undefined}
          relatedLinks={config.relatedLinks}
        >
          {children}
        </ContentPage>
      </>
    );
  }

  return { metadata, StaticPageShell, config };
}
