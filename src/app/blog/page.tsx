import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getAllBlogPosts, getBlogPostPath } from "@/lib/content/blog-posts";
import { createStaticPage } from "@/lib/seo/create-static-page";
import { buildBlogListingJsonLd } from "@/lib/seo/metadata";
import { BLOG_PAGE } from "@/lib/seo/static-pages";

const { metadata, StaticPageShell } = createStaticPage(BLOG_PAGE);

export { metadata };

const BLOG_POSTS = getAllBlogPosts();

const blogJsonLd = buildBlogListingJsonLd(
  BLOG_POSTS.map((post) => ({
    title: post.title,
    url: getBlogPostPath(post.slug),
    datePublished: post.datePublished,
    description: post.excerpt,
  })),
);

export default function BlogPage() {
  return (
    <StaticPageShell extraJsonLd={blogJsonLd} showLastUpdated={false}>
      <p>
        Practical advice for getting more from your documents — from merging and
        splitting to keeping sensitive files private. Explore our free{" "}
        <Link href="/#tools">PDF tools</Link> or read about our{" "}
        <Link href="/security">security approach</Link>.
      </p>

      <div className="not-prose mt-8 space-y-4">
        {BLOG_POSTS.map((post) => {
          const Icon = post.icon;
          const href = getBlogPostPath(post.slug);

          return (
            <article
              key={post.slug}
              className="group rounded-xl border border-border/60 bg-background/50 p-5 transition-colors hover:border-brand-red/30 hover:bg-background"
            >
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-red/10 text-brand-red">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <time
                    dateTime={post.datePublished}
                    className="text-xs font-medium text-muted-foreground"
                  >
                    {new Date(post.datePublished).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                  <h2 className="mt-1 text-base font-semibold text-foreground group-hover:text-brand-red">
                    <Link href={href}>{post.title}</Link>
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {post.excerpt}
                  </p>
                  <Link
                    href={href}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-red"
                  >
                    Read more
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </StaticPageShell>
  );
}
