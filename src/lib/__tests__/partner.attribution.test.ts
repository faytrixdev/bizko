import { describe, expect, it, vi, type Mock } from "vitest";
import { recordReferral } from "@/lib/partner/attribution";

interface StubClient {
  rpc: Mock;
  from: (table: string) => { insert: Mock };
}

function clientStub(partnerId: unknown) {
  const rpc = vi.fn(async () => ({ data: partnerId, error: null }));
  const insert = vi.fn(async () => ({ error: null }));
  return {
    rpc,
    from: (table: string) => ({ insert: table === "referrals" ? insert : null }),
  } as unknown as StubClient;
}

describe("recordReferral", () => {
  it("inserts a referral when the code belongs to an active partner", async () => {
    const client = clientStub("p1");
    const result = await recordReferral({
      client,
      userId: "u1",
      ref: "faytrix_x8k2",
      source: "partner_profile",
    });
    expect(result).toEqual({ recorded: true });
    expect(client.rpc).toHaveBeenCalledWith("get_active_partner_by_code", { p_code: "faytrix_x8k2" });
    expect(client.from("referrals").insert).toHaveBeenCalledWith(
      expect.objectContaining({ partner_id: "p1", referred_user_id: "u1", source: "partner_profile" })
    );
  });

  it("skips when no active partner owns the code or the user self-refers", async () => {
    expect((await recordReferral({ client: clientStub(null), userId: "u1", ref: "x_y", source: "partner_link" })).recorded).toBe(false);
    const self = clientStub("u1");
    expect((await recordReferral({ client: self, userId: "u1", ref: "x_y", source: "partner_link" })).recorded).toBe(false);
  });

  it("never throws (attribution is best-effort)", async () => {
    const broken = { rpc: vi.fn(async () => { throw new Error("db") }) } as never;
    const result = await recordReferral({ client: broken, userId: "u1", ref: "x_y", source: "partner_link" });
    expect(result).toEqual({ recorded: false });
  });

  it("reports not recorded when the insert rejects (concurrent duplicate)", async () => {
    const insert = vi.fn(async () => ({ error: new Error("duplicate") }));
    const client = {
      rpc: vi.fn(async () => ({ data: "p1", error: null })),
      from: (table: string) => ({ insert: table === "referrals" ? insert : null }),
    } as unknown as StubClient;
    const result = await recordReferral({ client, userId: "u1", ref: "x_y", source: "partner_link" });
    expect(result).toEqual({ recorded: false });
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ partner_id: "p1" }));
  });
});