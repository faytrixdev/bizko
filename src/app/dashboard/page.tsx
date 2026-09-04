import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isProPlan } from "@/lib/plans";
import { DashboardClient } from "./DashboardClient";
import type { DailyEvent, ClickBucket } from "@/types/analytics";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/onboarding");

  const [
    { data: services },
    { data: portfolio },
    { data: socials },
    statsRes,
    dailyRes,
    breakdownRes,
    subRes,
  ] = await Promise.all([
    supabase.from("services").select("*").eq("profile_id", profile.id).order("position"),
    supabase.from("portfolio_items").select("*").eq("profile_id", profile.id).order("position"),
    supabase.from("social_links").select("*").eq("profile_id", profile.id).order("position"),
    supabase.from("profile_stats").select("views, clicks").eq("profile_id", profile.id).maybeSingle(),
    supabase.rpc("get_daily_events", { p_profile_id: profile.id, p_days: 7 }),
    supabase.rpc("get_profile_clicks_breakdown", { p_profile_id: profile.id, p_days: 7 }),
    supabase.from("subscriptions").select("*").eq("profile_id", profile.id).maybeSingle(),
  ]);

  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/${profile.username}`;
  const views = statsRes.data?.views ?? 0;
  const waClicks = statsRes.data?.clicks ?? 0;

  const daily: DailyEvent[] = (dailyRes.data ?? []) as DailyEvent[];
  const breakdown: ClickBucket[] = (breakdownRes.data ?? []) as ClickBucket[];
  const views7d = daily.reduce((sum, d) => sum + d.views, 0);
  const clicks7d = daily.reduce((sum, d) => sum + d.clicks, 0);

  const sub = subRes.data && !Array.isArray(subRes.data)
    ? subRes.data as { plan: string; status: string } | null
    : null;
  const isPro = isProPlan(sub?.plan, sub?.status);

  return (
    <DashboardClient
      profile={profile}
      services={services || []}
      portfolio={portfolio || []}
      socials={socials || []}
      views={views}
      waClicks={waClicks}
      daily={daily}
      breakdown={breakdown}
      views7d={views7d}
      clicks7d={clicks7d}
      publicUrl={publicUrl}
      isPro={isPro}
    />
  );
}
