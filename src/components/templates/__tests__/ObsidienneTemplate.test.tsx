import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ObsidienneTemplate } from "../ObsidienneTemplate";
import { makeTemplateProps } from "./fixture";

afterEach(() => cleanup());

describe("ObsidienneTemplate", () => {
  it("renders the dark premium layout", () => {
    render(<ObsidienneTemplate {...makeTemplateProps()} />);
    expect(screen.getByText("Awa Konaté")).toBeInTheDocument();
    expect(screen.getByText("Séance studio")).toBeInTheDocument();
    expect(screen.getByText("Me retrouver")).toBeInTheDocument();
  });
});