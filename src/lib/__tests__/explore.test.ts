import { describe, it, expect } from "vitest";
import { mapExploreRow, EXPLORE_PAGE_SIZE, type ExploreRow } from "@/lib/supabase/queries";

const row: ExploreRow = {
  id: "u1", username: "awa", display_name: "Awa B", tagline: "Maquillage", avatar_url: "https://img/a.png",
  city: "Abidjan", country: "CI", category: "makeup", template: "portfolio", is_pro: true, total: 3,
};

describe("searchExplore mapping", () => {
  it("maps a row to ExploreResult camelCase", () => {
    const r = mapExploreRow(row);
    expect(r.displayName).toBe("Awa B");
    expect(r.avatarUrl).toBe("https://img/a.png");
    expect(r.isPro).toBe(true);
    expect(r.category).toBe("makeup");
  });
  it("keeps null avatar and category", () => {
    const r = mapExploreRow({ ...row, avatar_url: null, category: null });
    expect(r.avatarUrl).toBeNull();
    expect(r.category).toBeNull();
  });
  it("fixes the page size to 24", () => {
    expect(EXPLORE_PAGE_SIZE).toBe(24);
  });
});
