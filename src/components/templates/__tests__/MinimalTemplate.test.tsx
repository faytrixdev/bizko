import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MinimalTemplate } from "../MinimalTemplate";
import { makeTemplateProps } from "./fixture";

afterEach(() => cleanup());

describe("MinimalTemplate", () => {
  it("renders identity, contact, services, portfolio and socials", () => {
    render(<MinimalTemplate {...makeTemplateProps()} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Awa Konaté");
    expect(screen.getByText("Photographe à Abidjan")).toBeInTheDocument();
    expect(screen.getByText("Mes services")).toBeInTheDocument();
    expect(screen.getByText("Séance studio")).toBeInTheDocument();
    expect(screen.getByText("Mes réalisations")).toBeInTheDocument();
    expect(screen.getByText("Me retrouver")).toBeInTheDocument();
    expect(screen.getByText("Awa Konaté", { selector: "h1" })).toBeInTheDocument();
  });
});