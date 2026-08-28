import { unstable_cache } from "next/cache";
import { createPublicClient } from "./public-client";
import type { PortfolioItem, Profile, Service, SocialLink } from "@/types/database";

export const PUBLIC_PROFILES_TAG = "public-profiles";

export interface PublicProfileData {
  profile: Profile;
  services: Service[];
  portfolio: PortfolioItem[];
  socials: SocialLink[];
}

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

  const [{ data: services }, { data: portfolio }, { data: socials }] =
    await Promise.all([
      supabase.from("services").select("*").eq("profile_id", profile.id).order("position"),
      supabase.from("portfolio_items").select("*").eq("profile_id", profile.id).order("position"),
      supabase.from("social_links").select("*").eq("profile_id", profile.id).order("position"),
    ]);

  return {
    profile,
    services: services ?? [],
    portfolio: portfolio ?? [],
    socials: socials ?? [],
  };
}

export const getCachedPublicProfileData = unstable_cache(
  fetchPublicProfileData,
  ["public-profile"],
  { revalidate: 60, tags: [PUBLIC_PROFILES_TAG] }
);