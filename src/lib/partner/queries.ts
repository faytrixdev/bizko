import { createClient } from "@/lib/supabase/server";
import { computeAvailableBalance } from "./commissions";

export interface PartnerOverview {
  partnerCode: string;
  commissionRate: number;
  referralCount: number;
  payersCount: number;
  commissionsGenerated: number;
  commissionsPending: number;
  commissionsApproved: number;
  commissionsPaid: number;
  pendingPayouts: number;
  paidPayouts: number;
  availableBalance: number;
}

const sum = (rows: { amount: number }[] | null) =>
  (rows ?? []).reduce((s, r) => s + r.amount, 0);

interface CommissionRow {
  amount: number;
  status: string;
}
interface PayoutRow {
  amount: number;
  status: string;
}

/**
 * Server-side overview for the partner dashboard.
 *
 * Two-step in-clause (never raw SQL): the set of referred user ids comes from
 * this partner's `referrals`, then those ids feed the `payments` filter so the
 * payers count stays exact even when a referred user paid multiple times.
 */
export async function getPartnerOverview(
  userId: string,
  partnerCode: string,
  commissionRate: number
): Promise<PartnerOverview> {
  const supabase = await createClient();
  const { data: referrals } = await supabase
    .from("referrals")
    .select("referred_user_id")
    .eq("partner_id", userId);
  const referredUserIds = (referrals ?? []).map((r) => r.referred_user_id).filter(Boolean);
  const { data: payments } = referredUserIds.length
    ? await supabase
        .from("payments")
        .select("profile_id")
        .in("profile_id", referredUserIds)
    : { data: [] };

  const { data: commissions } = await supabase
    .from("commissions")
    .select("amount, status")
    .eq("partner_id", userId);
  const { data: payouts } = await supabase
    .from("payouts")
    .select("amount, status")
    .eq("partner_id", userId);

  const byStatus = (rows: CommissionRow[] | null, status: string) =>
    sum((rows ?? []).filter((c) => c.status === status));

  const approved = byStatus(commissions, "approved");
  const pending = byStatus(commissions, "pending");
  const paid = byStatus(commissions, "paid");
  const pendingPayouts = byStatus(payouts, "pending");
  const paidPayouts = byStatus(payouts, "paid");

  return {
    partnerCode,
    commissionRate,
    referralCount: referrals?.length ?? 0,
    payersCount: new Set((payments ?? []).map((p) => p.profile_id)).size,
    commissionsGenerated: approved + paid,
    commissionsPending: pending,
    commissionsApproved: approved,
    commissionsPaid: paid,
    pendingPayouts,
    paidPayouts,
    availableBalance: computeAvailableBalance({
      approvedCommissions: approved,
      pendingPayouts,
      paidPayouts,
    }),
  };
}

export interface PartnerReferral {
  id: string;
  referredUserProfileId: string;
  referredUsername: string | null;
  referredDisplayName: string | null;
  latestPaymentTotal: number | null;
  latestPaymentAt: string | null;
  commissionAmount: number | null;
  commissionStatus: string | null;
  createdAt: string;
}

/** Referrals + joined referred profile + latest payment + commission row. */
export async function getPartnerReferrals(userId: string): Promise<PartnerReferral[]> {
  const supabase = await createClient();
  const { data: referrals } = await supabase
    .from("referrals")
    .select("id, referred_user_id, created_at")
    .eq("partner_id", userId)
    .order("created_at", { ascending: false });
  const referredIds = (referrals ?? []).map((r) => r.referred_user_id).filter(Boolean);

  const profileByUserId = new Map<string, { username: string | null; display_name: string | null }>();
  const paymentByUserId = new Map<string, { total: number; created_at: string }>();
  const commissionByUserId = new Map<string, { amount: number; status: string }>();

  if (referredIds.length) {
    const { data: referredProfiles } = await supabase
      .from("profiles")
      .select("id, username, display_name")
      .in("id", referredIds);
    for (const p of referredProfiles ?? []) profileByUserId.set(p.id, { username: p.username, display_name: p.display_name });

    const { data: latestPayments } = await supabase
      .from("payments")
      .select("profile_id, total, created_at")
      .in("profile_id", referredIds)
      .order("created_at", { ascending: false });
    for (const pm of latestPayments ?? [])
      if (!paymentByUserId.has(pm.profile_id)) paymentByUserId.set(pm.profile_id, pm);

    const { data: commissionRows } = await supabase
      .from("commissions")
      .select("referred_user_id, amount, status")
      .eq("partner_id", userId)
      .in("referred_user_id", referredIds);
    for (const c of commissionRows ?? []) commissionByUserId.set(c.referred_user_id, c);
  }

  return (referrals ?? []).map((r) => ({
    id: r.id,
    referredUserProfileId: r.referred_user_id,
    referredUsername: profileByUserId.get(r.referred_user_id)?.username ?? null,
    referredDisplayName: profileByUserId.get(r.referred_user_id)?.display_name ?? null,
    latestPaymentTotal: paymentByUserId.get(r.referred_user_id)?.total ?? null,
    latestPaymentAt: paymentByUserId.get(r.referred_user_id)?.created_at ?? null,
    commissionAmount: commissionByUserId.get(r.referred_user_id)?.amount ?? null,
    commissionStatus: commissionByUserId.get(r.referred_user_id)?.status ?? null,
    createdAt: r.created_at,
  }));
}

export interface PartnerPayoutRow {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
}

export async function getPartnerPayouts(userId: string): Promise<PartnerPayoutRow[]> {
  const supabase = await createClient();
  const { data: payouts } = await supabase
    .from("payouts")
    .select("id, amount, status, created_at")
    .eq("partner_id", userId)
    .order("created_at", { ascending: false });
  return (payouts ?? []).map((p) => ({
    id: p.id,
    amount: p.amount,
    status: p.status,
    createdAt: p.created_at,
  }));
}
