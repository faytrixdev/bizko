import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isProPlan, getSwitchGraceInfo } from "@/lib/plans";
import { DashboardClient } from "./DashboardClient";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Colonnes explicites : `select("*")` échoue avec un 42501 depuis la migration
  // 20260923000008, qui retire is_admin/commission_rate des droits SELECT. Le
  // profile revenait null, la page partait en `redirect("/onboarding")` et le
  // client rendait un écran vide au lieu de suivre la redirection.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, display_name, tagline, bio, city, country, phone_e164, email_public, template, locale, avatar_url, is_partner, partner_code")
    .eq("id", user.id)
    .single();

  if (profileError) {
    throw new Error(`dashboard: profil illisible (${profileError.code})`, { cause: profileError });
  }

  if (!profile) redirect("/onboarding");

  const [
    { data: services },
    { data: portfolio },
    { data: socials },
    { data: testimonials },
    subRes,
  ] = await Promise.all([
    supabase.from("services").select("*").eq("profile_id", profile.id).order("position"),
    supabase.from("portfolio_items").select("*").eq("profile_id", profile.id).order("position"),
    supabase.from("social_links").select("*").eq("profile_id", profile.id).order("position"),
    supabase.from("testimonials").select("*").eq("profile_id", profile.id).order("created_at", { ascending: false }),
    supabase.from("subscriptions").select("*").eq("profile_id", profile.id).maybeSingle(),
  ]);

  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/${profile.username}`;

  const sub = subRes.data && !Array.isArray(subRes.data)
    ? subRes.data as { plan: string; status: string; pending_interval?: string | null; pending_effective_at?: string | null } | null
    : null;
  const isPro = isProPlan(sub?.plan, sub?.status);

  const grace = getSwitchGraceInfo(sub?.pending_interval, sub?.pending_effective_at);
  const pendingInterval: "monthly" | "yearly" | null =
    sub?.pending_interval === "monthly" || sub?.pending_interval === "yearly" ? sub.pending_interval : null;

  return (
    <DashboardClient
      profile={profile}
      services={services || []}
      portfolio={portfolio || []}
      socials={socials || []}
      testimonials={testimonials || []}
      publicUrl={publicUrl}
      isPro={isPro}
      pendingInterval={pendingInterval}
      graceActive={grace.active}
      graceEnd={grace.end}
    />
  );
}
