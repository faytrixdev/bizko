export type TocEntry = { id: string; text: string; depth: 2 | 3 };

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function readingTime(content: string): number {
  if (!content.trim()) return 1;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function cleanHeading(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*|__/g, "")
    .replace(/[*`]/g, "")
    .trim();
}

export function extractToc(content: string): TocEntry[] {
  const entries: TocEntry[] = [];
  for (const line of content.split("\n")) {
    const match = /^(#{2,3})\s+(.+)$/.exec(line);
    if (!match) continue;
    const depth = match[1].length === 2 ? 2 : 3;
    const text = cleanHeading(match[2]);
    if (!text) continue;
    entries.push({ id: slugify(text), text, depth });
  }
  return entries;
}