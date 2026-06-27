import { notFound } from "next/navigation";

import { ComingSoon } from "@/components/tools/coming-soon";
import { getToolByHref } from "@/config/tools";

type StubToolPageProps = {
  href: string;
};

export function StubToolPage({ href }: StubToolPageProps) {
  const tool = getToolByHref(href);
  if (!tool) notFound();
  return <ComingSoon tool={tool} />;
}
