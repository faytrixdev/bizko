import { cookies } from "next/headers";
import { REF_COOKIE_NAME, parseRefCookieValue, type ReferralSource } from "./tracking";

interface ReferralClient {
  rpc(name: string, args: Record<string, unknown>): PromiseLike<{ data: unknown; error: unknown }>;
  from(table: string): { insert(row: unknown): PromiseLike<{ error: unknown }> };
}

function coercePartnerId(data: unknown): string | null {
  if (typeof data === "string") return data || null;
  if (data && typeof data === "object" && "id" in data) {
    const id = (data as { id?: unknown }).id;
    if (typeof id === "string" && id) return id;
  }
  return null;
}

/** Reads the HttpOnly referral cookie (server-only). Returns null when absent. */
export async function readRefCookie(): Promise<{ ref: string; source: ReferralSource } | null> {
  const store = await cookies();
  return parseRefCookieValue(store.get(REF_COOKIE_NAME)?.value);
}

/** Clears the referral cookie. */
export async function clearRefCookie(): Promise<void> {
  const store = await cookies();
  store.set({ name: REF_COOKIE_NAME, value: "", maxAge: 0, path: "/" });
}

/**
 * Attributes `userId` to the partner owning `ref`, resolved via the
 * security-definer RPC (works even for private-profile partners). Best-effort:
 * never rejects the onboarding when attribution fails.
 */
export async function recordReferral(args: {
  client: ReferralClient;
  userId: string;
  ref: string;
  source: ReferralSource;
}): Promise<{ recorded: boolean }> {
  try {
    const { data } = await args.client.rpc("get_active_partner_by_code", { p_code: args.ref });
    const partnerId = coercePartnerId(data);
    if (!partnerId || partnerId === args.userId) return { recorded: false };
    const { error } = await args.client.from("referrals").insert({
      partner_id: partnerId,
      referred_user_id: args.userId,
      source: args.source,
    });
    return { recorded: !error };
  } catch (err) {
    console.error("partner referral attribution failed:", err);
    return { recorded: false };
  }
}