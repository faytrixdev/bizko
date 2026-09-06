import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { StudioTemplate } from "../StudioTemplate";
import { makeTemplateProps } from "./fixture";

afterEach(() => cleanup());

describe("StudioTemplate", () => {
  it("renders dark editorial hero with identity and contact", () => {
    render(<StudioTemplate {...makeTemplateProps()} />);
    expect(screen.getByText("Awa Konaté")).toBeInTheDocument();
    expect(screen.getByText("Photographe à Abidjan")).toBeInTheDocument();
    expect(screen.getByText("Mes services")).toBeInTheDocument();
    expect(screen.getByText("Mes réalisations")).toBeInTheDocument();
    expect(screen.getByText("Me retrouver")).toBeInTheDocument();
  });

  it("has a black hero with lime accent and ruled sections", () => {
    const { container } = render(<StudioTemplate {...makeTemplateProps()} />);
    const hero = container.querySelector("header");
    expect(hero?.classList.contains("bg-[#0A0A0A]")).toBe(true);
    expect(screen.getByText("Awa Konaté").classList.contains("uppercase")).toBe(true);
    expect(screen.getByTestId("services")).not.toBeNull();
  });
});