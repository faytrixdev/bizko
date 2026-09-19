"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { DEFAULT_COMMISSION_RATE } from "@/lib/partner/commissions";
import { pickCommissionsFifo } from "@/lib/partner/commissions";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/dashboard");
  return { supabase, admin: createAdminClient() };
}

function generatePartnerCode(username: string): string {
  const base = username.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}${suffix}`;
}

export async function activatePartner(formData: FormData) {
  const { admin } = await requireAdmin();
  const userId = String(formData.get("userId"));
  const rateRaw = formData.get("rate");
  const rate = Math.min(100, Math.max(1, parseInt(String(rateRaw ?? DEFAULT_COMMISSION_RATE), 10) || DEFAULT_COMMISSION_RATE));

  const { data: target } = await admin
    .from("profiles")
    .select("id, username, is_partner, partner_code")
    .eq("id", userId)
    .single();
  if (!target) return { error: "not_found" as const };

  let partnerCode = target.partner_code;
  if (!partnerCode) {
    for (let attempt = 0; attempt < 3; attempt++) {
      partnerCode = generatePartnerCode(target.username ?? userId.slice(0, 8));
      const { error: uniqErr } = await admin
        .from("profiles")
        .update({ partner_code: partnerCode })
        .eq("id", userId);
      if (!uniqErr) break;
      if (attempt === 2) return { error: "code_conflict" as const };
    }
  }

  await admin
    .from("profiles")
    .update({ is_partner: true, partner_code: partnerCode, commission_rate: rate })
    .eq("id", userId);

  revalidatePath("/admin/partners");
  return { ok: true as const };
}

export async function deactivatePartner(formData: FormData) {
  const { admin } = await requireAdmin();
  const userId = String(formData.get("userId"));
  await admin.from("profiles").update({ is_partner: false }).eq("id", userId);
  revalidatePath("/admin/partners");
  return { ok: true as const };
}

export async function setCommissionRate(formData: FormData) {
  const { admin } = await requireAdmin();
  const userId = String(formData.get("userId"));
  const rate = Math.min(100, Math.max(1, parseInt(String(formData.get("rate") ?? DEFAULT_COMMISSION_RATE), 10) || DEFAULT_COMMISSION_RATE));
  await admin.from("profiles").update({ commission_rate: rate }).eq("id", userId);
  revalidatePath("/admin/partners");
  return { ok: true as const };
}

export async function markPayoutPaid(formData: FormData) {
  const { admin } = await requireAdmin();
  const payoutId = String(formData.get("payoutId"));

  const { data: payout } = await admin
    .from("payouts")
    .select("id, partner_id, amount, status")
    .eq("id", payoutId)
    .single();
  if (!payout || payout.status !== "pending") return { error: "invalid" as const };

  const { data: commissions } = await admin
    .from("commissions")
    .select("id, amount, status, created_at")
    .eq("partner_id", payout.partner_id)
    .eq("status", "approved")
    .order("created_at", { ascending: true });

  const picked = pickCommissionsFifo(commissions ?? [], payout.amount);
  if (!picked.length) return { error: "sum_mismatch" as const };

  const pickedIds = picked.map((c) => c.id);
  await admin
    .from("commissions")
    .update({ status: "paid", payout_id: payoutId })
    .in("id", pickedIds);

  await admin
    .from("payouts")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", payoutId);

  revalidatePath("/admin/partners");
  return { ok: true as const };
}

export async function rejectPayout(formData: FormData) {
  const { admin } = await requireAdmin();
  const payoutId = String(formData.get("payoutId"));
  await admin.from("payouts").update({ status: "rejected" }).eq("id", payoutId).eq("status", "pending");
  revalidatePath("/admin/partners");
  return { ok: true as const };
}
