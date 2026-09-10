import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ComparisonPage from "../page";

vi.mock("@/lib/i18n/messages-server", () => ({
  getServerMessages: async () => ({
    comparison: { title: "Titre", description: "Description" },
    meta: { title: "", description: "" },
  }),
}));

describe("ComparisonPage", () => {
  it("affiche le H1, la ligne du tableau et les CTA", async () => {
    const { container } = render(await ComparisonPage());
    expect(container.querySelector("h1")).not.toBeNull();
    expect(screen.getByText("Bouton WhatsApp contextuel")).toBeInTheDocument();
    expect(screen.getByText("Commencer gratuitement")).toBeInTheDocument();
    expect(screen.getByText("Voir la démo")).toBeInTheDocument();
  });
});