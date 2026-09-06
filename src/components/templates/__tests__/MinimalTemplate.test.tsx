import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MinimalTemplate } from "../MinimalTemplate";
import { makeTemplateProps } from "./fixture";

afterEach(() => cleanup());

describe("MinimalTemplate", () => {
  it("renders identity, contact, services, portfolio and socials", () => {
    const { container } = render(<MinimalTemplate {...makeTemplateProps()} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Awa Konaté");
    expect(screen.getByText("Photographe à Abidjan")).toBeInTheDocument();
    expect(screen.getByText("Mes services")).toBeInTheDocument();
    expect(screen.getByText("Séance studio")).toBeInTheDocument();
    expect(screen.getByText("Mes réalisations")).toBeInTheDocument();
    expect(screen.getByText("Me retrouver")).toBeInTheDocument();
  });

  it("uses the Signature language: large display name, hairline-divided services, no gray cards", () => {
    render(<MinimalTemplate {...makeTemplateProps()} />);
    expect(screen.getByTestId("t-name").classList.contains("text-5xl")).toBe(true);
    const services = screen.getByTestId("services");
    expect(services.classList.contains("divide-y")).toBe(true);
    expect(services.querySelectorAll("[class*='rounded-2xl']").length).toBe(0);
    expect(screen.getByTestId("socials")).not.toBeNull();
    expect(screen.getByTestId("cta-wa").getAttribute("href")).toBe("https://wa.me/2250700000000?text=hi");
  });
});