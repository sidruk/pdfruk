import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogPostBody } from "@/components/blog/blog-post-body";
import { ContentPage } from "@/components/layout/content-page";
import {
  getBlogPost,
  getBlogPostPath,
  getBlogPostSlugs,
} from "@/lib/content/blog-posts";
import { JsonLd } from "@/lib/seo/json-ld";
import {
  buildBlogPostJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildPageMetadata,
} from "@/lib/seo/metadata";

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function generateStaticParams() {
  return getBlogPostSlugs().map((slug) => ({ slug }));
}

type BlogPostPageProps = {
  params: { slug: string };
};

export function generateMetadata({ params }: BlogPostPageProps): Metadata {
  const post = getBlogPost(params.slug);

  if (!post) {
    return {};
  }

  return buildPageMetadata({
    title: post.metaTitle,
    description: post.excerpt,
    path: getBlogPostPath(post.slug),
    keywords: post.keywords,
  });
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  const path = getBlogPostPath(post.slug);
  const jsonLd = [
    buildBlogPostJsonLd({
      title: post.title,
      description: post.excerpt,
      path,
      datePublished: post.datePublished,
      dateModified: post.dateModified,
    }),
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: post.title, path },
    ]),
    ...(post.faqs ? [buildFaqJsonLd(post.faqs)] : []),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <ContentPage
        title={post.title}
        description={post.excerpt}
        publishedDate={formatDate(post.datePublished)}
        lastUpdated={
          post.dateModified !== post.datePublished
            ? formatDate(post.dateModified)
            : undefined
        }
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.title },
        ]}
        relatedLinks={post.relatedLinks}
      >
        <BlogPostBody post={post} />
      </ContentPage>
    </>
  );
}
