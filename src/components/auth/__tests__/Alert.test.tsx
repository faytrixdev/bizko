import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Alert } from "../Alert";

afterEach(() => {
  cleanup();
});

describe("Alert", () => {
  it("renders error alert", () => {
    render(<Alert type="error">Error message</Alert>);
    expect(screen.getByRole("alert")).toHaveTextContent("Error message");
  });
  it("renders success alert", () => {
    render(<Alert type="success">Success message</Alert>);
    expect(screen.getByRole("alert")).toHaveTextContent("Success message");
  });
  it("returns null when no children", () => {
    const { container } = render(<Alert></Alert>);
    expect(container.firstChild).toBeNull();
  });
});