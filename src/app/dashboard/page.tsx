import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "./DashboardClient";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/onboarding");

  const [{ data: services }, { data: portfolio }, { data: socials }, statsRes] = await Promise.all([
    supabase.from("services").select("*").eq("profile_id", profile.id).order("position"),
    supabase.from("portfolio_items").select("*").eq("profile_id", profile.id).order("position"),
    supabase.from("social_links").select("*").eq("profile_id", profile.id).order("position"),
    supabase.from("profile_stats").select("views, clicks").eq("profile_id", profile.id).maybeSingle(),
  ]);

  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/${profile.username}`;
  const views = statsRes.data?.views ?? 0;
  const waClicks = statsRes.data?.clicks ?? 0;

  return (
    <DashboardClient
      profile={profile}
      services={services || []}
      portfolio={portfolio || []}
      socials={socials || []}
      views={views}
      waClicks={waClicks}
      publicUrl={publicUrl}
      error={error}
    />
  );
}
