import { afterEach, describe, it, expect, vi } from "vitest";
import { createHmac } from "crypto";
import { resolveProPlanId, verifyWebhook, createCheckoutConfig, getMembership, cancelMembership, uncancelMembership, listMembershipPayments } from "../whop";

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
  type FetchLike = (url: RequestInfo | URL, init: RequestInit) => Promise<Response>;
  function mockCheckoutResponse() {
    const mock = vi.fn<FetchLike>(async () =>
      ({
        ok: true,
        status: 200,
        json: async () => ({ id: "ch_test", purchase_url: "https://sandbox.whop.com/checkout/ch_test" }),
      }) as unknown as Response
    );
    globalThis.fetch = mock as unknown as typeof fetch;
    return mock;
  }

  function requestInitOf(mock: ReturnType<typeof mockCheckoutResponse>): RequestInit {
    return mock.mock.calls[0][1];
  }

  function requestBodyOf(mock: ReturnType<typeof mockCheckoutResponse>): string {
    return String(requestInitOf(mock).body);
  }

  it("sends redirect_url defaulting to /dashboard?success=pro (absolute)", async () => {
    const fetchMock = mockCheckoutResponse();
    process.env.WHOP_API_KEY = "apik_test";
    process.env.WHOP_PLAN_ID_PRO = "plan_monthly";
    process.env.NEXT_PUBLIC_SITE_URL = "https://bizko.pro";
    delete process.env.WHOP_PLAN_ID_PRO_YEARLY;
    delete process.env.WHOP_CHECKOUT_REDIRECT_URL;

    await createCheckoutConfig("profile_1", "monthly");

    const body = JSON.parse(requestBodyOf(fetchMock));
    expect(body.plan_id).toBe("plan_monthly");
    expect(body.metadata).toEqual({ profile_id: "profile_1" });
    expect(body.redirect_url).toBe("https://bizko.pro/dashboard?success=pro");
  });

  it("uses WHOP_CHECKOUT_REDIRECT_URL when set", async () => {
    const fetchMock = mockCheckoutResponse();
    process.env.WHOP_API_KEY = "apik_test";
    process.env.WHOP_PLAN_ID_PRO = "plan_monthly";
    process.env.WHOP_CHECKOUT_REDIRECT_URL = "https://bizko.pro/done";

    await createCheckoutConfig("profile_2", "monthly");

    const body = JSON.parse(requestBodyOf(fetchMock));
    expect(body.redirect_url).toBe("https://bizko.pro/done");
  });

  it("turns a relative WHOP_CHECKOUT_REDIRECT_URL into an absolute one", async () => {
    const fetchMock = mockCheckoutResponse();
    process.env.WHOP_API_KEY = "apik_test";
    process.env.WHOP_PLAN_ID_PRO = "plan_monthly";
    process.env.WHOP_CHECKOUT_REDIRECT_URL = "/merci";
    process.env.NEXT_PUBLIC_SITE_URL = "https://bizko.pro";

    await createCheckoutConfig("profile_2b", "monthly");

    const body = JSON.parse(requestBodyOf(fetchMock));
    expect(body.redirect_url).toBe("https://bizko.pro/merci");
  });

  it("allows an explicit redirectUrl override", async () => {
    const fetchMock = mockCheckoutResponse();
    process.env.WHOP_API_KEY = "apik_test";
    process.env.WHOP_PLAN_ID_PRO = "plan_monthly";

    await createCheckoutConfig("profile_3", "monthly", "https://example.com/thanks");

    const body = JSON.parse(requestBodyOf(fetchMock));
    expect(body.redirect_url).toBe("https://example.com/thanks");
  });

  it("throws WhopApiError when Whop is not configured", async () => {
    process.env.WHOP_API_KEY = "";
    process.env.WHOP_PLAN_ID_PRO = "";
    await expect(createCheckoutConfig("profile_1", "monthly")).rejects.toThrow();
  });
});

