import { describe, it, expect } from "vitest";
import {
  TEMPLATE_CONFIGS,
  getTemplateConfig,
  canUseTemplate,
  isTemplateId,
} from "../template-config";

describe("template-config", () => {
  it("exposes 6 templates", () => {
    expect(TEMPLATE_CONFIGS).toHaveLength(6);
  });

  it("has exactly 2 free and 4 pro templates", () => {
    expect(TEMPLATE_CONFIGS.filter((t) => t.tier === "free")).toHaveLength(2);
    expect(TEMPLATE_CONFIGS.filter((t) => t.tier === "pro")).toHaveLength(4);
  });

  it("has unique ids", () => {
    const ids = TEMPLATE_CONFIGS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps free templates first (picker order)", () => {
    const tiers = TEMPLATE_CONFIGS.map((t) => t.tier);
    const firstPro = tiers.indexOf("pro");
    expect(tiers.slice(0, firstPro).every((t) => t === "free")).toBe(true);
  });

  it("resolves a known id", () => {
    expect(getTemplateConfig("studio").id).toBe("studio");
  });

  it("falls back to minimal for unknown/null/undefined ids", () => {
    expect(getTemplateConfig("bogus").id).toBe("minimal");
    expect(getTemplateConfig(null).id).toBe("minimal");
    expect(getTemplateConfig(undefined).id).toBe("minimal");
  });

  it("gates templates by plan", () => {
    expect(canUseTemplate("free", "minimal")).toBe(true);
    expect(canUseTemplate("free", "portfolio")).toBe(true);
    expect(canUseTemplate("free", "studio")).toBe(false);
    expect(canUseTemplate("free", "obsidienne")).toBe(false);
    expect(canUseTemplate("pro", "studio")).toBe(true);
    expect(canUseTemplate("pro", "minimal")).toBe(true);
    expect(canUseTemplate("pro", "bogus")).toBe(false);
  });

  it("guards template ids", () => {
    expect(isTemplateId("studio")).toBe(true);
    expect(isTemplateId("bogus")).toBe(false);
  });
});