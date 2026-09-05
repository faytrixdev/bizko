import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ExploreCard } from "../ExploreCard";
import type { ExploreResult } from "@/lib/supabase/queries";

afterEach(() => {
  cleanup();
});

const makeItem = (over: Partial<ExploreResult> = {}): ExploreResult => ({
  id: "id",
  username: "jdupont",
  displayName: "Jean Dupont",
  tagline: "Photographe wedding",
  avatarUrl: null,
  city: "Abidjan",
  country: "CI",
  category: "photo",
  template: "portfolio",
  isPro: false,
  ...over,
});

const strings = { pro: "Pro", categoryLabel: "Photographe", countryLabel: "Côte d'Ivoire" };

describe("ExploreCard", () => {
  it("links to the profile and shows the pro badge when pro", () => {
    render(<ExploreCard item={makeItem({ isPro: true })} strings={strings} />);
    expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/jdupont");
    expect(screen.getByText("Pro")).toBeInTheDocument();
  });
  it("hides pro badge and category chip when absent", () => {
    render(
      <ExploreCard
        item={makeItem({ isPro: false, category: null })}
        strings={{ ...strings, categoryLabel: null }}
      />
    );
    expect(screen.queryByText("Pro")).toBeNull();
    expect(screen.queryByText("Photographe")).toBeNull();
  });
  it("shows initials fallback avatar when no avatar", () => {
    render(<ExploreCard item={makeItem()} strings={strings} />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });
});
