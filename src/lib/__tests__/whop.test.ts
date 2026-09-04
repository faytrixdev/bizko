import { describe, it, expect } from "vitest";
import { createHmac } from "crypto";
import { verifyWebhook } from "../whop";

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
