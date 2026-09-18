import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ProfileView } from "../ProfileView";
import type { Messages } from "@/lib/i18n/messages";
import type { Profile } from "@/types/database";

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

function renderProfileView(profileOverrides: Partial<Profile> = {}) {
  const base = props();
  return render(<ProfileView {...base} profile={{ ...base.profile, ...profileOverrides }} />);
}

describe("ProfileView", () => {
  it("renders the resolved template and tracked CTA", () => {
    render(<ProfileView {...props("studio")} />);
    expect(screen.getByText("Awa Konaté")).toBeInTheDocument();
    const wa = screen.getAllByRole("link").find((a) => (a as HTMLAnchorElement).getAttribute("href")?.includes("api/track-click"));
    expect(wa).toBeTruthy();
  });

  it("points the Bizko link at the referral URL when the owner is a partner", () => {
    const view = renderProfileView({ is_partner: true, partner_code: "faytrix_x8k2" });
    const link = view.container.querySelector('a[href*="ref=faytrix_x8k2"]');
    expect(link).not.toBeNull();
    expect(link?.textContent).toBe("Bizko");
    expect(link?.getAttribute("href")).toContain("source=profile");
  });

  it("keeps a plain home link for non-partners", () => {
    const view = renderProfileView({});
    const link = view.container.querySelector('a[href="/"]');
    expect(link?.textContent).toBe("Bizko");
  });
});
