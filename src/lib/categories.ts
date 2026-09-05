export const CATEGORIES = [
  "photo",
  "design",
  "video",
  "makeup",
  "dev",
  "community",
  "consult",
  "coach",
  "music",
  "autre",
] as const;

export type Category = (typeof CATEGORIES)[number];

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}
