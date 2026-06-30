import type { LucideIcon } from "lucide-react";
import { FileText, Shield, Sparkles } from "lucide-react";

import type { StaticPageFaq, StaticPageLink } from "@/lib/seo/static-pages";

export type BlogPostMeta = {
  slug: string;
  title: string;
  metaTitle: string;
  excerpt: string;
  datePublished: string;
  dateModified: string;
  keywords: string[];
  sitemapPriority: number;
  icon: LucideIcon;
  relatedLinks: StaticPageLink[];
  faqs?: StaticPageFaq[];
};

export function getBlogPostPath(slug: string): string {
  return `/blog/${slug}`;
}

export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: "is-it-safe-to-merge-pdf-online",
    title: "Is It Safe to Merge PDFs Online? What Happens to Your Files",
    metaTitle: "Is It Safe to Merge PDFs Online? What Happens to Your Files",
    excerpt:
      "Most online PDF mergers upload your files to a server. Learn the difference between server-side and browser-based merging — and how to combine PDFs without your files ever leaving your device.",
    datePublished: "2026-06-30",
    dateModified: "2026-06-30",
    keywords: [
      "is it safe to merge pdf online",
      "merge pdf online safe",
      "merge pdf without uploading",
      "browser based pdf merge",
      "private pdf merge",
      "client side pdf merge",
    ],
    sitemapPriority: 0.76,
    icon: Shield,
    faqs: [
      {
        question:
          "Is it safe to merge bank statements or medical records online?",
        answer:
          "Only with a tool that processes files in your browser. Avoid any merger that uploads to a server for documents like these — use a client-side tool so the file never leaves your device.",
      },
      {
        question: "Do free online PDF mergers steal your data?",
        answer:
          "Most reputable ones don't, but free plus uploads your file means you're trusting their policies. A browser-based tool sidesteps the question because there's nothing to steal in transit — the file is never sent.",
      },
      {
        question: "Can I merge PDFs completely offline?",
        answer:
          "Yes. A true client-side tool keeps working after the page has loaded even with your internet disconnected, because all the processing happens on your own device.",
      },
      {
        question: "How do I know a tool isn't uploading my PDF?",
        answer:
          "Disconnect your internet after the page loads and try to merge — if it works, it's local. Or open your browser's Network tab and confirm no request carries your file's data out.",
      },
    ],
    relatedLinks: [
      { href: "/merge", label: "Merge PDF tool" },
      { href: "/security", label: "Security" },
      { href: "/blog/merge-pdf-without-uploading", label: "Merge without uploading" },
    ],
  },
  {
    slug: "why-browser-pdf-tools-are-safer",
    title: "Why browser-based PDF tools are safer for confidential documents",
    metaTitle:
      "Why Browser PDF Tools Are Safer for Confidential Documents",
    excerpt:
      "Most cloud PDF services upload your files to remote servers. Learn why client-side processing keeps contracts, invoices, and personal records on your device.",
    datePublished: "2025-06-12",
    dateModified: "2025-06-29",
    keywords: [
      "browser pdf tools",
      "private pdf editor",
      "secure pdf online",
      "confidential pdf",
      "no upload pdf",
      "client side pdf processing",
    ],
    sitemapPriority: 0.72,
    icon: Shield,
    faqs: [
      {
        question: "Are browser PDF tools more private than cloud PDF editors?",
        answer:
          "Yes. Browser-based tools that process files locally never send your document to a remote server, which reduces exposure for contracts, tax records, and other sensitive PDFs.",
      },
      {
        question: "Can pdfruk see my PDF content?",
        answer:
          "For merge, split, edit, sign, and convert tools, processing happens in your browser and pdfruk does not receive your file contents.",
      },
    ],
    relatedLinks: [
      { href: "/security", label: "Security" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/merge", label: "Merge PDF" },
    ],
  },
  {
    slug: "merge-pdf-without-uploading",
    title: "How to merge PDFs without uploading them anywhere",
    metaTitle: "How to Merge PDFs Without Uploading — Step-by-Step Guide",
    excerpt:
      "A step-by-step guide to combining multiple PDF files in your browser using pdfruk — fast, free, and private.",
    datePublished: "2025-06-05",
    dateModified: "2025-06-29",
    keywords: [
      "merge pdf without uploading",
      "combine pdf browser",
      "merge pdf online free",
      "private pdf merge",
      "join pdf files",
    ],
    sitemapPriority: 0.75,
    icon: FileText,
    faqs: [
      {
        question: "Can I merge PDFs without uploading to a server?",
        answer:
          "Yes. With pdfruk's merge tool, files are combined entirely in your browser. Nothing is sent to our servers during the merge process.",
      },
      {
        question: "How many PDFs can I merge at once?",
        answer:
          "You can merge as many PDFs as your browser can handle in one session. Drag files to set the order, then download the combined document.",
      },
    ],
    relatedLinks: [
      { href: "/merge", label: "Merge PDF tool" },
      { href: "/split", label: "Split PDF" },
      { href: "/blog", label: "All blog posts" },
    ],
  },
  {
    slug: "free-pdf-tools-no-watermarks",
    title: "Free PDF tools without watermarks or sign-up",
    metaTitle: "Free PDF Tools Without Watermarks or Sign-Up",
    excerpt:
      "What to look for in a PDF toolkit and why pdfruk avoids paywalls, accounts, and branded watermarks on your output.",
    datePublished: "2025-05-28",
    dateModified: "2025-06-29",
    keywords: [
      "free pdf tools no watermark",
      "pdf editor no sign up",
      "free online pdf",
      "pdf tools without account",
      "no watermark pdf merge",
    ],
    sitemapPriority: 0.72,
    icon: Sparkles,
    faqs: [
      {
        question: "Does pdfruk add watermarks to PDFs?",
        answer:
          "No. pdfruk does not add watermarks or branding to files you create with our free tools.",
      },
      {
        question: "Do I need an account to use pdfruk?",
        answer:
          "No account, email, or sign-up is required. Open a tool, process your file, and download the result.",
      },
    ],
    relatedLinks: [
      { href: "/about", label: "About pdfruk" },
      { href: "/#tools", label: "All tools" },
      { href: "/blog", label: "Blog" },
    ],
  },
];

export function getAllBlogPosts(): BlogPostMeta[] {
  return BLOG_POSTS;
}

export function getBlogPost(slug: string): BlogPostMeta | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getBlogPostSlugs(): string[] {
  return BLOG_POSTS.map((post) => post.slug);
}
