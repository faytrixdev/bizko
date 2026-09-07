import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isProPlan } from "@/lib/plans";
import { OnboardingClient } from "./OnboardingClient";

export default async function Onboarding() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Profile may not exist yet (this is the onboarding form) but the
  // subscription row is keyed on auth.users(id), so we can read the plan
  // before the profile is created.
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("profile_id", user.id)
    .maybeSingle();

  const plan = sub && !Array.isArray(sub) ? (sub as { plan: string; status: string } | null) : null;
  const isPro = isProPlan(plan?.plan, plan?.status);

  return <OnboardingClient isPro={isPro} userId={user.id} />;
}