import { unstable_cache } from "next/cache";
import { createPublicClient } from "./public-client";
import type { PortfolioItem, Profile, Service, SocialLink } from "@/types/database";

export const PUBLIC_PROFILES_TAG = "public-profiles";

export type PublicTestimonial = {
  id: string;
  authorName: string;
  authorRole: string | null;
  content: string;
  rating: number | null;
  createdAt: string;
};

export interface PublicProfileData {
  profile: Profile;
  services: Service[];
  portfolio: PortfolioItem[];
  socials: SocialLink[];
  testimonials: PublicTestimonial[];
}

type TestimonialRow = {
  id: string;
  author_name: string;
  author_role: string | null;
  content: string;
  rating: number | null;
  created_at: string;
};

async function fetchPublicProfileData(
  username: string
): Promise<PublicProfileData | null> {
  const supabase = createPublicClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .eq("is_public", true)
    .single();

  if (!profile) return null;

  const [{ data: services }, { data: portfolio }, { data: socials }, { data: rows }] =
    await Promise.all([
      supabase.from("services").select("*").eq("profile_id", profile.id).order("position"),
      supabase.from("portfolio_items").select("*").eq("profile_id", profile.id).order("position"),
      supabase.from("social_links").select("*").eq("profile_id", profile.id).order("position"),
      supabase
        .from("testimonials")
        .select("id, author_name, author_role, content, rating, created_at")
        .eq("profile_id", profile.id)
        .eq("is_published", true)
        .order("created_at", { ascending: false }),
    ]);

  const testimonials = ((rows ?? []) as TestimonialRow[]).map((r) => ({
    id: r.id,
    authorName: r.author_name,
    authorRole: r.author_role,
    content: r.content,
    rating: r.rating,
    createdAt: r.created_at,
  }));

  return {
    profile,
    services: services ?? [],
    portfolio: portfolio ?? [],
    socials: socials ?? [],
    testimonials,
  };
}

export const getCachedPublicProfileData = unstable_cache(
  fetchPublicProfileData,
  ["public-profile"],
  { revalidate: 60, tags: [PUBLIC_PROFILES_TAG] }
);

export type ExploreFilters = {
  q?: string;
  city?: string;
  category?: string;
  country?: string;
  page?: number;
};

export type ExploreResult = {
  id: string;
  username: string;
  displayName: string;
  tagline: string;
  avatarUrl: string | null;
  city: string;
  country: string;
  category: string | null;
  template: string;
  isPro: boolean;
};

export type ExplorePage = { items: ExploreResult[]; total: number };

export const EXPLORE_PAGE_SIZE = 24;

export type ExploreRow = {
  id: string;
  username: string;
  display_name: string;
  tagline: string;
  avatar_url: string | null;
  city: string;
  country: string;
  category: string | null;
  template: string;
  is_pro: boolean;
  total: number;
};

export function mapExploreRow(row: ExploreRow): ExploreResult {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    tagline: row.tagline,
    avatarUrl: row.avatar_url,
    city: row.city,
    country: row.country,
    category: row.category,
    template: row.template,
    isPro: row.is_pro,
  };
}

export async function searchExplore(filters: ExploreFilters): Promise<ExplorePage> {
  const page = Math.max(1, filters.page ?? 1);
  const safe = {
    q: filters.q?.trim() || null,
    city: filters.city?.trim() || null,
    category: filters.category?.trim() || null,
    country: filters.country?.trim() || null,
  };
  const { data, error } = await createPublicClient().rpc("search_public_profiles", {
    p_query: safe.q,
    p_city: safe.city,
    p_category: safe.category,
    p_country: safe.country,
    p_limit: EXPLORE_PAGE_SIZE,
    p_offset: (page - 1) * EXPLORE_PAGE_SIZE,
  });
  if (error) throw error;
  const rows = (data ?? []) as unknown as ExploreRow[];
  return { items: rows.map(mapExploreRow), total: rows[0]?.total ?? 0 };
}