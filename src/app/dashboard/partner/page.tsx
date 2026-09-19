import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getPartnerOverview, getPartnerReferrals, getPartnerPayouts } from "@/lib/partner/queries";
import { MIN_PAYOUT_AMOUNT, DEFAULT_COMMISSION_RATE } from "@/lib/partner/commissions";
import { PartnerDashboard } from "./PartnerDashboard";

export const dynamic = "force-dynamic";

export default async function PartnerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_partner, partner_code, commission_rate, display_name")
    .eq("id", user.id)
    .single();

  if (!profile?.is_partner) notFound();

  const partnerCode = profile.partner_code ?? "";
  const commissionRate = profile.commission_rate ?? DEFAULT_COMMISSION_RATE;

  const [overview, referrals, payouts] = await Promise.all([
    getPartnerOverview(user.id, partnerCode, commissionRate),
    getPartnerReferrals(user.id),
    getPartnerPayouts(user.id),
  ]);

  const referralLink = `https://bizko.pro/?ref=${partnerCode}`;
  const canRequestPayout = overview.availableBalance >= MIN_PAYOUT_AMOUNT;

  return (
    <PartnerDashboard
      overview={overview}
      referrals={referrals}
      payouts={payouts}
      referralLink={referralLink}
      minPayout={MIN_PAYOUT_AMOUNT}
      canRequestPayout={canRequestPayout}
    />
  );
}
