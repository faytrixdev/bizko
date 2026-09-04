"use client";

import type { WhopMembership, WhopPayment } from "@/lib/whop";

interface SubscriptionClientProps {
  isPro: boolean;
  membership: WhopMembership | null;
  payments: WhopPayment[];
  error: string | null;
  retryHref: string;
}

export function SubscriptionClient(props: SubscriptionClientProps) {
  return null;
}
