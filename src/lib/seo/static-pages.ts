export type StaticPageFaq = {
  question: string;
  answer: string;
};

export type StaticPageLink = {
  href: string;
  label: string;
};

export type StaticPageConfig = {
  path: string;
  /** Visible H1 and breadcrumb label */
  title: string;
  /** `<title>` and Open Graph — can be more search-intent focused */
  metaTitle: string;
  /** Subtitle shown under the H1 */
  description: string;
  /** Meta description (150–160 chars ideal) */
  metaDescription: string;
  keywords: string[];
  /** ISO 8601 date for schema and sitemap */
  dateModified: string;
  sitemapPriority: number;
  faqs?: StaticPageFaq[];
  relatedLinks?: StaticPageLink[];
};

export const SECURITY_PAGE: StaticPageConfig = {
  path: "/security",
  title: "Security",
  metaTitle: "PDF Security — How pdfruk Keeps Your Files Private",
  description:
    "How we protect your documents and keep processing as local as possible.",
  metaDescription:
    "Learn how pdfruk protects PDF security with browser-based processing, HTTPS encryption, and no file storage. Safe, private PDF tools online.",
  keywords: [
    "pdf security",
    "secure pdf tools",
    "private pdf editor",
    "browser pdf processing",
    "pdf privacy",
    "no upload pdf",
    "confidential pdf tools",
    "pdfruk security",
  ],
  dateModified: "2025-06-29",
  sitemapPriority: 0.65,
  faqs: [
    {
      question: "Are pdfruk PDF tools secure?",
      answer:
        "Yes. Most pdfruk tools process PDFs entirely in your browser, so files are not uploaded to our servers. Server-assisted tools use encrypted HTTPS and files are deleted after processing.",
    },
    {
      question: "Does pdfruk store my PDF files?",
      answer:
        "No. Client-side tools never send your files to us. For compress, protect, and unlock, files are processed temporarily and not retained after your task completes.",
    },
    {
      question: "Is pdfruk safe for confidential documents?",
      answer:
        "For merge, split, edit, sign, and convert tasks, processing stays on your device — a strong choice for contracts, invoices, and sensitive records.",
    },
  ],
  relatedLinks: [
    { href: "/privacy", label: "Privacy policy" },
    { href: "/merge", label: "Merge PDF" },
    { href: "/contact", label: "Contact us" },
  ],
};

export const PRIVACY_PAGE: StaticPageConfig = {
  path: "/privacy",
  title: "Privacy policy",
  metaTitle: "Privacy Policy for Free PDF Tools",
  description:
    "We respect your privacy. This policy explains what we collect and what we do not.",
  metaDescription:
    "Read the pdfruk privacy policy: how we handle PDF files, cookies, analytics, and personal data when you use our free online PDF tools.",
  keywords: [
    "pdfruk privacy policy",
    "pdf tools privacy",
    "no upload pdf policy",
    "browser pdf privacy",
    "data protection pdf tools",
    "gdpr pdf tools",
  ],
  dateModified: "2025-06-29",
  sitemapPriority: 0.65,
  faqs: [
    {
      question: "Does pdfruk upload my PDF files?",
      answer:
        "For most tools, no — processing happens in your browser. Only server-assisted tools like compress, protect, and unlock may temporarily transmit files to complete the operation.",
    },
    {
      question: "What data does pdfruk collect?",
      answer:
        "We may collect anonymised usage analytics, standard server logs, and information you voluntarily provide when contacting us. We do not sell personal data.",
    },
    {
      question: "Does pdfruk use cookies?",
      answer:
        "Yes, for essential functionality, theme preferences, and analytics. See our cookie policy for full details and how to manage cookies.",
    },
  ],
  relatedLinks: [
    { href: "/cookies", label: "Cookie policy" },
    { href: "/security", label: "Security" },
    { href: "/terms", label: "Terms & conditions" },
  ],
};

export const TERMS_PAGE: StaticPageConfig = {
  path: "/terms",
  title: "Terms & conditions",
  metaTitle: "Terms & Conditions",
  description: "Terms governing your use of pdfruk and our free PDF tools.",
  metaDescription:
    "pdfruk terms and conditions: acceptable use, disclaimers, liability limits, and rules for using our free online PDF merge, split, and edit tools.",
  keywords: [
    "pdfruk terms",
    "pdf tools terms of use",
    "free pdf editor terms",
    "online pdf service agreement",
  ],
  dateModified: "2025-06-29",
  sitemapPriority: 0.55,
  relatedLinks: [
    { href: "/privacy", label: "Privacy policy" },
    { href: "/about", label: "About us" },
    { href: "/contact", label: "Contact us" },
  ],
};

