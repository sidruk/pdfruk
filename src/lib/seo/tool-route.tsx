import type { ReactNode } from "react";
import type { Metadata } from "next";

import { getToolByHref } from "@/config/tools";

import { JsonLd } from "./json-ld";
import { buildToolJsonLd, buildToolMetadata } from "./metadata";

export function createToolRoute(href: string) {
  const tool = getToolByHref(href);

  if (!tool) {
    throw new Error(`No tool registered for href: ${href}`);
  }

  const resolvedTool = tool;
  const metadata: Metadata = buildToolMetadata(resolvedTool);

  function ToolRouteLayout({ children }: { children: ReactNode }) {
    return (
      <>
        <JsonLd data={buildToolJsonLd(resolvedTool)} />
        {children}
      </>
    );
  }

  return { metadata, ToolRouteLayout };
}
