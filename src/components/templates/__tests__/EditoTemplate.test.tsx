import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { EditoTemplate } from "../EditoTemplate";
import { makeTemplateProps } from "./fixture";

afterEach(() => cleanup());

describe("EditoTemplate", () => {
  it("renders serif editorial identity and contact", () => {
    render(<EditoTemplate {...makeTemplateProps()} />);
    expect(screen.getByText("Awa Konaté")).toBeInTheDocument();
    expect(screen.getByText("Photographe à Abidjan")).toBeInTheDocument();
    expect(screen.getByText("Mes services")).toBeInTheDocument();
    expect(screen.getByText("01")).toBeInTheDocument();
  });

  it("wraps the bio in a pull-quote blockquote", () => {
    const { container } = render(<EditoTemplate {...makeTemplateProps()} />);
    const quote = container.querySelector("blockquote");
    expect(quote).not.toBeNull();
    expect(quote?.textContent).toContain("Je capture les moments qui comptent.");
  });
});