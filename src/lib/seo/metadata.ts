import type { Metadata } from "next";

import type { ToolDefinition } from "@/config/tools";

import type { ToolSeoContent } from "./tool-content";

import { getRobotsMetadata } from "./indexing";
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
  const ogImage = absoluteUrl("/icon.png");

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    robots: getRobotsMetadata(noIndex),
    openGraph: {
      type: "website",
      locale: "en_GB",
      url,
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [
        {
          url: ogImage,
          width: 512,
          height: 512,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [ogImage],
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
    robots: getRobotsMetadata(),
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
    noIndex: tool.status !== "live",
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

export function buildHowToJsonLd(
  tool: ToolDefinition,
  content: ToolSeoContent,
) {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}${tool.href}`;

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: content.howToTitle,
    description: content.directAnswer,
    url,
    step: content.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.split(".")[0],
      text: step,
    })),
  };
}

export function buildBreadcrumbJsonLd(
  items: ReadonlyArray<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildWebPageJsonLd({
  title,
  description,
  path,
  dateModified,
}: {
  title: string;
  description: string;
  path: string;
  dateModified?: string;
}) {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: absoluteUrl(path),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: siteUrl,
    },
    ...(dateModified
      ? {
          dateModified,
          datePublished: dateModified,
        }
      : {}),
    inLanguage: "en-GB",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl,
      logo: absoluteUrl("/icon.png"),
    },
  };
}

export function buildBlogListingJsonLd(
  posts: ReadonlyArray<{
    title: string;
    url: string;
    datePublished: string;
    description: string;
  }>,
) {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${SITE_NAME} Blog`,
    description: "PDF tips, guides, and productivity advice from pdfruk.",
    url: absoluteUrl("/blog"),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl,
      logo: absoluteUrl("/icon.png"),
    },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      url: absoluteUrl(post.url),
      datePublished: post.datePublished,
      author: {
        "@type": "Organization",
        name: SITE_NAME,
      },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        logo: absoluteUrl("/icon.png"),
      },
    })),
  };
}

export function buildBlogPostJsonLd({
  title,
  description,
  path,
  datePublished,
  dateModified,
}: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified: string;
}) {
  const siteUrl = getSiteUrl();
  const url = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    url,
    datePublished,
    dateModified,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/icon.png"),
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    isPartOf: {
      "@type": "Blog",
      name: `${SITE_NAME} Blog`,
      url: absoluteUrl("/blog"),
    },
    inLanguage: "en-GB",
  };
}

export function buildContactPageJsonLd() {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact pdfruk",
    url: absoluteUrl("/contact"),
    description:
      "Contact pdfruk for PDF tool support, feedback, and enquiries.",
    mainEntity: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: SITE_PHONE,
        contactType: "customer service",
        availableLanguage: ["English"],
        url: absoluteUrl("/contact"),
      },
    },
  };
}
