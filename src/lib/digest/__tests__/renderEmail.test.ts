import { describe, it, expect } from "vitest";
import { buildDigestEmail } from "../renderEmail";
import { getMessages } from "@/lib/i18n/messages";

const baseInput = {
  displayName: "Jean",
  views: 10,
  clicks: 3,
  prevViews: 4,
  prevClicks: 1,
  topServiceName: "Photographie mariage",
  suggestion: { type: "pro_cta" as const, label: "Passez Pro", url: "https://bizko.pro/pricing" },
  unsubUrl: "https://bizko.pro/api/digest/unsubscribe?profile=abc&sig=xyz",
  isPro: false,
};

describe("buildDigestEmail", () => {
  it("includes stats, suggestion, cta and unsubscribe link for a free user", () => {
    const msg = getMessages("fr");
    const { subject, html } = buildDigestEmail({ ...baseInput, messages: msg });

    expect(html).toContain("10");
    expect(html).toContain("3");
    expect(html).toContain("Passez Pro");
    expect(html).toContain("unsubscribe?profile=abc&sig=xyz");
    expect(subject.length).toBeGreaterThan(0);
  });

  it("omits the cta for a pro user", () => {
    const msg = getMessages("fr");
    const { html } = buildDigestEmail({ ...baseInput, isPro: true, messages: msg });

    expect(html).not.toContain("Passez Pro");
  });

  it("shows positive variation for views increase", () => {
    const msg = getMessages("fr");
    const { html } = buildDigestEmail({ ...baseInput, views: 10, prevViews: 4, messages: msg });

    expect(html).toContain("+");
  });

  it("shows negative variation for views decrease", () => {
    const msg = getMessages("fr");
    const { html } = buildDigestEmail({ ...baseInput, views: 2, prevViews: 4, messages: msg });

    expect(html).toContain("-");
  });

  it("shows neutral variation when views unchanged", () => {
    const msg = getMessages("fr");
    const { html } = buildDigestEmail({ ...baseInput, views: 4, prevViews: 4, messages: msg });

    expect(html).toContain("=");
  });

  it("omits top service when not provided", () => {
    const msg = getMessages("fr");
    const { html } = buildDigestEmail({ ...baseInput, topServiceName: undefined, messages: msg });

    expect(html).not.toContain("Photographie mariage");
  });

  it("omits suggestion when not provided", () => {
    const msg = getMessages("fr");
    const { html } = buildDigestEmail({ ...baseInput, suggestion: null, messages: msg });

    expect(html).not.toContain("Passez Pro");
  });

  it("uses english messages when locale is en", () => {
    const msg = getMessages("en");
    const { subject, html } = buildDigestEmail({ ...baseInput, messages: msg });

    expect(subject).toContain("weekly stats");
    expect(html).toContain("Views");
    expect(html).toContain("WhatsApp clicks");
  });

  it("includes brand in footer", () => {
    const msg = getMessages("fr");
    const { html } = buildDigestEmail({ ...baseInput, messages: msg });

    expect(html).toContain("Bizko");
  });

  it("includes unsubscribe link text", () => {
    const msg = getMessages("fr");
    const { html } = buildDigestEmail({ ...baseInput, messages: msg });

    expect(html).toContain("Se désinscrire");
  });
});