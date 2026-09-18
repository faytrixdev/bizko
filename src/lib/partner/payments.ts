import { computeCommissionAmount, DEFAULT_COMMISSION_RATE } from "./commissions";

export type PaymentSeed = {
  profileId: string;
  provider: "whop" | "chariow";
  providerPaymentId: string;
  amount: number;
  currency: string;
  interval: "monthly" | "yearly";
  plan: string;
};

interface QueryResult {
  data: unknown;
  error: unknown;
}

/** ADMIN/authenticated Supabase client contract used by this module. */
interface AdminClient {
  from(table: string): {
    select(columns: string): {
      eq(column: string, value: string): {
        maybeSingle(): PromiseLike<QueryResult>;
      };
    };
    insert(row: unknown, opts?: { onConflict?: string }): PromiseLike<QueryResult>;
    upsert(row: unknown, opts?: { onConflict?: string }): PromiseLike<QueryResult>;
  };
}

export type PaymentResult =
  | { status: "already_processed" }
  | { status: "no_referral" }
  | { status: "partner_inactive" }
  | { status: "commissioned" };

function rowId(data: unknown, key: string): string {
  if (data && typeof data === "object" && key in data) {
    const value = (data as Record<string, unknown>)[key];
    if (typeof value === "string" && value) return value;
  }
  throw new Error(`partner payment: expected string ${key}, got ${String(data)}`);
}

function assertOk(label: string, error: unknown): void {
  if (error) throw new Error(`partner payment ${label} failed: ${String(error)}`);
}

/**
 * Records a confirmed payment and, when the payer has an active referrer,
 * creates its commission. Idempotent by construction: `provider_payment_id`
 * unique on payments and `payment_id` unique on commissions. Throws on DB
 * errors so the calling webhook can return 500 and let the provider retry.
 */
export async function handleConfirmedPayment(args: {
  client: AdminClient;
  seed: PaymentSeed;
}): Promise<PaymentResult> {
  const { client, seed } = args;

  const existing = await client
    .from("payments")
    .select("id")
    .eq("provider_payment_id", seed.providerPaymentId)
    .maybeSingle();
  if (existing.data) return { status: "already_processed" };

  const upserted = await client
    .from("payments")
    .upsert(
      {
        profile_id: seed.profileId,
        provider: seed.provider,
        provider_payment_id: seed.providerPaymentId,
        amount: seed.amount,
        currency: seed.currency,
        interval: seed.interval,
        plan: seed.plan,
      },
      { onConflict: "provider_payment_id" }
    );
  assertOk("upsert", upserted.error);

  // The upsert does not return the row, so re-select to get the payment id,
  // which commissions.payment_id references (unique, the real dedupe guard).
  const payment = await client
    .from("payments")
    .select("id, status")
    .eq("provider_payment_id", seed.providerPaymentId)
    .maybeSingle();
  const paymentId = rowId(payment.data, "id");

  const referral = await client
    .from("referrals")
    .select("partner_id")
    .eq("referred_user_id", seed.profileId)
    .maybeSingle();
  if (!referral.data) return { status: "no_referral" };
  const partnerId = rowId(referral.data, "partner_id");

  const partner = await client
    .from("profiles")
    .select("id, is_partner, commission_rate")
    .eq("id", partnerId)
    .maybeSingle();
  const p = partner.data as { id: string; is_partner?: boolean; commission_rate?: number } | null;
  if (!p || p.is_partner !== true) return { status: "partner_inactive" };

  const amount = computeCommissionAmount(seed.amount, p.commission_rate ?? DEFAULT_COMMISSION_RATE);
  const commission = await client
    .from("commissions")
    .insert(
      {
        partner_id: p.id,
        referred_user_id: seed.profileId,
        amount,
        status: "approved",
        payment_id: paymentId,
      },
      { onConflict: "payment_id" }
    );
  assertOk("commission insert", commission.error);

  return { status: "commissioned" };
}