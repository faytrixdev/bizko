import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ObsidienneTemplate } from "../ObsidienneTemplate";
import { makeTemplateProps } from "./fixture";

afterEach(() => cleanup());

describe("ObsidienneTemplate", () => {
  it("renders dark luxury identity and contact", () => {
    const { container } = render(<ObsidienneTemplate {...makeTemplateProps()} />);
    expect(screen.getByText("Awa Konaté")).toBeInTheDocument();
    expect(screen.getByText("Photographe à Abidjan")).toBeInTheDocument();
    expect(screen.getByText("Mes services")).toBeInTheDocument();
    expect(container.querySelector("[data-testid='halo']")).not.toBeNull();
  });

  it("uses glass panels for services with gold accent", () => {
    render(<ObsidienneTemplate {...makeTemplateProps()} />);
    const service = screen.getByText("Séance studio").closest("[data-testid='service-item']");
    expect(service?.classList.contains("backdrop-blur-md")).toBe(true);
    expect(service?.classList.contains("border-white/10")).toBe(true);
  });
});