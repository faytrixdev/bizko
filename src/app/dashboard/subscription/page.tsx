import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getMembership, listMembershipPayments, type WhopPayment } from "@/lib/whop";
import { SubscriptionClient } from "./SubscriptionClient";

export const dynamic = "force-dynamic";

export default async function SubscriptionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();
  if (!profile) redirect("/onboarding");

  const { data: subRes } = await supabase
    .from("subscriptions")
    .select("whop_membership_id, plan, status")
    .eq("profile_id", user.id)
    .maybeSingle();

  const sub = subRes && !Array.isArray(subRes)
    ? subRes as { whop_membership_id?: string | null; plan: string; status: string }
    : null;

  const isPro = sub?.plan === "pro" && (sub.status === "active" || sub.status === "trialing");

  let membership = null;
  let payments: WhopPayment[] = [];
  let error: string | null = null;

  if (isPro && sub?.whop_membership_id) {
    try {
      membership = await getMembership(sub.whop_membership_id);
      payments = await listMembershipPayments(sub.whop_membership_id);
    } catch (e) {
      console.error("[subscription] Whop fetch failed:", e);
      error = "unavailable";
    }
  }

  return (
    <SubscriptionClient
      isPro={isPro}
      membership={membership}
      payments={payments}
      error={error}
      retryHref="/dashboard/subscription"
    />
  );
}
