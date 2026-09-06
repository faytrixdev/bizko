import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { UrbanTemplate } from "../UrbanTemplate";
import { makeTemplateProps } from "./fixture";

afterEach(() => cleanup());

describe("UrbanTemplate", () => {
  it("renders energetic identity and contact", () => {
    render(<UrbanTemplate {...makeTemplateProps()} />);
    expect(screen.getByText("Awa Konaté")).toBeInTheDocument();
    expect(screen.getByText("Photographe à Abidjan")).toBeInTheDocument();
    expect(screen.getByText("Mes services")).toBeInTheDocument();
    expect(screen.getByText("Me retrouver")).toBeInTheDocument();
  });

  it("uses the collage language: gradient avatar ring and flat colored service panels (no gray borders)", () => {
    const { container } = render(<UrbanTemplate {...makeTemplateProps({ profile: { ...makeTemplateProps().profile, avatar_url: "https://example.com/ava.jpg" } })} />);
    const ring = container.querySelector("[data-testid='avatar-ring']");
    expect(ring?.classList.contains("from-[#7C3AED]")).toBe(true);
    const service = screen.getByText("Séance studio").closest("[data-testid='service-item']");
    expect(service?.classList.contains("rounded-3xl")).toBe(true);
    expect(service && [...service.classList].some((c) => c.startsWith("bg-[#"))).toBe(true);
  });
});