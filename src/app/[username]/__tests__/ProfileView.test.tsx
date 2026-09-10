import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ProfileView } from "../ProfileView";
import type { Messages } from "@/lib/i18n/messages";

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ rpc: () => Promise.resolve({ error: null }) }),
  isSupabaseConfigured: () => true,
}));

afterEach(() => cleanup());

const msg = {
  profile: {
    services: "Mes services",
    portfolio: "Mes réalisations",
    socials: "Me retrouver",
    whatsapp: "WhatsApp",
    call: "Appeler",
    demandBtn: "Demander",
    madeWith: "Fait avec",
    stickyWa: "Discuter sur WhatsApp",
    testimonials: { title: "Témoignages", subtitle: "…", starsAria: "Note" },
  },
} as unknown as Messages;

function props(template = "studio") {
  return {
    profile: {
      id: "p1",
      username: "awa_photo",
      display_name: "Awa Konaté",
      tagline: "Photographe à Abidjan",
      bio: null,
      city: "Abidjan",
      country: "CI",
      phone_e164: "+2250700000000",
      email_public: null,
      template,
      locale: "fr",
      avatar_url: null,
    },
    services: [],
    portfolio: [],
    socials: [],
    testimonials: [],
    locale: "fr",
    msg,
  };
}

describe("ProfileView", () => {
  it("renders the resolved template and tracked CTA", () => {
    render(<ProfileView {...props("studio")} />);
    expect(screen.getByText("Awa Konaté")).toBeInTheDocument();
    const wa = screen.getAllByRole("link").find((a) => (a as HTMLAnchorElement).getAttribute("href")?.includes("api/track-click"));
    expect(wa).toBeTruthy();
  });
});