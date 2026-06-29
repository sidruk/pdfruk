import type { Metadata } from "next";

import type { ToolDefinition } from "@/config/tools";

import {
  SITE_DESCRIPTION,
  SITE_FACEBOOK_URL,
  SITE_NAME,
  SITE_PHONE,
  SITE_TAGLINE,
  getSiteUrl,
} from "./site";

function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildPageMetadata({
  title,
  description,
  path = "/",
  keywords,
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    openGraph: {
      type: "website",
      locale: "en_GB",
      url,
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
    },
  };
}

export function buildRootMetadata(): Metadata {
  const url = absoluteUrl("/");
  const fullTitle = `${SITE_NAME} — ${SITE_TAGLINE}`;

  return {
    description: SITE_DESCRIPTION,
    keywords: [
      "pdf tools",
      "free pdf editor",
      "merge pdf online",
      "split pdf",
      "pdf converter",
      "privacy first pdf",
      "browser pdf tools",
      "no upload pdf",
    ],
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_GB",
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description: SITE_DESCRIPTION,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: SITE_DESCRIPTION,
    },
  };
}

export function buildHomeMetadata(): Metadata {
  return buildPageMetadata({
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    path: "/",
    keywords: [
      "pdf tools",
      "free pdf editor",
      "merge pdf online",
      "split pdf",
      "pdf converter",
      "privacy first pdf",
      "browser pdf tools",
      "no upload pdf",
    ],
  });
}

export function buildToolMetadata(tool: ToolDefinition): Metadata {
  return buildPageMetadata({
    title: tool.seo.title,
    description: tool.seo.description,
    path: tool.href,
    keywords: tool.seo.keywords,
  });
}

export function buildOrganizationJsonLd() {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: siteUrl,
    logo: absoluteUrl("/icon.png"),
    description: SITE_DESCRIPTION,
    sameAs: [SITE_FACEBOOK_URL],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE_PHONE,
      contactType: "customer service",
      availableLanguage: ["English"],
    },
  };
}

export function buildWebSiteJsonLd() {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl,
    description: SITE_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/#tools`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildToolJsonLd(tool: ToolDefinition) {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}${tool.href}`;

  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.seo.title,
    url,
    description: tool.seo.description,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "GBP",
    },
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: siteUrl,
    },
  };
}

export function buildFaqJsonLd(
  items: ReadonlyArray<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
