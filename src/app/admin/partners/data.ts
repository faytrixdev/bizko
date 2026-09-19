import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export interface PartnerRow {
  id: string;
  username: string | null;
  display_name: string | null;
  partner_code: string | null;
  commission_rate: number;
  created_at: string;
  referral_count: number;
  payer_count: number;
  commissions_approved: number;
  commissions_pending: number;
  commissions_paid: number;
  payouts_pending: number;
  payouts_paid: number;
}

export interface PendingPayout {
  id: string;
  partner_id: string;
  amount: number;
  method: string;
  account_identifier: string;
  account_holder: string | null;
  details: string | null;
  created_at: string;
  partner_username: string | null;
  partner_display_name: string | null;
}

export interface PartnerAdminData {
  partners: PartnerRow[];
  pendingPayouts: PendingPayout[];
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/dashboard");
  return supabase;
}

export async function getPartnerAdminData(): Promise<PartnerAdminData> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, username, display_name, partner_code, commission_rate, created_at")
    .eq("is_partner", true)
    .order("created_at", { ascending: false });

  const partnerIds = (profiles ?? []).map((p) => p.id);

  const referralCounts = new Map<string, number>();
  const payerCounts = new Map<string, number>();
  const commissionsByPartner = new Map<string, { approved: number; pending: number; paid: number }>();
  const payoutsByPartner = new Map<string, { pending: number; paid: number }>();

  if (partnerIds.length) {
    const { data: referrals } = await admin
      .from("referrals")
      .select("partner_id")
      .in("partner_id", partnerIds);
    for (const r of referrals ?? [])
      referralCounts.set(r.partner_id, (referralCounts.get(r.partner_id) ?? 0) + 1);

    const { data: commissions } = await admin
      .from("commissions")
      .select("partner_id, amount, status")
      .in("partner_id", partnerIds);
    for (const c of commissions ?? []) {
      const cur = commissionsByPartner.get(c.partner_id) ?? { approved: 0, pending: 0, paid: 0 };
      if (c.status === "approved") cur.approved += c.amount;
      else if (c.status === "pending") cur.pending += c.amount;
      else if (c.status === "paid") cur.paid += c.amount;
      commissionsByPartner.set(c.partner_id, cur);
    }

    const { data: payouts } = await admin
      .from("payouts")
      .select("partner_id, amount, status")
      .in("partner_id", partnerIds);
    for (const p of payouts ?? []) {
      const cur = payoutsByPartner.get(p.partner_id) ?? { pending: 0, paid: 0 };
      if (p.status === "pending") cur.pending += p.amount;
      else if (p.status === "paid") cur.paid += p.amount;
      payoutsByPartner.set(p.partner_id, cur);
    }

    const referredUserIds = (referrals ?? []).map((r) => r.partner_id);
    if (referredUserIds.length) {
      const { data: payments } = await admin
        .from("payments")
        .select("profile_id")
        .in("profile_id", referredUserIds);
      const payerSet = new Set<string>();
      for (const pm of payments ?? []) payerSet.add(pm.profile_id);
      for (const id of partnerIds) {
        const partnerReferrals = (referrals ?? []).filter((r) => r.partner_id === id);
        const partnerPayerCount = partnerReferrals.filter((r) => payerSet.has(r.partner_id)).length;
        payerCounts.set(id, partnerPayerCount);
      }
    }
  }

  const partners: PartnerRow[] = (profiles ?? []).map((p) => {
    const comm = commissionsByPartner.get(p.id) ?? { approved: 0, pending: 0, paid: 0 };
    const pay = payoutsByPartner.get(p.id) ?? { pending: 0, paid: 0 };
    return {
      id: p.id,
      username: p.username,
      display_name: p.display_name,
      partner_code: p.partner_code,
      commission_rate: p.commission_rate ?? 30,
      created_at: p.created_at,
      referral_count: referralCounts.get(p.id) ?? 0,
      payer_count: payerCounts.get(p.id) ?? 0,
      commissions_approved: comm.approved,
      commissions_pending: comm.pending,
      commissions_paid: comm.paid,
      payouts_pending: pay.pending,
      payouts_paid: pay.paid,
    };
  });

  const { data: pendingRaw } = await admin
    .from("payouts")
    .select("id, partner_id, amount, method, account_identifier, account_holder, details, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const pendingPartnerIds = [...new Set((pendingRaw ?? []).map((p) => p.partner_id))];
  const partnerNameMap = new Map<string, { username: string | null; display_name: string | null }>();
  if (pendingPartnerIds.length) {
    const { data: partnerProfiles } = await admin
      .from("profiles")
      .select("id, username, display_name")
      .in("id", pendingPartnerIds);
    for (const pp of partnerProfiles ?? [])
      partnerNameMap.set(pp.id, { username: pp.username, display_name: pp.display_name });
  }

  const pendingPayouts: PendingPayout[] = (pendingRaw ?? []).map((p) => ({
    id: p.id,
    partner_id: p.partner_id,
    amount: p.amount,
    method: p.method,
    account_identifier: p.account_identifier,
    account_holder: p.account_holder,
    details: p.details,
    created_at: p.created_at,
    partner_username: partnerNameMap.get(p.partner_id)?.username ?? null,
    partner_display_name: partnerNameMap.get(p.partner_id)?.display_name ?? null,
  }));

  return { partners, pendingPayouts };
}
