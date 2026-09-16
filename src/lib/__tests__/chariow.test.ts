import { afterEach, describe, it, expect, vi } from "vitest";
import { createHmac } from "crypto";
import {
  createCheckout,
  verifyPulse,
  resolveChariowProductId,
  isYearlyChariowProductConfigured,
  localizePhone,
} from "../chariow";

const ENV_BACKUP = { ...process.env };

afterEach(() => {
  process.env.CHARIOW_API_KEY = ENV_BACKUP.CHARIOW_API_KEY;
  process.env.CHARIOW_PRODUCT_ID_PRO = ENV_BACKUP.CHARIOW_PRODUCT_ID_PRO;
  process.env.CHARIOW_PRODUCT_ID_PRO_YEARLY = ENV_BACKUP.CHARIOW_PRODUCT_ID_PRO_YEARLY;
  process.env.CHARIOW_CHECKOUT_REDIRECT_URL = ENV_BACKUP.CHARIOW_CHECKOUT_REDIRECT_URL;
  vi.restoreAllMocks();
});

describe("resolveChariowProductId", () => {
  it("returns the monthly product id by default", () => {
    process.env.CHARIOW_PRODUCT_ID_PRO = "prd_monthly";
    delete process.env.CHARIOW_PRODUCT_ID_PRO_YEARLY;
    expect(resolveChariowProductId("monthly")).toBe("prd_monthly");
  });

  it("returns the yearly product id when requested and configured", () => {
    process.env.CHARIOW_PRODUCT_ID_PRO = "prd_monthly";
    process.env.CHARIOW_PRODUCT_ID_PRO_YEARLY = "prd_yearly";
    expect(resolveChariowProductId("yearly")).toBe("prd_yearly");
  });

  it("falls back to the monthly product id when yearly is not configured", () => {
    process.env.CHARIOW_PRODUCT_ID_PRO = "prd_monthly";
    delete process.env.CHARIOW_PRODUCT_ID_PRO_YEARLY;
    expect(resolveChariowProductId("yearly")).toBe("prd_monthly");
  });

  it("returns undefined when no product id is configured", () => {
    delete process.env.CHARIOW_PRODUCT_ID_PRO;
    delete process.env.CHARIOW_PRODUCT_ID_PRO_YEARLY;
    expect(resolveChariowProductId("monthly")).toBeUndefined();
  });
});

describe("isYearlyChariowProductConfigured", () => {
  it("true when the yearly product id is set, false otherwise", () => {
    process.env.CHARIOW_PRODUCT_ID_PRO_YEARLY = "prd_yearly";
    expect(isYearlyChariowProductConfigured()).toBe(true);
    delete process.env.CHARIOW_PRODUCT_ID_PRO_YEARLY;
    expect(isYearlyChariowProductConfigured()).toBe(false);
  });
});

describe("localizePhone", () => {
  it("strips the national dial code to produce a national number", () => {
    expect(localizePhone("+22670000000", "BF")).toEqual({ number: "70000000", countryCode: "BF" });
    expect(localizePhone("+2250700000000", "CI")).toEqual({ number: "0700000000", countryCode: "CI" });
  });

  it("falls back to the full digits when the dial code is unknown", () => {
    expect(localizePhone("+155512345678", "US")).toEqual({ number: "155512345678", countryCode: "US" });
  });
});

