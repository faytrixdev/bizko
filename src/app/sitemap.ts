import type { MetadataRoute } from "next";

const BASE_URL = "https://bizko.me";
const LAST_MODIFIED = new Date("2026-08-28");

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: BASE_URL, lastModified: LAST_MODIFIED, changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${BASE_URL}/login`, lastModified: LAST_MODIFIED, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${BASE_URL}/signup`, lastModified: LAST_MODIFIED, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${BASE_URL}/demo`, lastModified: LAST_MODIFIED, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${BASE_URL}/legal/terms`, lastModified: LAST_MODIFIED, changeFrequency: "yearly" as const, priority: 0.2 },
    { url: `${BASE_URL}/legal/privacy`, lastModified: LAST_MODIFIED, changeFrequency: "yearly" as const, priority: 0.2 },
  ];

  return staticPages;
}
