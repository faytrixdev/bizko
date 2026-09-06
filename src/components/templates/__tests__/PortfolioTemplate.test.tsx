import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { PortfolioTemplate } from "../PortfolioTemplate";
import { makeTemplateProps } from "./fixture";

afterEach(() => cleanup());

describe("PortfolioTemplate", () => {
  it("renders the card header and key sections", () => {
    render(<PortfolioTemplate {...makeTemplateProps()} />);
    expect(screen.getAllByRole("heading", { level: 1 }).length).toBeGreaterThan(0);
    expect(screen.getByText("Awa Konaté")).toBeInTheDocument();
    expect(screen.getByText("Séance studio")).toBeInTheDocument();
    expect(screen.getByText("Me retrouver")).toBeInTheDocument();
  });
});