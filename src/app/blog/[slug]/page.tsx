import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { ComponentType } from "react";
import { Clock, ExternalLink, ArrowRight } from "lucide-react";
import {
  getPost,
  listPostFiles,
  listPosts,
  articleUrl,
  articleMarkdownUrl,
  formatDate,
  compactJsonLd,
  type Post,
  type PostFrontmatter,
} from "@/lib/blog/posts";
import { extractToc, readingTime } from "@/lib/blog/text";
import { BlogBanner } from "@/components/blog/BlogBanner";
import { BlogMasthead } from "@/components/blog/BlogMasthead";
import { PostCard } from "@/components/blog/PostCard";
import { ShareButton } from "@/components/blog/ShareButton";
import { POST_TYPE_LABEL } from "@/components/blog/labels";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listPostFiles("fr").map(({ slug }) => ({ slug }));
}

export const dynamicParams = false;
export const revalidate = 86400;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug, "fr");
  if (!post) return { title: "Article introuvable | Bizko" };

  const { frontmatter } = post;
  const url = frontmatter.canonical || articleUrl(post);
  const title = `${frontmatter.title} | Bizko`;

  return {
    title,
    description: frontmatter.description,
    alternates: {
      canonical: url,
      languages: { fr: url, "x-default": url },
      types: { "text/markdown": articleMarkdownUrl(post) },
    },
    openGraph: {
      title,
      description: frontmatter.description,
      url,
      type: "article",
      publishedTime: frontmatter.date,
      modifiedTime: frontmatter.dateModified,
      authors: frontmatter.authorName ? [frontmatter.authorName] : undefined,
      tags: frontmatter.tags,
    },
    twitter: { card: "summary", title, description: frontmatter.description },
  };
}

function clean<T>(value: T): T {
  return JSON.parse(JSON.stringify(value, (_, v) => (v === undefined ? undefined : v))) as T;
}

function buildJsonLd(post: Post): string {
  const { frontmatter } = post;
  const url = frontmatter.canonical || articleUrl(post);

  const graph: Record<string, unknown>[] = [
    clean({
      "@type": "BlogPosting",
      headline: frontmatter.title,
      description: frontmatter.description,
      url,
      datePublished: frontmatter.date,
      dateModified: frontmatter.dateModified,
      inLanguage: "fr",
      ...(frontmatter.authorName
        ? {
            author: {
              "@type": "Person",
              name: frontmatter.authorName,
            },
          }
        : {}),
      publisher: {
        "@type": "Organization",
        name: "Bizko",
        logo: {
          "@type": "ImageObject",
          url: "https://bizko.pro/apple-touch-icon.png",
        },
      },
      mainEntityOfPage: url,
    }),
    clean({
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: "https://bizko.pro" },
        { "@type": "ListItem", position: 2, name: "Blog", item: "https://bizko.pro/blog" },
        { "@type": "ListItem", position: 3, name: frontmatter.title, item: url },
      ],
    }),
  ];

  if (frontmatter.faq && frontmatter.faq.length > 0) {
    graph.push(
      clean({
        "@type": "FAQPage",
        mainEntity: frontmatter.faq.map((item, index) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a, url: `${url}#faq-${index}` },
        })),
      }),
    );
  }

  return compactJsonLd({
    "@context": "https://schema.org",
    "@graph": graph,
  });
}

function authorInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function relatedPosts(post: Post): Post[] {
  const slugs = post.frontmatter.related ?? [];
  if (slugs.length > 0) {
    return slugs
      .map((slug) => getPost(slug, "fr"))
      .filter(
        (item): item is Post =>
          item !== null && item.frontmatter.published && item.slug !== post.slug
      )
      .slice(0, 2);
  }
  return listPosts("fr", true)
    .filter((item) => item.slug !== post.slug)
    .slice(0, 2);
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug, "fr");
  if (!post) notFound();

  const { frontmatter } = post;
  const mod = (await import(`@content/blog/${post.file}`)) as {
    default: ComponentType;
    frontmatter?: PostFrontmatter;
  };
  const PostContent = mod.default;
  const toc = extractToc(post.content);
  const related = relatedPosts(post);
  const authorName = frontmatter.authorName || "L'équipe Bizko";
  const typeLabel = POST_TYPE_LABEL[frontmatter.type];

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildJsonLd(post) }}
      />
      <BlogMasthead />

      <main>
        <div className="mx-auto max-w-4xl px-6">
          <nav
            aria-label="Fil d'ariane"
            className="flex items-center gap-2 py-8 text-sm text-gray-500"
          >
            <Link href="/" className="transition-colors hover:text-accent">
              Accueil
            </Link>
            <span aria-hidden="true" className="text-gray-300">
              /
            </span>
            <Link href="/blog" className="transition-colors hover:text-accent">
              Blog
            </Link>
            <span aria-hidden="true" className="text-gray-300">
              /
            </span>
            <span className="truncate text-gray-700">{frontmatter.title}</span>
          </nav>

          <div className="relative aspect-[21/9] overflow-hidden rounded-3xl">
            <BlogBanner
              seed={post.slug}
              label={typeLabel}
              cover={frontmatter.cover}
              className="size-full"
            />
          </div>

          <header className="mt-10">
            {frontmatter.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {frontmatter.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-accent"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">
              {frontmatter.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-gray-600">{frontmatter.description}</p>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-border py-5">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                  {authorInitials(authorName)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{authorName}</p>
                  <p className="flex items-center gap-1.5 text-xs text-gray-500">
                    <time dateTime={frontmatter.date}>{formatDate(frontmatter.date)}</time>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {readingTime(post.content)} min de lecture
                    </span>
                  </p>
                </div>
              </div>
              <ShareButton />
            </div>
          </header>

          {toc.length > 0 && (
            <nav
              aria-label="Sommaire"
              className="mt-10 rounded-2xl border border-border bg-muted/60 p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                Sommaire
              </p>
              <ul className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {toc.map((entry) => (
                  <li key={entry.id}>
                    <a
                      href={`#${entry.id}`}
                      className={`text-sm text-gray-700 transition-colors hover:text-accent ${
                        entry.depth === 3 ? "pl-4 text-gray-500" : ""
                      }`}
                    >
                      {entry.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div className="prose prose-lg mt-12 max-w-none prose-headings:tracking-tight prose-headings:text-gray-900 prose-a:text-accent prose-a:underline prose-a:underline-offset-4 prose-strong:text-gray-900 prose-blockquote:border-accent/40">
            <PostContent />
          </div>

          {frontmatter.faq && frontmatter.faq.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
                Questions fréquentes
              </h2>
              <div className="mt-6 space-y-4">
                {frontmatter.faq.map((item, index) => (
                  <div key={index} id={`faq-${index}`} className="rounded-2xl border border-border p-6">
                    <h3 className="flex gap-3 text-lg font-semibold tracking-tight text-gray-900">
                      <span className="font-mono text-sm font-medium text-accent">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {item.q}
                    </h3>
                    <p className="mt-2 pl-8 leading-relaxed text-gray-600">{item.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {frontmatter.sources && frontmatter.sources.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-semibold tracking-tight text-gray-900">Sources</h2>
              <ol className="mt-4 space-y-2.5">
                {frontmatter.sources.map((source, index) => (
                  <li key={index} className="flex items-baseline gap-3">
                    <span className="font-mono text-xs text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-gray-700 transition-colors hover:text-accent"
                    >
                      {source.label}
                      <ExternalLink className="size-3.5 shrink-0" />
                    </a>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <div className="mt-16 flex items-center gap-4 rounded-2xl border border-border bg-muted/60 p-6">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-base font-semibold text-white">
              {authorInitials(authorName)}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{authorName}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-gray-600">
                {frontmatter.authorName
                  ? "Rédaction du blog Bizko."
                  : "Bizko aide les indépendants à présenter services, prix et portfolio en un lien."}
              </p>
            </div>
          </div>

          <p className="mt-10 text-xs text-gray-400">{frontmatter.canonical || articleUrl(post)}</p>
        </div>

        {related.length > 0 && (
          <section className="mx-auto mt-16 max-w-6xl border-t border-border px-6 py-12">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">À lire aussi</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {related.map((item) => (
                <PostCard key={item.slug} post={item} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:translate-x-1"
              >
                Tous les articles
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </section>
        )}
      </main>
    </article>
  );
}