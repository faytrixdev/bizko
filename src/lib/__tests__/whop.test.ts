import { afterEach, describe, it, expect, vi } from "vitest";
import { createHmac } from "crypto";
import { resolveProPlanId, verifyWebhook, createCheckoutConfig } from "../whop";

const ENV_BACKUP = { ...process.env };

afterEach(() => {
  process.env.WHOP_PLAN_ID_PRO = ENV_BACKUP.WHOP_PLAN_ID_PRO;
  process.env.WHOP_PLAN_ID_PRO_YEARLY = ENV_BACKUP.WHOP_PLAN_ID_PRO_YEARLY;
  process.env.WHOP_CHECKOUT_REDIRECT_URL = ENV_BACKUP.WHOP_CHECKOUT_REDIRECT_URL;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const SECRET = "ws_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

function sign(body: string, id: string, timestamp: string, secret = SECRET): string {
  const hmac = createHmac("sha256", secret).update(`${id}.${timestamp}.${body}`).digest("base64");
  return `v1,${hmac}`;
}

function makeHeaders(
  rawBody: string,
  opts?: { id?: string; timestamp?: string; secret?: string; signature?: string }
): Record<string, string> {
  const id = opts?.id ?? "msg_test123";
  const timestamp = opts?.timestamp ?? String(Math.floor(Date.now() / 1000));
  return {
    "webhook-id": id,
    "webhook-timestamp": timestamp,
    "webhook-signature": opts?.signature ?? sign(rawBody, id, timestamp, opts?.secret),
  };
}

describe("verifyWebhook", () => {
  it("returns the parsed event for a valid signature", () => {
    const body = JSON.stringify({ id: "msg_1", type: "membership.activated", data: {} });
    const event = verifyWebhook(makeHeaders(body), body, SECRET);
    expect(event).toMatchObject({ id: "msg_1", type: "membership.activated" });
  });

  it("throws on a wrong secret", () => {
    const body = JSON.stringify({ type: "x" });
    const headers = makeHeaders(body, { secret: "ws_wrong" });
    expect(() => verifyWebhook(headers, body, SECRET)).toThrow();
  });

  it("throws when the signature header has a bad value", () => {
    const body = JSON.stringify({ type: "x" });
    const headers = makeHeaders(body, { signature: "v1,AAAA" });
    expect(() => verifyWebhook(headers, body, SECRET)).toThrow();
  });

  it("rejects a replay (timestamp too old)", () => {
    const body = JSON.stringify({ type: "x" });
    const headers = makeHeaders(body, { timestamp: String(Math.floor(Date.now() / 1000) - 600) });
    expect(() => verifyWebhook(headers, body, SECRET)).toThrow();
  });

  it("rejects when required headers are missing", () => {
    const body = JSON.stringify({ type: "x" });
    expect(() => verifyWebhook({}, body, SECRET)).toThrow();
  });
});

describe("resolveProPlanId", () => {
  it("returns the monthly plan id by default", () => {
    process.env.WHOP_PLAN_ID_PRO = "plan_monthly";
    delete process.env.WHOP_PLAN_ID_PRO_YEARLY;
    expect(resolveProPlanId("monthly")).toBe("plan_monthly");
  });

  it("returns the yearly plan id when requested and configured", () => {
    process.env.WHOP_PLAN_ID_PRO = "plan_monthly";
    process.env.WHOP_PLAN_ID_PRO_YEARLY = "plan_yearly";
    expect(resolveProPlanId("yearly")).toBe("plan_yearly");
  });

  it("falls back to the monthly plan id when yearly is not configured", () => {
    process.env.WHOP_PLAN_ID_PRO = "plan_monthly";
    delete process.env.WHOP_PLAN_ID_PRO_YEARLY;
    expect(resolveProPlanId("yearly")).toBe("plan_monthly");
  });

  it("returns undefined when no plan id is configured", () => {
    delete process.env.WHOP_PLAN_ID_PRO;
    delete process.env.WHOP_PLAN_ID_PRO_YEARLY;
    expect(resolveProPlanId("monthly")).toBeUndefined();
  });
});

describe("createCheckoutConfig", () => {
  function mockCheckoutResponse() {
    const mock = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ id: "ch_test", purchase_url: "https://sandbox.whop.com/checkout/ch_test" }),
    }));
    globalThis.fetch = mock as unknown as typeof fetch;
    return mock;
  }

  it("sends redirect_url defaulting to /dashboard?success=pro", async () => {
    const fetchMock = mockCheckoutResponse();
    process.env.WHOP_API_KEY = "apik_test";
    process.env.WHOP_PLAN_ID_PRO = "plan_monthly";
    delete process.env.WHOP_PLAN_ID_PRO_YEARLY;
    delete process.env.WHOP_CHECKOUT_REDIRECT_URL;

    await createCheckoutConfig("profile_1", "monthly");

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.plan_id).toBe("plan_monthly");
    expect(body.metadata).toEqual({ profile_id: "profile_1" });
    expect(body.redirect_url).toBe("/dashboard?success=pro");
  });

  it("uses WHOP_CHECKOUT_REDIRECT_URL when set", async () => {
    const fetchMock = mockCheckoutResponse();
    process.env.WHOP_API_KEY = "apik_test";
    process.env.WHOP_PLAN_ID_PRO = "plan_monthly";
    process.env.WHOP_CHECKOUT_REDIRECT_URL = "https://bizko.pro/done";

    await createCheckoutConfig("profile_2", "monthly");

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.redirect_url).toBe("https://bizko.pro/done");
  });

  it("allows an explicit redirectUrl override", async () => {
    const fetchMock = mockCheckoutResponse();
    process.env.WHOP_API_KEY = "apik_test";
    process.env.WHOP_PLAN_ID_PRO = "plan_monthly";

    await createCheckoutConfig("profile_3", "monthly", "https://example.com/thanks");

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.redirect_url).toBe("https://example.com/thanks");
  });

  it("throws WhopApiError when Whop is not configured", async () => {
    process.env.WHOP_API_KEY = "";
    process.env.WHOP_PLAN_ID_PRO = "";
    await expect(createCheckoutConfig("profile_1", "monthly")).rejects.toThrow();
  });
});
