import {
  TOOL_CATEGORIES,
  getToolsByCategory,
  type ToolCategory,
} from "@/config/tools";

import { SITE_DESCRIPTION, SITE_FACEBOOK_URL, SITE_NAME, SITE_PHONE, getSiteUrl } from "./site";

const CATEGORY_INTROS: Record<ToolCategory, string> = {
  Organize: "Reorder, combine, and extract pages from PDF documents.",
  Convert: "Convert between PDF and image formats in the browser.",
  Edit: "Annotate, sign, watermark, and modify PDF content.",
  Security: "Password-protect and unlock PDF files.",
};

function formatToolList(siteUrl: string, category: ToolCategory): string {
  const tools = getToolsByCategory(category);

  if (tools.length === 0) return "";

  const items = tools
    .map((tool) => {
      const url = `${siteUrl}${tool.href}`;
      const note =
        tool.status === "live"
          ? tool.description
          : `${tool.description} (under construction)`;
      return `- [${tool.title}](${url}): ${note}`;
    })
    .join("\n");

  return `## ${category}\n\n${CATEGORY_INTROS[category]}\n\n${items}`;
}

export function buildLlmsTxt(): string {
  const siteUrl = getSiteUrl();

  const toolSections = TOOL_CATEGORIES.map((category) =>
    formatToolList(siteUrl, category),
  )
    .filter(Boolean)
    .join("\n\n");

  return `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

${SITE_NAME} is a free online PDF toolkit. Most tools process files locally in the user's browser so documents stay on the device. No account or subscription is required.

## Home

- [${SITE_NAME} homepage](${siteUrl}/): Free privacy-first PDF tools to merge, split, convert, edit, and secure documents in your browser.

${toolSections}

## Optional

- [FAQ](${siteUrl}/#faq): Answers about pricing, privacy, file uploads, supported browsers, and offline use.
- [Facebook](${SITE_FACEBOOK_URL}): Follow pdfruk for updates and support.
- [Contact](tel:${SITE_PHONE}): Reach pdfruk by phone at ${SITE_PHONE}.
`;
}
