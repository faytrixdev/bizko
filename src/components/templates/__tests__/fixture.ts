import type { TemplateProps, ProfileMessages } from "../types";

const msg = {
  services: "Mes services",
  portfolio: "Mes réalisations",
  socials: "Me retrouver",
  whatsapp: "WhatsApp",
  call: "Appeler",
  demandBtn: "Demander",
  madeWith: "Fait avec",
  stickyWa: "Discuter sur WhatsApp",
  testimonials: { title: "Témoignages", subtitle: "Ce que mes clients disent", starsAria: "Note" },
} satisfies ProfileMessages;

export function makeTemplateProps(overrides: Partial<TemplateProps> = {}): TemplateProps {
  return {
    profile: {
      id: "p1",
      username: "awa_photo",
      display_name: "Awa Konaté",
      tagline: "Photographe à Abidjan",
      bio: "Je capture les moments qui comptent.",
      city: "Abidjan",
      country: "CI",
      phone_e164: "+2250700000000",
      email_public: null,
      template: "minimal",
      locale: "fr",
      avatar_url: null,
    },
    services: [
      { id: "s1", profile_id: "p1", title: "Séance studio", description: "1h en studio", price: 25000, currency: "XOF", position: 1 },
    ],
    portfolio: [
      { id: "pf1", profile_id: "p1", media_url: "https://example.com/a.jpg", media_type: "image", thumbnail_url: null, title: "Mariage", position: 1 },
    ],
    socials: [
      { id: "so1", profile_id: "p1", platform: "instagram", url: "https://instagram.com/awa", position: 1 },
    ],
    testimonials: [
      { id: "t1", authorName: "Mariam", authorRole: "Cliente", content: "Superbe travail", rating: 5, createdAt: "2026-08-01T00:00:00Z" },
    ],
    msg,
    locale: "fr",
    links: { mainWa: "https://wa.me/2250700000000?text=hi", telLink: "tel:+2250700000000" },
    trackClick: (type: string, to: string) => `/api/track-click?pid=p1&type=${type}&to=${encodeURIComponent(to)}`,
    ...overrides,
  };
}