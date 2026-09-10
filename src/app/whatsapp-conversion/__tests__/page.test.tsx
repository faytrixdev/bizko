import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import WhatsAppConversionPage from "../page";

vi.mock("@/lib/i18n/messages-server", () => ({
  getServerMessages: async () => ({
    whatsappConversion: { title: "Titre", description: "Description" },
    meta: { title: "", description: "" },
  }),
}));

describe("WhatsAppConversionPage", () => {
  it("affiche le H1 et les sections clés", async () => {
    const { container } = render(await WhatsAppConversionPage());
    expect(container.querySelector("h1")).not.toBeNull();
    expect(screen.getByText("Commencer gratuitement")).toBeInTheDocument();
    expect(screen.getByText("Voir la démo")).toBeInTheDocument();
    expect(screen.getByText("Le problème des liens en bio génériques")).toBeInTheDocument();
    expect(screen.getByText("La solution Bizko : WhatsApp contextuel par service")).toBeInTheDocument();
  });
});