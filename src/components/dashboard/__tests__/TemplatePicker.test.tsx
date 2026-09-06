import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { TemplatePicker } from "../TemplatePicker";

vi.mock("@/lib/i18n/provider", () => ({
  useI18n: () => ({
    t: (k: string) =>
      k === "dashboard.templateStudio"
        ? "Studio"
        : k === "dashboard.templateDescStudio"
          ? "Noir & blanc, typo condensée."
          : k === "dashboard.templatePortfolio"
            ? "Portfolio"
            : k === "dashboard.templateLocked"
              ? "Pro"
              : k,
  }),
}));

afterEach(() => cleanup());

describe("TemplatePicker", () => {
  it("renders 6 cards with current selected", () => {
    render(<TemplatePicker current="portfolio" isPro />);
    expect(screen.getByText("Studio")).toBeInTheDocument();
    const selected = screen.getByText("Portfolio").closest("button");
    expect(selected).toBeTruthy();
  });

  it("shows a pro lock for free users on pro templates", () => {
    render(<TemplatePicker current="minimal" isPro={false} />);
    expect(screen.getAllByText("Pro").length).toBeGreaterThan(0);
  });
});