describe("createCheckout", () => {
  type FetchLike = (url: RequestInfo | URL, init: RequestInit) => Promise<Response>;
  function mockCheckoutResponse() {
    const mock = vi.fn<FetchLike>(async () =>
      ({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            step: "payment",
            purchase: { id: "sal_abc123", status: "awaiting_payment" },
            payment: { checkout_url: "https://payment.chariow.com/checkout?token=tk_1", transaction_id: "txn_1" },
          },
        }),
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

  const CUSTOMER = {
    email: "a@b.com",
    first_name: "Amadou",
    last_name: "Diallo",
    phone_number: "70000000",
    phone_country_code: "BF",
  };

  it("POSTs to /checkout with the ordered body and returns the hosted URL + sale id", async () => {
    const fetchMock = mockCheckoutResponse();
    process.env.CHARIOW_API_KEY = "sk_test";
    process.env.CHARIOW_PRODUCT_ID_PRO = "prd_monthly";
    process.env.NEXT_PUBLIC_SITE_URL = "https://bizko.pro";
    delete process.env.CHARIOW_PRODUCT_ID_PRO_YEARLY;
    delete process.env.CHARIOW_CHECKOUT_REDIRECT_URL;

    const res = await createCheckout({
      profileId: "profile_1",
      interval: "monthly",
      customer: CUSTOMER,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.chariow.com/v1/checkout",
      expect.objectContaining({ method: "POST" })
    );
    expect(requestInitOf(fetchMock).headers).toMatchObject({ Authorization: "Bearer sk_test" });
    const body = JSON.parse(requestBodyOf(fetchMock));
    expect(body.product_id).toBe("prd_monthly");
    expect(body.email).toBe("a@b.com");
    expect(body.first_name).toBe("Amadou");
    expect(body.last_name).toBe("Diallo");
    expect(body.phone).toEqual({ number: "70000000", country_code: "BF" });
    expect(body.custom_metadata).toEqual({ profile_id: "profile_1" });
    expect(body.redirect_url).toBe("https://bizko.pro/dashboard?success=pro");
    expect(res).toEqual({ saleId: "sal_abc123", checkoutUrl: "https://payment.chariow.com/checkout?token=tk_1" });
  });

  it("uses the yearly product id and the env redirect when set", async () => {
    const fetchMock = mockCheckoutResponse();
    process.env.CHARIOW_API_KEY = "sk_test";
    process.env.CHARIOW_PRODUCT_ID_PRO = "prd_monthly";
    process.env.CHARIOW_PRODUCT_ID_PRO_YEARLY = "prd_yearly";
    process.env.CHARIOW_CHECKOUT_REDIRECT_URL = "https://bizko.pro/merci";

    await createCheckout({ profileId: "p1", interval: "yearly", customer: CUSTOMER });

    const body = JSON.parse(requestBodyOf(fetchMock));
    expect(body.product_id).toBe("prd_yearly");
    expect(body.redirect_url).toBe("https://bizko.pro/merci");
  });

  it("throws for step already_purchased", async () => {
    const mock = vi.fn<FetchLike>(async () =>
      ({
        ok: true,
        status: 200,
        json: async () => ({
          data: { step: "already_purchased", message: "already yours", purchase: null, payment: null },
        }),
      }) as unknown as Response
    );
    globalThis.fetch = mock as unknown as typeof fetch;
    process.env.CHARIOW_API_KEY = "sk_test";
    process.env.CHARIOW_PRODUCT_ID_PRO = "prd_monthly";

    await expect(createCheckout({ profileId: "p1", interval: "monthly", customer: CUSTOMER })).rejects.toThrow();
  });

  it("throws when Chariow is not configured", async () => {
    process.env.CHARIOW_API_KEY = "";
    process.env.CHARIOW_PRODUCT_ID_PRO = "";
    await expect(createCheckout({ profileId: "p1", interval: "monthly", customer: CUSTOMER })).rejects.toThrow();
  });
});

describe("verifyPulse", () => {
  const SECRET = "whsec_0123456789abcdef0123456789abcdef";
  function sign(body: string, secret = SECRET): string {
    return "sha256=" + createHmac("sha256", secret).update(body).digest("hex");
  }
  function headers(body: string, opts?: { secret?: string; signature?: string }): Record<string, string> {
    return { "x-chariow-signature": opts?.signature ?? sign(body, opts?.secret) };
  }

  it("returns the parsed payload for a valid signature", () => {
    const body = JSON.stringify({ event: "successful.sale" });
    expect(verifyPulse(headers(body), body, SECRET)).toEqual({ event: "successful.sale" });
  });

  it("throws on a wrong secret or missing header", () => {
    const body = JSON.stringify({ event: "successful.sale" });
    expect(() => verifyPulse(headers(body, { secret: "whsec_wrong" }), body, SECRET)).toThrow();
    expect(() => verifyPulse({}, body, SECRET)).toThrow();
  });
});