export const COOKIES_PAGE: StaticPageConfig = {
  path: "/cookies",
  title: "Cookies",
  metaTitle: "Cookie Policy",
  description: "How we use cookies and how you can control them.",
  metaDescription:
    "pdfruk cookie policy: essential cookies, analytics, theme preferences, and how to manage or disable cookies in your browser.",
  keywords: [
    "pdfruk cookies",
    "cookie policy pdf tools",
    "website cookies",
    "google analytics cookies",
  ],
  dateModified: "2025-06-29",
  sitemapPriority: 0.5,
  faqs: [
    {
      question: "What cookies does pdfruk use?",
      answer:
        "We use essential cookies for site functionality and theme preferences, and may use analytics cookies to understand how visitors use our tools.",
    },
    {
      question: "Do pdfruk cookies store my PDF content?",
      answer:
        "No. Cookies are not used to store the contents of your PDF files. Browser-based tools process documents locally on your device.",
    },
  ],
  relatedLinks: [
    { href: "/privacy", label: "Privacy policy" },
    { href: "/security", label: "Security" },
  ],
};

export const ABOUT_PAGE: StaticPageConfig = {
  path: "/about",
  title: "About us",
  metaTitle: "About Us — Free Privacy-First PDF Tools",
  description: "Free, privacy-first PDF tools that run in your browser.",
  metaDescription:
    "About pdfruk: free online PDF tools to merge, split, convert, and edit files in your browser. No sign-up, no watermarks, privacy-first processing.",
  keywords: [
    "about pdfruk",
    "free pdf tools",
    "privacy first pdf editor",
    "browser pdf toolkit",
    "online pdf utilities",
  ],
  dateModified: "2025-06-29",
  sitemapPriority: 0.7,
  relatedLinks: [
    { href: "/merge", label: "Merge PDF" },
    { href: "/split", label: "Split PDF" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact us" },
  ],
};

export const CONTACT_PAGE: StaticPageConfig = {
  path: "/contact",
  title: "Contact us",
  metaTitle: "Contact Us — Support & Enquiries",
  description: "We are here to help with support, feedback, and enquiries.",
  metaDescription:
    "Contact the pdfruk team for PDF tool support, feedback, privacy requests, or partnership enquiries via WhatsApp, phone, or email.",
  keywords: [
    "contact pdfruk",
    "pdf tools support",
    "pdfruk help",
    "pdfruk customer service",
  ],
  dateModified: "2025-06-29",
  sitemapPriority: 0.7,
  relatedLinks: [
    { href: "/#faq", label: "FAQ" },
    { href: "/press", label: "Press" },
    { href: "/about", label: "About us" },
  ],
};

export const BLOG_PAGE: StaticPageConfig = {
  path: "/blog",
  title: "Blog",
  metaTitle: "PDF Tips & Guides — pdfruk Blog",
  description: "Guides, tips, and news about PDFs, privacy, and productivity.",
  metaDescription:
    "pdfruk blog: expert tips on merging PDFs, document privacy, free PDF tools, and productivity — practical guides for students and professionals.",
  keywords: [
    "pdf tips",
    "pdf guides",
    "merge pdf guide",
    "pdf privacy tips",
    "free pdf tools blog",
    "document productivity",
  ],
  dateModified: "2025-06-29",
  sitemapPriority: 0.75,
  relatedLinks: [
    { href: "/merge", label: "Merge PDF tool" },
    { href: "/security", label: "PDF security" },
    { href: "/about", label: "About pdfruk" },
  ],
};

export const PRESS_PAGE: StaticPageConfig = {
  path: "/press",
  title: "Press",
  metaTitle: "Press & Media Kit",
  description: "Media resources, brand assets, and contact for journalists.",
  metaDescription:
    "pdfruk press room: company boilerplate, brand logos, key facts, and media contact for journalists covering free privacy-first PDF tools.",
  keywords: [
    "pdfruk press",
    "pdfruk media kit",
    "pdf tools press release",
    "pdfruk brand assets",
  ],
  dateModified: "2025-06-29",
  sitemapPriority: 0.55,
  relatedLinks: [
    { href: "/about", label: "About us" },
    { href: "/contact", label: "Contact us" },
  ],
};

export const ALL_STATIC_PAGES: StaticPageConfig[] = [
  SECURITY_PAGE,
  PRIVACY_PAGE,
  TERMS_PAGE,
  COOKIES_PAGE,
  ABOUT_PAGE,
  CONTACT_PAGE,
  BLOG_PAGE,
  PRESS_PAGE,
];

export function getStaticPageByPath(path: string): StaticPageConfig | undefined {
  return ALL_STATIC_PAGES.find((page) => page.path === path);
}
