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

  // partner_code/commission_rate ne sont plus lisibles via PostgREST
  // (liste blanche de colonnes, migration 20260923000008) : RPC dédiée.
  const { data: partner } = await supabase.rpc("get_my_partner_profile");
  const partnerInfo = partner as {
    is_partner: boolean;
    partner_code: string | null;
    commission_rate: number | null;
  } | null;

  if (!partnerInfo?.is_partner) return { error: "not_partner" as const };

  const amount = Number(formData.get("amount"));
  const method = String(formData.get("method") ?? "").trim();
  const account_identifier = String(formData.get("account_identifier") ?? "").trim();
  const account_holder = String(formData.get("account_holder") ?? "").trim() || null;
  const details = String(formData.get("details") ?? "").trim() || null;

  if (!Number.isInteger(amount) || amount < MIN_PAYOUT_AMOUNT) return { error: "below_minimum" as const };
  if (!method || !account_identifier) return { error: "incomplete" as const };

  // Pré-contrôle UX uniquement ; le vrai invariant est garanti en base par
  // request_payout() (migration 20260923000004).
  const overview = await getPartnerOverview(
    user.id,
    partnerInfo.partner_code!,
    partnerInfo.commission_rate ?? DEFAULT_COMMISSION_RATE,
  );
  if (amount > overview.availableBalance) return { error: "insufficient_balance" as const };

  // Insertion directe révoquée : la demande passe par la RPC qui recalcule
  // le solde disponible dans la même transaction.
  const { error } = await supabase.rpc("request_payout", {
    p_amount: amount,
    p_method: method,
    p_account_identifier: account_identifier,
    p_account_holder: account_holder,
    p_details: details,
  });
  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("insufficient_balance")) return { error: "insufficient_balance" as const };
    if (msg.includes("below_minimum")) return { error: "below_minimum" as const };
    if (msg.includes("incomplete")) return { error: "incomplete" as const };
    if (msg.includes("not_partner")) return { error: "not_partner" as const };
    return { error: "failed" as const };
  }

  revalidatePath("/dashboard/partner");
  return { ok: true as const };
}
