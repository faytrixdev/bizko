import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { UrbanTemplate } from "../UrbanTemplate";
import { makeTemplateProps } from "./fixture";

afterEach(() => cleanup());

describe("UrbanTemplate", () => {
  it("renders the vibrant layout", () => {
    render(<UrbanTemplate {...makeTemplateProps()} />);
    expect(screen.getByText("Awa Konaté")).toBeInTheDocument();
    expect(screen.getByText("Séance studio")).toBeInTheDocument();
    expect(screen.getByText("Me retrouver")).toBeInTheDocument();
  });
});