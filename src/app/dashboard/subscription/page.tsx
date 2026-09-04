import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { getMembership, listMembershipPayments, findMembershipByCheckout, type WhopMembership, type WhopPayment } from "@/lib/whop";
import { SubscriptionClient } from "./SubscriptionClient";

export const dynamic = "force-dynamic";

async function latestCheckoutId(supabase: Awaited<ReturnType<typeof createClient>>, profileId: string): Promise<string | null> {
  const { data } = await supabase
    .from("pro_checkouts")
    .select("checkout_configuration_id")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.checkout_configuration_id ?? null;
}

async function persistResolvedMembership(
  profileId: string,
  membership: WhopMembership,
) {
  const admin = createAdminClient();
  await admin
    .from("subscriptions")
    .update({
      whop_membership_id: membership.id,
      status: membership.status ?? "active",
      current_period_end: membership.current_period_end ?? null,
      cancel_at_period_end: membership.cancel_at_period_end ?? false,
    })
    .eq("profile_id", profileId);
}

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

  let membership: WhopMembership | null = null;
  let payments: WhopPayment[] = [];
  let error: string | null = null;

  try {
    if (isPro && sub?.whop_membership_id) {
      membership = await getMembership(sub.whop_membership_id);
      payments = await listMembershipPayments(sub.whop_membership_id);
    } else if (isPro) {
      // Self-heal: the webhook may not have recorded the membership id yet.
      // Resolve it from the checkout configuration we stored at checkout start.
      const checkoutId = await latestCheckoutId(supabase, user.id);
      if (checkoutId) {
        const resolved = await findMembershipByCheckout(checkoutId);
        if (resolved) {
          await persistResolvedMembership(user.id, resolved);
          membership = await getMembership(resolved.id);
          if (membership.id) {
            payments = await listMembershipPayments(membership.id);
          }
        }
      }
    }
  } catch (e) {
    console.error("[subscription] Whop fetch failed:", e);
    error = "unavailable";
  }

  const missingMembership = isPro && !membership;

  return (
    <SubscriptionClient
      isPro={isPro}
      missingMembership={missingMembership}
      membership={membership}
      payments={payments}
      error={error}
      retryHref="/dashboard/subscription"
    />
  );
}
