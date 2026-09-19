import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { isProSubscription, getSwitchGraceInfo, type BillingInterval } from "@/lib/plans";
import { resolveChariowInterval } from "@/lib/chariow";
import { getMembership, listMembershipPayments, findMembershipByCheckout, isYearlyProPlanConfigured, type WhopMembership, type WhopPayment } from "@/lib/whop";
import { SubscriptionClient } from "./SubscriptionClient";
import { PartnerProCard } from "./PartnerProCard";

export const dynamic = "force-dynamic";

async function latestCheckoutId(supabase: Awaited<ReturnType<typeof createClient>>, profileId: string): Promise<string | null> {
  const { data } = await supabase
    .from("pro_checkouts")
    .select("checkout_configuration_id")
    .eq("profile_id", profileId)
    .eq("provider", "whop")
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

  const { data: profile } = await supabase.from("profiles").select("id, is_partner").eq("id", user.id).single();
  if (!profile) redirect("/onboarding");

  if (profile.is_partner) {
    return <PartnerProCard />;
  }

  const { data: subRes } = await supabase
    .from("subscriptions")
    .select("whop_membership_id, plan, status, provider, current_period_end, chariow_product_id, pending_interval, pending_effective_at")
    .eq("profile_id", user.id)
    .maybeSingle();

  const sub = subRes && !Array.isArray(subRes)
    ? subRes as { whop_membership_id?: string | null; plan: string; status: string; provider?: string | null; current_period_end?: string | null; chariow_product_id?: string | null; pending_interval?: string | null; pending_effective_at?: string | null }
    : null;

  // Chariow rows are time-limited licenses: Pro access only holds while the
  // locally-computed period is in the future (mirrors the is_pro RPC).
  const provider = sub?.provider === "chariow" ? "chariow" : "whop";
  const chariowInterval: BillingInterval | null =
    provider === "chariow" ? resolveChariowInterval(sub?.chariow_product_id ?? null) : null;

  // During a deferred switch grace window the old membership has lapsed
  // (status canceled) but access is retained, so keep the Pro UI alive.
  const grace = getSwitchGraceInfo(sub?.pending_interval, sub?.pending_effective_at);
  const isPro = grace.active || isProSubscription(sub);

  let membership: WhopMembership | null = null;
  let payments: WhopPayment[] = [];
  let error: string | null = null;

  try {
    // The Whop API only tracks Whop memberships; a Chariow license has no
    // membership row to fetch (and no payment history to list).
    if (provider === "whop" && isPro && sub?.whop_membership_id) {
      membership = await getMembership(sub.whop_membership_id);
      payments = await listMembershipPayments(sub.whop_membership_id);
    } else if (provider === "whop" && isPro) {
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

  // "Missing membership" is a Whop-only failure mode. A Chariow row that
  // passes isProSubscription always has its license data on the row itself.
  const missingMembership = provider === "whop" && isPro && !membership;

  return (
    <SubscriptionClient
      isPro={isPro}
      provider={provider}
      missingMembership={missingMembership}
      membership={membership}
      chariowInterval={chariowInterval}
      chariowPeriodEnd={sub?.current_period_end ?? null}
      payments={payments}
      error={error}
      yearlyAvailable={isYearlyProPlanConfigured()}
      retryHref="/dashboard/subscription"
      pendingInterval={sub?.pending_interval ?? null}
      pendingEffectiveAt={sub?.pending_effective_at ?? null}
      graceActive={grace.active}
    />
  );
}
