import { describe, it, expect } from "vitest";
import { CATEGORIES, isCategory } from "@/lib/categories";
import fr from "../../../messages/fr.json";
import en from "../../../messages/en.json";

describe("categories", () => {
  it("have unique slugs", () => {
    expect(new Set(CATEGORIES).size).toBe(CATEGORIES.length);
    expect(CATEGORIES.length).toBeGreaterThanOrEqual(3);
  });
  it("isCategory guards values", () => {
    expect(isCategory("photo")).toBe(true);
    expect(isCategory("inexistant")).toBe(false);
  });
  it("every slug is localized in fr and en", () => {
    for (const slug of CATEGORIES) {
      expect(fr.categories?.[slug]).toBeTruthy();
      expect(en.categories?.[slug]).toBeTruthy();
    }
  });
});
