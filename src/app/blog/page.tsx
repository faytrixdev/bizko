import type { Metadata } from "next";
import Link from "next/link";
import { listPosts, formatDate } from "@/lib/blog/posts";

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

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm font-medium text-accent">Blog</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">Conseils pour les indépendants</h1>
      <p className="mt-3 text-lg text-gray-600">
        Présente tes services, tes prix et ton portfolio en un lien, et transforme ton audience en demandes sérieuses.
      </p>

      <div className="mt-12 space-y-10">
        {posts.length === 0 ? (
          <p className="text-gray-500">Aucun article publié pour l&apos;instant.</p>
        ) : (
          posts.map((post) => (
            <article key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group block">
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                  <time dateTime={post.frontmatter.date}>{formatDate(post.frontmatter.date)}</time>
                  {post.frontmatter.tags.length > 0 && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-gray-600">
                      {post.frontmatter.tags[0]}
                    </span>
                  )}
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight group-hover:underline">{post.frontmatter.title}</h2>
                <p className="mt-2 text-gray-600">{post.frontmatter.description}</p>
              </Link>
            </article>
          ))
        )}
      </div>
    </main>
  );
}