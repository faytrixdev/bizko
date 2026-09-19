"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getPartnerOverview } from "@/lib/partner/queries";
import { MIN_PAYOUT_AMOUNT, DEFAULT_COMMISSION_RATE } from "@/lib/partner/commissions";

export async function requestPayout(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_partner, partner_code, commission_rate")
    .eq("id", user.id)
    .single();

  if (!profile?.is_partner) return { error: "not_partner" as const };

  const amount = Number(formData.get("amount"));
  const method = String(formData.get("method") ?? "").trim();
  const account_identifier = String(formData.get("account_identifier") ?? "").trim();
  const account_holder = String(formData.get("account_holder") ?? "").trim() || null;
  const details = String(formData.get("details") ?? "").trim() || null;

  if (!Number.isInteger(amount) || amount < MIN_PAYOUT_AMOUNT) return { error: "below_minimum" as const };
  if (!method || !account_identifier) return { error: "incomplete" as const };

  const overview = await getPartnerOverview(
    user.id,
    profile.partner_code!,
    profile.commission_rate ?? DEFAULT_COMMISSION_RATE,
  );
  if (amount > overview.availableBalance) return { error: "insufficient_balance" as const };

  const { error } = await supabase.from("payouts").insert({
    partner_id: user.id,
    amount,
    method,
    account_identifier,
    account_holder,
    details,
  });
  if (error) return { error: "failed" as const };

  revalidatePath("/dashboard/partner");
  return { ok: true as const };
}
