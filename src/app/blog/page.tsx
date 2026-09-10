import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { listPosts, formatDate } from "@/lib/blog/posts";
import { readingTime } from "@/lib/blog/text";
import { PostCard } from "@/components/blog/PostCard";
import { BlogBanner } from "@/components/blog/BlogBanner";
import { BlogMasthead } from "@/components/blog/BlogMasthead";
import { POST_TYPE_LABEL } from "@/components/blog/labels";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog Bizko | Conseils pour les indépendants",
  description:
    "Comment présenter ses services, ses prix et son portfolio en un lien, et transformer son audience WhatsApp en demandes sérieuses.",
  alternates: {
    canonical: "https://bizko.pro/blog",
  },
  openGraph: {
    title: "Blog Bizko | Conseils pour les indépendants",
    description:
      "Comment présenter ses services, ses prix et son portfolio en un lien, et transformer son audience WhatsApp en demandes sérieuses.",
    url: "https://bizko.pro/blog",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Blog Bizko",
    description: "Conseils pour les indépendants qui veulent convertir en un lien.",
  },
};

export const revalidate = 86400;

export default async function BlogIndex() {
  const posts = listPosts("fr", true);
  const [featured, ...rest] = posts;

  return (
    <main>
      <BlogMasthead />

      <section className="border-b border-border/70">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Blog</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">
            Conseils pour les indépendants
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-600">
            Présente tes services, tes prix et ton portfolio en un lien, et transforme ton audience
            en demandes sérieuses.
          </p>
        </div>
      </section>

      {posts.length === 0 ? (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-gray-500">Aucun article publié pour l&apos;instant.</p>
        </section>
      ) : (
        <>
          {featured && (
            <section className="mx-auto max-w-6xl px-6 pt-12">
              <Link
                href={`/blog/${featured.slug}`}
                className="group grid overflow-hidden rounded-3xl border border-border bg-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-accent/40 hover:shadow-[0_32px_64px_-32px_rgba(17,24,39,0.35)] md:grid-cols-2"
              >
                <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto">
                  <BlogBanner
                    seed={featured.slug}
                    label={POST_TYPE_LABEL[featured.frontmatter.type]}
                    cover={featured.frontmatter.cover}
                    className="size-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-col justify-center p-8 md:p-10">
                  <span className="w-fit rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-accent">
                    {POST_TYPE_LABEL[featured.frontmatter.type]}
                  </span>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 transition-colors group-hover:text-accent">
                    {featured.frontmatter.title}
                  </h2>
                  <p className="mt-3 leading-relaxed text-gray-600 line-clamp-3">
                    {featured.frontmatter.description}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <time dateTime={featured.frontmatter.date}>
                      {formatDate(featured.frontmatter.date)}
                    </time>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {readingTime(featured.content)} min de lecture
                    </span>
                  </div>
                  <span
                    className={cn(
                      "mt-6 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-accent",
                      "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
                    )}
                  >
                    Lire l&apos;article
                    <ArrowRight className="size-4" />
                  </span>
                </div>
              </Link>
            </section>
          )}

          {rest.length > 0 && (
            <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}