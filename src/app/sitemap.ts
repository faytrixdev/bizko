import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public-client";

const BASE_URL = "https://bizko.pro";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/signup`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/demo`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/legal/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/legal/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];

  const supabase = createPublicClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("username, updated_at")
    .eq("is_public", true);

  const profilePages: MetadataRoute.Sitemap = (profiles ?? []).map((p) => ({
    url: `${BASE_URL}/${p.username}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticPages, ...profilePages];
}
