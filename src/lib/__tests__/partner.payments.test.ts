import { describe, expect, it, vi } from "vitest";
import { handleConfirmedPayment, PaymentSeed } from "@/lib/partner/payments";

function makeClient(opts: {
  existingPayment?: unknown;
  referral?: unknown;
  partner?: unknown;
  paymentInsertError?: unknown;
  paymentUpsertError?: unknown;
  commissionInsertError?: unknown;
}): {
  calls: { type: string; arg: unknown }[];
  from: (table: string) => any;
} {
  const calls: { type: string; arg: unknown }[] = [];
  const t = (type: string, arg: unknown) => calls.push({ type, arg });
  let storedPayment: unknown = opts.existingPayment ?? null;
  return {
    calls,
    from: (table: string) => {
      if (table === "payments") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn(async () => ({ data: storedPayment, error: null })),
            }),
          }),
          insert: vi.fn(async (row: unknown) => {
            t("payments.insert", row);
            return { error: opts.paymentInsertError ?? null };
          }),
          upsert: vi.fn(async (row: unknown) => {
            t("payments.upsert", row);
            if (!storedPayment) {
              storedPayment = { id: "pay-row-1", status: "succeeded", ...(row as Record<string, unknown>) };
            }
            return { error: opts.paymentInsertError ?? null };
          }),
        };
      }
      if (table === "referrals") {
        return { select: () => ({ eq: () => ({ maybeSingle: vi.fn(async () => ({ data: opts.referral ?? null, error: null })) }) }) };
      }
      if (table === "profiles") {
        return { select: () => ({ eq: () => ({ maybeSingle: vi.fn(async () => ({ data: opts.partner ?? null, error: null })) }) }) };
      }
      if (table === "commissions") {
        return {
          insert: vi.fn(async (row: unknown) => {
            t("commissions.insert", row);
            return { error: opts.commissionInsertError ?? null };
          }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
  };
}

const SEED: PaymentSeed = {
  profileId: "u1",
  provider: "whop",
  providerPaymentId: "pay_1",
  amount: 5000,
  currency: "XOF",
  interval: "monthly",
  plan: "pro",
};

describe("handleConfirmedPayment", () => {
  it("creates payment + commission for a referred, active partner", async () => {
    const client = makeClient({ referral: { partner_id: "p1" }, partner: { id: "p1", is_partner: true, commission_rate: 30 } });
    const res = await handleConfirmedPayment({ client, seed: SEED });
    expect(res).toEqual({ status: "commissioned" });
    expect(client.calls).toContainEqual(
      expect.objectContaining({ type: "payments.upsert", arg: expect.objectContaining({ provider_payment_id: "pay_1" }) })
    );
    expect(client.calls).toContainEqual(
      expect.objectContaining({
        type: "commissions.insert",
        arg: expect.objectContaining({ partner_id: "p1", referred_user_id: "u1", amount: 1500, status: "approved" }),
      })
    );
  });

  it("is idempotent: leaves the existing record alone on replay", async () => {
    const client = makeClient({ existingPayment: { id: "pay-row" } });
    const res = await handleConfirmedPayment({ client, seed: SEED });
    expect(res.status).toBe("already_processed");
    expect(client.calls.filter((c) => c.type === "commissions.insert")).toHaveLength(0);
  });

  it("records the payment but no commission when there is no referral", async () => {
    const client = makeClient({ referral: null });
    const res = await handleConfirmedPayment({ client, seed: SEED });
    expect(res.status).toBe("no_referral");
    expect(client.calls).toContainEqual(expect.objectContaining({ type: "payments.upsert" }));
  });

  it("skips commission for an inactive partner", async () => {
    const client = makeClient({ referral: { partner_id: "p1" }, partner: { id: "p1", is_partner: false } });
    const res = await handleConfirmedPayment({ client, seed: SEED });
    expect(res.status).toBe("partner_inactive");
    expect(client.calls.filter((c) => c.type === "commissions.insert")).toHaveLength(0);
  });
});