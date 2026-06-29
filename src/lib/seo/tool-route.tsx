import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ToolSeoContentBlock } from "@/components/seo/tool-seo-content";
import { getToolByHref } from "@/config/tools";

import { JsonLd } from "./json-ld";
import {
  buildFaqJsonLd,
  buildHowToJsonLd,
  buildToolJsonLd,
  buildToolMetadata,
} from "./metadata";
import { getToolSeoContent } from "./tool-content";

export function createToolRoute(href: string) {
  const tool = getToolByHref(href);

  if (!tool) {
    throw new Error(`No tool registered for href: ${href}`);
  }

  const resolvedTool = tool;
  const seoContent = getToolSeoContent(resolvedTool.id);
  const metadata: Metadata = buildToolMetadata(resolvedTool);

  function ToolRouteLayout({ children }: { children: ReactNode }) {
    if (resolvedTool.hidden) {
      notFound();
    }

    const jsonLd = [
      buildToolJsonLd(resolvedTool),
      ...(seoContent
        ? [
            buildHowToJsonLd(resolvedTool, seoContent),
            buildFaqJsonLd(seoContent.faqs),
          ]
        : []),
    ];

    return (
      <>
        <JsonLd data={jsonLd} />
        {children}
        {seoContent ? <ToolSeoContentBlock content={seoContent} /> : null}
      </>
    );
  }

  return { metadata, ToolRouteLayout };
}
