import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { ComponentType } from "react";
import {
  getPost,
  listPostFiles,
  articleUrl,
  articleMarkdownUrl,
  formatDate,
  compactJsonLd,
  type PostFrontmatter,
} from "@/lib/blog/posts";

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

function buildJsonLd(post: NonNullable<ReturnType<typeof getPost>>): string {
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
  const url = frontmatter.canonical || articleUrl(post);

  const related = frontmatter.related
    .map((relatedSlug) => getPost(relatedSlug, "fr"))
    .filter((item): item is NonNullable<typeof item> => item !== null && item.frontmatter.published);

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildJsonLd(post) }}
      />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <nav className="text-sm text-gray-500">
          <Link href="/" className="hover:underline">
            Accueil
          </Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:underline">
            Blog
          </Link>
        </nav>

        <header className="mt-6">
          {frontmatter.tags.length > 0 && (
            <p className="text-sm font-medium text-accent">{frontmatter.tags.join(" · ")}</p>
          )}
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">{frontmatter.title}</h1>
          <p className="mt-4 text-lg text-gray-600">{frontmatter.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
            {frontmatter.authorName && <span>{frontmatter.authorName}</span>}
            {frontmatter.authorName && <span aria-hidden="true">·</span>}
            <time dateTime={frontmatter.date}>{formatDate(frontmatter.date)}</time>
          </div>
        </header>

        <div className="prose prose-lg mt-10 max-w-none prose-headings:tracking-tight prose-a:text-accent">
          <PostContent />
        </div>

        {frontmatter.faq && frontmatter.faq.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-semibold tracking-tight">Questions fréquentes</h2>
            {frontmatter.faq.map((item, index) => (
              <div key={index} id={`faq-${index}`} className="mt-6">
                <h3 className="text-lg font-medium">{item.q}</h3>
                <p className="mt-2 text-gray-600">{item.a}</p>
              </div>
            ))}
          </section>
        )}

        {frontmatter.sources && frontmatter.sources.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold tracking-tight">Sources</h2>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              {frontmatter.sources.map((source, index) => (
                <li key={index}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-16 border-t border-border pt-8">
            <h2 className="text-xl font-semibold tracking-tight">À lire aussi</h2>
            <ul className="mt-4 space-y-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link href={`/blog/${item.slug}`} className="font-medium text-accent hover:underline">
                    {item.frontmatter.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-16 text-sm text-gray-500">
          {url}
        </p>
      </main>
    </article>
  );
}