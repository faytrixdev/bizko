import type { MetadataRoute } from "next";

const BASE_URL = "https://bizko.me";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${BASE_URL}/signup`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${BASE_URL}/demo`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${BASE_URL}/cgu`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.2 },
    { url: `${BASE_URL}/politique-de-confidentialite`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.2 },
  ];

  return staticPages;
}
