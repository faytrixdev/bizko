import { describe, it, expect } from "vitest";
import { TEMPLATES, getTemplate } from "../templates";

describe("templates registry", () => {
  it("exposes the 6 templates in config order", () => {
    expect(TEMPLATES.map((t) => t.id)).toEqual([
      "minimal",
      "portfolio",
      "studio",
      "edito",
      "urban",
      "obsidienne",
    ]);
  });

  it("keeps free tier on the two first entries", () => {
    expect(TEMPLATES[0].tier).toBe("free");
    expect(TEMPLATES[1].tier).toBe("free");
    expect(TEMPLATES[2].tier).toBe("pro");
  });

  it("resolves a template by id", () => {
    expect(getTemplate("edito").id).toBe("edito");
  });

  it("falls back to minimal for unknown/null/undefined ids", () => {
    expect(getTemplate(null).id).toBe("minimal");
    expect(getTemplate(undefined).id).toBe("minimal");
    expect(getTemplate("bogus").id).toBe("minimal");
  });

  it("provides a component for every template", () => {
    for (const t of TEMPLATES) {
      expect(typeof t.Component).toBe("function");
    }
  });
});