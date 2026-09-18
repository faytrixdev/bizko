export const MIN_PAYOUT_AMOUNT = 5000;
export const DEFAULT_COMMISSION_RATE = 30;

export type CommissionStatus = "pending" | "approved" | "paid";

/** Commission on a payment: Math.round because XOF has no decimals. */
export function computeCommissionAmount(total: number, ratePercent: number): number {
  return Math.round((total * ratePercent) / 100);
}

/**
 * Balance withdrawable by a partner: approved commissions minus amounts
 * already requested (pending) or paid out.
 */
export function computeAvailableBalance(b: {
  approvedCommissions: number;
  pendingPayouts: number;
  paidPayouts: number;
}): number {
  return Math.max(0, b.approvedCommissions - b.pendingPayouts - b.paidPayouts);
}

export interface CommissionLike {
  id: string;
  amount: number;
  status: string;
  created_at: string;
}

/** Oldest approved commissions whose total exactly matches `amount` (FIFO). */
export function pickCommissionsFifo(
  commissions: CommissionLike[],
  amount: number
): CommissionLike[] {
  const approved = commissions
    .filter((c) => c.status === "approved")
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  const picked: CommissionLike[] = [];
  let used = 0;
  for (const c of approved) {
    const remain = amount - used;
    if (remain <= 0) break;
    if (c.amount >= remain) {
      picked.push(c);
      used += remain;
      break;
    }
    picked.push(c);
    used += c.amount;
  }
  if (used !== amount) return [];
  return picked;
}