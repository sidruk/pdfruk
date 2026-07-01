import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { BlogPostMeta } from "@/lib/content/blog-posts";
import { getBlogPostPath } from "@/lib/content/blog-posts";
import { cn } from "@/lib/utils";

function formatBlogDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type BlogCardProps = {
  post: BlogPostMeta;
  variant?: "default" | "featured";
};

export function BlogCard({ post, variant = "default" }: BlogCardProps) {
  const href = getBlogPostPath(post.slug);
  const isFeatured = variant === "featured";

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all",
        "hover:border-brand-red/30 hover:shadow-md hover:shadow-brand-red/5",
        isFeatured ? "md:grid md:grid-cols-2" : "flex flex-col",
      )}
    >
      <Link
        href={href}
        className={cn(
          "relative block shrink-0 overflow-hidden bg-muted/40",
          isFeatured ? "aspect-[16/10] md:aspect-auto md:min-h-[280px]" : "aspect-[16/10]",
        )}
        tabIndex={-1}
        aria-hidden
      >
        <Image
          src={post.coverImage}
          alt={post.coverImageAlt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          sizes={
            isFeatured
              ? "(max-width: 768px) 100vw, 50vw"
              : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          }
          priority={isFeatured}
        />
      </Link>

      <div className={cn("flex flex-col p-5 sm:p-6", isFeatured && "justify-center")}>
        <time
          dateTime={post.datePublished}
          className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
        >
          {formatBlogDate(post.datePublished)}
        </time>

        <h2
          className={cn(
            "mt-2 font-semibold leading-snug text-foreground transition-colors group-hover:text-brand-red",
            isFeatured ? "text-xl sm:text-2xl" : "text-base sm:text-lg",
          )}
        >
          <Link href={href}>{post.title}</Link>
        </h2>

        <p
          className={cn(
            "mt-2 flex-1 leading-relaxed text-muted-foreground",
            isFeatured ? "text-sm sm:text-base" : "text-sm line-clamp-3",
          )}
        >
          {post.excerpt}
        </p>

        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-red"
        >
          Read more
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
