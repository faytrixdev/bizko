import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { StudioTemplate } from "../StudioTemplate";
import { makeTemplateProps } from "./fixture";

afterEach(() => cleanup());

describe("StudioTemplate", () => {
  it("renders the full-bleed hero and sections", () => {
    render(<StudioTemplate {...makeTemplateProps()} />);
    expect(screen.getByText("Awa Konaté")).toBeInTheDocument();
    expect(screen.getByText("Séance studio")).toBeInTheDocument();
    expect(screen.getAllByText("Mes réalisations").length).toBeGreaterThan(0);
  });
});