describe("getMembership", () => {
  type FetchLike = (url: RequestInfo | URL, init: RequestInit) => Promise<Response>;
  function mockMembershipResponse() {
    const mock = vi.fn<FetchLike>(async () =>
      ({
        ok: true,
        status: 200,
        json: async () => ({
          id: "mber_123",
          plan_id: "plan_Y19ISQ4TaOryH",
          status: "active",
          cancel_at_period_end: false,
          current_period_end: "2026-10-04T00:00:00.000Z",
          formatted_renewal_price: "2 500 FCFA",
        }),
      }) as unknown as Response
    );
    globalThis.fetch = mock as unknown as typeof fetch;
    return mock;
  }

  function requestInitOf(mock: ReturnType<typeof mockMembershipResponse>): RequestInit {
    return mock.mock.calls[0][1];
  }

  it("GETs /memberships/:id with auth and returns the membership", async () => {
    const fetchMock = mockMembershipResponse();
    process.env.WHOP_API_KEY = "apik_test";

    const membership = await getMembership("mber_123");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.whop.com/api/v1/memberships/mber_123",
      expect.objectContaining({ method: "GET" })
    );
    expect(requestInitOf(fetchMock).headers).toMatchObject({ Authorization: "Bearer apik_test" });
    expect(membership).toMatchObject({ id: "mber_123", status: "active", cancel_at_period_end: false });
  });

  it("throws WhopApiError on a non-2xx response", async () => {
    const mock = vi.fn<FetchLike>(async () =>
      ({ ok: false, status: 404, json: async () => ({}) }) as unknown as Response
    );
    globalThis.fetch = mock as unknown as typeof fetch;
    process.env.WHOP_API_KEY = "apik_test";

    await expect(getMembership("mber_missing")).rejects.toMatchObject({ status: 404 });
  });
});

describe("cancelMembership / uncancelMembership", () => {
  type FetchLike = (url: RequestInfo | URL, init: RequestInit) => Promise<Response>;
  function mockOkResponse(body: unknown = {}) {
    const mock = vi.fn<FetchLike>(async () =>
      ({ ok: true, status: 200, json: async () => body }) as unknown as Response
    );
    globalThis.fetch = mock as unknown as typeof fetch;
    return mock;
  }
  function requestInitOf(mock: ReturnType<typeof mockOkResponse>): RequestInit {
    return mock.mock.calls[0][1];
  }

  it("cancels at_period_end by default with a POST body", async () => {
    const fetchMock = mockOkResponse();
    process.env.WHOP_API_KEY = "apik_test";

    await cancelMembership("mber_123");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.whop.com/api/v1/memberships/mber_123/cancel",
      expect.objectContaining({ method: "POST" })
    );
    expect(JSON.parse(String(requestInitOf(fetchMock).body))).toEqual({ cancellation_mode: "at_period_end" });
  });

  it("supports immediate cancellation", async () => {
    const fetchMock = mockOkResponse();
    process.env.WHOP_API_KEY = "apik_test";

    await cancelMembership("mber_123", "now");

    expect(JSON.parse(String(requestInitOf(fetchMock).body))).toEqual({ cancellation_mode: "now" });
  });

  it("uncancels via POST to /uncancel", async () => {
    const fetchMock = mockOkResponse();
    process.env.WHOP_API_KEY = "apik_test";

    await uncancelMembership("mber_123");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.whop.com/api/v1/memberships/mber_123/uncancel",
      expect.objectContaining({ method: "POST" })
    );
  });
});

describe("listMembershipPayments", () => {
  type FetchLike = (url: RequestInfo | URL, init: RequestInit) => Promise<Response>;
  it("GETs /payments filtered by membership query", async () => {
    const mock = vi.fn<FetchLike>(async () =>
      ({
        ok: true,
        status: 200,
        json: async () => ({
          data: [
            { id: "pay_1", total: 2500, currency: "xof", status: "succeeded", paid_at: "2026-09-04T00:00:00.000Z" },
          ],
        }),
      }) as unknown as Response
    );
    globalThis.fetch = mock as unknown as typeof fetch;
    process.env.WHOP_API_KEY = "apik_test";

    const res = await listMembershipPayments("mber_123");

    const calledUrl = String(mock.mock.calls[0][0]);
    expect(calledUrl).toContain("/payments");
    expect(calledUrl).toContain("query=mber_123");
    expect(mock).toHaveBeenCalledWith(
      expect.stringContaining("/payments"),
      expect.objectContaining({ method: "GET" })
    );
    expect(res).toHaveLength(1);
    expect(res[0]).toMatchObject({ id: "pay_1", currency: "xof" });
  });
});
