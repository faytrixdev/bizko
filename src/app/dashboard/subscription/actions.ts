"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cancelMembership, uncancelMembership } from "@/lib/whop";

async function resolveMembershipId(supabase: Awaited<ReturnType<typeof createClient>>): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("whop_membership_id")
    .eq("profile_id", user.id)
    .maybeSingle();
  const id = sub && !Array.isArray(sub) ? (sub as { whop_membership_id?: string | null }).whop_membership_id : null;
  return id ?? null;
}

export async function cancelSubscriptionAction() {
  const supabase = await createClient();
  const membershipId = await resolveMembershipId(supabase);
  if (!membershipId) redirect("/dashboard/subscription?error=generic");

  let failed = false;
  try {
    await cancelMembership(membershipId, "at_period_end");
  } catch (err) {
    console.error("[subscription] cancel failed:", err);
    failed = true;
  }
  if (failed) redirect("/dashboard/subscription?error=generic");
  revalidatePath("/dashboard/subscription");
  redirect("/dashboard/subscription?success=canceled");
}

export async function reactivateSubscriptionAction() {
  const supabase = await createClient();
  const membershipId = await resolveMembershipId(supabase);
  if (!membershipId) redirect("/dashboard/subscription?error=generic");

  let failed = false;
  try {
    await uncancelMembership(membershipId);
  } catch (err) {
    console.error("[subscription] reactivate failed:", err);
    failed = true;
  }
  if (failed) redirect("/dashboard/subscription?error=generic");
  revalidatePath("/dashboard/subscription");
  redirect("/dashboard/subscription?success=reactivated");
}
