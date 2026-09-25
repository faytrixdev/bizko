import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMessages } from "@/lib/i18n/messages";
import { resolveServerLocale } from "@/lib/i18n/messages-server";
import { getCachedPublicProfileData } from "@/lib/supabase/queries";
import { createPublicClient } from "@/lib/supabase/public-client";
import { ProfileView } from "./ProfileView";

type Props = { params: Promise<{ username: string }> };

export async function generateStaticParams() {
  const supabase = createPublicClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("username")
    .eq("is_public", true)
    .order("updated_at", { ascending: false })
    .limit(500);

  return (profiles ?? []).map((p) => ({ username: p.username }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const locale = await resolveServerLocale();
  const msg = getMessages(locale);
  const data = await getCachedPublicProfileData(username);

  if (!data) return { title: `${msg.notFound.title} | Bizko` };

  const { profile, services, portfolio } = data;
  const hasContent = profile.bio?.trim() || services.length > 0 || portfolio.length > 0;

  if (!hasContent) {
    return {
      title: `${profile.display_name} - ${profile.tagline} | Bizko`,
      robots: { index: false, follow: true },
      alternates: {
        canonical: `https://bizko.pro/${profile.username}`,
      },
    };
  }

  const title = `${profile.display_name} - ${profile.tagline} | Bizko`;
  const description =
    profile.bio?.slice(0, 155) ||
    (locale === "en"
      ? `${profile.tagline} in ${profile.city}. ${msg.profile.metaFallback}`
      : `${profile.tagline} a ${profile.city}. ${msg.profile.metaFallback}`);

  return {
    title,
    description,
    alternates: {
      canonical: `https://bizko.pro/${profile.username}`,
    },
    openGraph: {
      title,
      description,
      images: profile.avatar_url ? [{ url: profile.avatar_url }] : undefined,
      url: `https://bizko.pro/${profile.username}`,
      type: "profile",
    },
    twitter: { card: "summary", title, description, images: profile.avatar_url ? [profile.avatar_url] : undefined },
  };
}

export default async function PublicProfile({ params }: Props) {
  const { username } = await params;
  const data = await getCachedPublicProfileData(username);

  if (!data) notFound();

  const locale = await resolveServerLocale();
  const msg = getMessages(locale);

  return <ProfileView {...data} locale={locale} msg={msg} />;
}
