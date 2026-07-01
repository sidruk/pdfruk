import Link from "next/link";

import { BlogCard } from "@/components/blog/blog-card";
import { getAllBlogPosts, getBlogPostPath } from "@/lib/content/blog-posts";
import { createStaticPage } from "@/lib/seo/create-static-page";
import { buildBlogListingJsonLd } from "@/lib/seo/metadata";
import { BLOG_PAGE } from "@/lib/seo/static-pages";

const { metadata, StaticPageShell } = createStaticPage(BLOG_PAGE);

export { metadata };

const BLOG_POSTS = getAllBlogPosts();
const [featuredPost, ...remainingPosts] = BLOG_POSTS;

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
    <StaticPageShell
      extraJsonLd={blogJsonLd}
      showLastUpdated={false}
      wide
      unstyledContent
    >
      <p className="text-muted-foreground">
        Practical advice for getting more from your documents — from merging and
        splitting to keeping sensitive files private. Explore our free{" "}
        <Link href="/#tools">PDF tools</Link> or read about our{" "}
        <Link href="/security">security approach</Link>.
      </p>

      <div className="not-prose mt-10 space-y-8">
        {featuredPost ? (
          <section aria-label="Latest post">
            <BlogCard post={featuredPost} variant="featured" />
          </section>
        ) : null}

        {remainingPosts.length > 0 ? (
          <section aria-label="All posts">
            <div className="grid gap-6 sm:grid-cols-2">
              {remainingPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </StaticPageShell>
  );
}
