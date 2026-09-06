import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { EditoTemplate } from "../EditoTemplate";
import { makeTemplateProps } from "./fixture";

afterEach(() => cleanup());

describe("EditoTemplate", () => {
  it("renders the serif editorial layout", () => {
    render(<EditoTemplate {...makeTemplateProps()} />);
    expect(screen.getByText("Photographe à Abidjan")).toBeInTheDocument();
    expect(screen.getByText("Séance studio")).toBeInTheDocument();
    expect(screen.getByText("Me retrouver")).toBeInTheDocument();
  });
});