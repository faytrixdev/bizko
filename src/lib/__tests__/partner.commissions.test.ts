import { describe, expect, it } from "vitest";
import {
  MIN_PAYOUT_AMOUNT,
  DEFAULT_COMMISSION_RATE,
  computeCommissionAmount,
  computeAvailableBalance,
  pickCommissionsFifo,
} from "@/lib/partner/commissions";

describe("partner commission math", () => {
  it("rounds commission = total * rate / 100", () => {
    expect(computeCommissionAmount(5000, 30)).toBe(1500);
    expect(computeCommissionAmount(1000, 30)).toBe(300);
    expect(computeCommissionAmount(3333, 30)).toBe(1000); // 999.9 -> 1000
  });

  it("exposes the 5000 min payout and 30 default rate", () => {
    expect(MIN_PAYOUT_AMOUNT).toBe(5000);
    expect(DEFAULT_COMMISSION_RATE).toBe(30);
  });

  it("available = approved - pending payouts - paid payouts", () => {
    const balance = computeAvailableBalance({
      approvedCommissions: 12000,
      pendingPayouts: 5000,
      paidPayouts: 2000,
    });
    expect(balance).toBe(5000);
  });

  it("picks oldest approved commissions summing to the payout amount (FIFO)", () => {
    const picked = pickCommissionsFifo(
      [
        { id: "c1", amount: 1500, status: "approved", created_at: "2026-01-01T00:00:00Z" },
        { id: "c2", amount: 500, status: "approved", created_at: "2026-01-02T00:00:00Z" },
        { id: "c3", amount: 3000, status: "approved", created_at: "2026-01-03T00:00:00Z" },
        { id: "c4", amount: 7000, status: "paid", created_at: "2026-01-04T00:00:00Z" },
      ],
      5000
    );
    expect(picked.map((c) => c.id)).toEqual(["c1", "c2", "c3"]);
    expect(picked.reduce((s, c) => s + c.amount, 0)).toBe(5000);
  });
});