import Link from "next/link";
import { formatDate, type Post } from "@/lib/blog/posts";
import { readingTime } from "@/lib/blog/text";
import { BlogBanner } from "./BlogBanner";
import { POST_TYPE_LABEL } from "./labels";

export function PostCard({ post }: { post: Post }) {
  const { frontmatter } = post;
  const typeLabel = POST_TYPE_LABEL[frontmatter.type];

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_24px_48px_-24px_rgba(17,24,39,0.3)]"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <BlogBanner
          seed={post.slug}
          label={typeLabel}
          cover={frontmatter.cover}
          className="size-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        />
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-accent">
            {typeLabel}
          </span>
          {frontmatter.tags[0] && (
            <span className="text-xs text-gray-400">{frontmatter.tags[0]}</span>
          )}
        </div>
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-gray-900 transition-colors group-hover:text-accent">
          {frontmatter.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">
          {frontmatter.description}
        </p>
        <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-500">
          <time dateTime={frontmatter.date}>{formatDate(frontmatter.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{readingTime(post.content)} min de lecture</span>
        </div>
      </div>
    </Link>
  );
}