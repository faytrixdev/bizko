import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PricingAfricaPage from "../page";

vi.mock("@/lib/i18n/messages-server", () => ({
  getServerMessages: async () => ({
    pricingAfrica: { title: "Titre", description: "Description" },
    meta: { title: "", description: "" },
  }),
}));

describe("PricingAfricaPage", () => {
  it("affiche le H1, les plans et la FAQ", async () => {
    const { container } = render(await PricingAfricaPage());
    expect(container.querySelector("h1")).not.toBeNull();
    expect(screen.getByText("Gratuit")).toBeInTheDocument();
    expect(screen.getByText("Pro Annuel")).toBeInTheDocument();
    expect(screen.getByText("Choisissez le plan qui convient à votre activité")).toBeInTheDocument();
    expect(screen.getByText("Y a-t-il des frais cachés ou des engagements ?")).toBeInTheDocument();
    expect(screen.getAllByText("Commencer gratuitement").length).toBeGreaterThan(0);
  });
});