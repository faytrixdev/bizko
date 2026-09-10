import { getPost, listPostFiles } from "@/lib/blog/posts";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-static";

export function generateStaticParams() {
  return listPostFiles("fr").map(({ slug }) => ({ slug }));
}

export async function GET(_request: Request, { params }: Props) {
  const { slug } = await params;
  const post = getPost(slug, "fr");
  if (!post) {
    return new Response("Not Found", { status: 404 });
  }
  return new Response(post.content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "X-Robots-Tag": "index, follow",
    },
  });
}