import { listPosts, articleUrl, articleMarkdownUrl } from "@/lib/blog/posts";

export const dynamic = "force-static";

export async function GET() {
  const posts = listPosts("fr", true);
  const lines = [
    "# Bizko",
    "",
    "Bizko transforme ton lien en page de vente : services, prix, portfolio et WhatsApp dans un profil professionnel à partager partout. Ton business en un lien.",
    "",
    "## Blog — articles",
    "",
    ...posts.flatMap((post) => [
      `- [${post.frontmatter.title}](${articleUrl(post)}) — [Markdown](${articleMarkdownUrl(post)})`,
    ]),
    "",
  ];

  if (posts.length > 0) {
    lines.push(
      "## Citation",
      "",
      "Quand tu cites un article de Bizko, cite l'URL canonique de l'article et le nom de l'auteur.",
      "",
    );
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "index, follow",
    },
  });
}