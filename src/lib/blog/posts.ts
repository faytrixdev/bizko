import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type PostType = "stats" | "foundational" | "comparison" | "tool" | "lead";

export type PostFaq = { q: string; a: string };

export type PostSource = { label: string; url: string };

export type PostFrontmatter = {
  title: string;
  description: string;
  date: string;
  dateModified: string;
  authorName: string;
  type: PostType;
  tags: string[];
  published: boolean;
  canonical?: string;
  cover?: string;
  related: string[];
  faq?: PostFaq[];
  sources?: PostSource[];
};

export type Post = {
  slug: string;
  locale: string;
  file: string;
  frontmatter: PostFrontmatter;
  content: string;
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const FILE_RE = /\.(mdx|md)$/;
const LOCALE_SEGMENT_RE = /^(.+)\.([a-z]{2})$/;

export function listPostFiles(locale = "fr"): { slug: string; locale: string; file: string }[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => FILE_RE.test(file) && !file.startsWith("."))
    .sort()
    .map((file) => {
      const base = file.replace(FILE_RE, "");
      const match = base.match(LOCALE_SEGMENT_RE);
      const slug = match && match[2] !== "fr" ? base : match ? match[1] : base;
      const fileLocale = match ? match[2] : "fr";
      return { slug, locale: fileLocale, file };
    })
    .filter((entry) => entry.locale === locale);
}

function normalizeFrontmatter(data: Record<string, unknown>): PostFrontmatter {
  return {
    title: typeof data.title === "string" ? data.title : "Sans titre",
    description: typeof data.description === "string" ? data.description : "",
    date: typeof data.date === "string" ? data.date : "",
    dateModified: typeof data.dateModified === "string" ? data.dateModified : (typeof data.date === "string" ? data.date : ""),
    authorName: typeof data.authorName === "string" ? data.authorName : "",
    type: (typeof data.type === "string" ? data.type : "foundational") as PostType,
    tags: Array.isArray(data.tags) ? data.tags.map((t) => String(t)) : [],
    published: data.published === true,
    canonical: typeof data.canonical === "string" ? data.canonical : undefined,
    cover: typeof data.cover === "string" ? data.cover : undefined,
    related: Array.isArray(data.related) ? data.related.map((r) => String(r)) : [],
    faq: Array.isArray(data.faq)
      ? data.faq.map((item) => {
          const entry = item as Record<string, unknown>;
          return { q: String(entry.q ?? ""), a: String(entry.a ?? "") };
        })
      : undefined,
    sources: Array.isArray(data.sources)
      ? data.sources.map((item) => {
          const entry = item as Record<string, unknown>;
          return { label: String(entry.label ?? ""), url: String(entry.url ?? "") };
        })
      : undefined,
  };
}

export function getPost(slug: string, locale = "fr"): Post | null {
  const file = listPostFiles(locale).find((entry) => entry.slug === slug);
  if (!file) return null;
  const raw = fs.readFileSync(path.join(BLOG_DIR, file.file), "utf8");
  const { data, content } = matter(raw);
  return {
    slug,
    locale,
    file: file.file,
    frontmatter: normalizeFrontmatter(data as Record<string, unknown>),
    content,
  };
}

export function listPosts(locale = "fr", publishedOnly = false): Post[] {
  return listPostFiles(locale)
    .map((entry) => getPost(entry.slug, locale))
    .filter((post): post is Post => post !== null)
    .filter((post) => !publishedOnly || post.frontmatter.published)
    .sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1));
}

export function articleUrl(post: Pick<Post, "slug">): string {
  return `https://bizko.pro/blog/${post.slug}`;
}

export function articleMarkdownUrl(post: Pick<Post, "slug">): string {
  return `https://bizko.pro/blog/${post.slug}/markdown.md`;
}

export function formatDate(date: string): string {
  if (!date) return "";
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

export function compactJsonLd<T>(value: T): string {
  return JSON.stringify(value, (_, v) => (v === undefined ? undefined : v)); 
}