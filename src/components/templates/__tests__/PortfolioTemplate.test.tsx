import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { PortfolioTemplate } from "../PortfolioTemplate";
import { makeTemplateProps } from "./fixture";

afterEach(() => cleanup());

describe("PortfolioTemplate", () => {
  it("renders identity, contact, services and socials", () => {
    render(<PortfolioTemplate {...makeTemplateProps()} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Awa Konaté");
    expect(screen.getByText("Photographe à Abidjan")).toBeInTheDocument();
    expect(screen.getByText("Mes services")).toBeInTheDocument();
    expect(screen.getByText(/Awa Konaté/, { selector: "h1" })).toBeInTheDocument();
  });

  it("is gallery-first: portfolio is present and services stay compact", () => {
    render(<PortfolioTemplate {...makeTemplateProps()} />);
    expect(screen.getByTestId("portfolio")).not.toBeNull();
    expect(screen.getByTestId("services").classList.contains("grid")).toBe(true);
  });
});