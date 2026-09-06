import type { TemplateProps, ProfileMessages } from "@/components/templates/types";
import type { Template } from "@/types/database";

// Shared demo copy (namespace profile). Complète pour le typage strict.
const msg = {
  services: "Mes services",
  portfolio: "Mes réalisations",
  socials: "Me retrouver",
  whatsapp: "WhatsApp",
  call: "Appeler",
  demandBtn: "Demander",
  madeWith: "Fait avec",
  stickyWa: "Discuter sur WhatsApp",
  metaFallback: "Contactez-moi directement.",
  whatsappAria: "Ouvrir WhatsApp",
  testimonials: {
    title: "Témoignages",
    subtitle: "Ce que mes clients disent",
    formTitle: "Laisser un avis",
    namePlaceholder: "Votre nom",
    rolePlaceholder: "Votre métier",
    contentPlaceholder: "Votre avis",
    ratingLabel: "Note",
    noRating: "Aucune note",
    submit: "Envoyer",
    pendingSuccess: "Merci !",
    errorMissing: "Champs manquants",
    errorGeneric: "Erreur",
    errorRateLimited: "Trop de demandes",
    errorHoneypot: "Invalide",
    starsAria: "Note",
  },
} satisfies ProfileMessages;

const u = (id: string, w = 800, h = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

// Stable Unsplash photo IDs used for avatars & portfolio visuals.
const AVATARS = {
  minimal: "photo-1494790108377-be9c29b29330", // woman portrait
  portfolio: "photo-1507003211169-0a1dd7228f2d", // man portrait
  studio: "photo-1519085360753-af0119f7cbe7", // man portrait
  edito: "photo-1438761681033-6461ffad8d80", // woman portrait
  urban: "photo-1500648767791-00dcc994a43e", // man portrait
  obsidienne: "photo-1534528741775-53994a69daeb", // woman portrait
} as const;

const PHOTO = (id: string, w = 800, h = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

// Portfolio visuals per persona (Unsplash).
const P = {
  wedding: PHOTO("photo-1519741497674-611481863552", 800, 800), // wedding
  portrait: PHOTO("photo-1506794778202-cad84cf45f1d", 800, 800), // portrait
  studio: PHOTO("photo-1516035069371-29a1b244cc32", 800, 800), // camera
  landscape: PHOTO("photo-1500530855697-b586d89ba3ee", 800, 800), // landscape
  interior: PHOTO("photo-1618221195710-dd6b41faaea6", 800, 800), // interior
  brand: PHOTO("photo-1561070791-2526d30994b5", 800, 800), // design
  fashion: PHOTO("photo-1445205170230-053b83016050", 800, 800), // fashion
  makeup: PHOTO("photo-1522337360788-8b13dee7a37e", 800, 800), // makeup
  street: PHOTO("photo-1449824913935-59a10b8d2000", 800, 800), // city
  texture: PHOTO("photo-1509718443690-d8e2fb3474b7", 800, 800), // fabric
} as const;

function wa(phone: string): { mainWa: string; telLink: string } {
  return {
    mainWa: `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent("Bonjour, je vous contacte depuis votre profil Bizko.")}`,
    telLink: `tel:${phone}`,
  };
}

const trackClick = (type: string, to: string) =>
  `/api/track-click?pid=demo&type=${type}&to=${encodeURIComponent(to)}`;

export const DEMO_FIXTURES: Record<Template, TemplateProps> = {
  minimal: {
    profile: {
      id: "demo-minimal",
      username: "awa.photo",
      display_name: "Awa Diallo",
      tagline: "Photographe de moments qui comptent",
      bio: "Je capture l'essence de vos plus beaux moments : mariages, portraits et évènements à Abidjan. Approche naturelle, livraison rapide et photos que vous voudrez encadrer.",
      city: "Abidjan",
      country: "CI",
      phone_e164: "+2250700000001",
      email_public: "awa@exemple.com",
      template: "minimal",
      locale: "fr",
      avatar_url: u(AVATARS.minimal, 400, 400),
    },
    services: [
      { id: "s1", profile_id: "demo-minimal", title: "Séance portrait", description: "1h de shooting en extérieur ou studio.", price: 25000, currency: "XOF", position: 0 },
      { id: "s2", profile_id: "demo-minimal", title: "Mariage (journée)", description: "Couverture complète, 8h, livreur 300 photos retouchées.", price: 150000, currency: "XOF", position: 1 },
      { id: "s3", profile_id: "demo-minimal", title: "Pack évènement", description: "Baptême, anniversaire, remise de diplôme — 3h.", price: 75000, currency: "XOF", position: 2 },
    ],
    portfolio: [
      { id: "pf1", profile_id: "demo-minimal", media_url: P.wedding, media_type: "image", thumbnail_url: P.wedding, title: "Mariage Koffi", position: 0 },
      { id: "pf2", profile_id: "demo-minimal", media_url: P.portrait, media_type: "image", thumbnail_url: P.portrait, title: "Portrait studio", position: 1 },
      { id: "pf3", profile_id: "demo-minimal", media_url: P.landscape, media_type: "image", thumbnail_url: P.landscape, title: "Paysage", position: 2 },
    ],
    socials: [
      { id: "so1", profile_id: "demo-minimal", platform: "instagram", url: "https://instagram.com", position: 0 },
      { id: "so2", profile_id: "demo-minimal", platform: "tiktok", url: "https://tiktok.com", position: 1 },
    ],
    testimonials: [
      { id: "t1", authorName: "Mariam", authorRole: "Mariée", content: "Des photos magnifiques, Awa a su capturer chaque émotion.", rating: 5, createdAt: "2026-05-12T00:00:00Z" },
    ],
    msg,
    locale: "fr",
    links: wa("+2250700000001"),
    trackClick,
  },

  portfolio: {
    profile: {
      id: "demo-portfolio",
      username: "mamadou.design",
      display_name: "Mamadou Traoré",
      tagline: "Graphiste & illustrateur",
      bio: "Identités visuelles, illustrations et direction artistique pour marques ambitieuses. Basé à Dakar, je travaille avec des clients du monde entier.",
      city: "Dakar",
      country: "SN",
      phone_e164: "+2210700000002",
      email_public: null,
      template: "portfolio",
      locale: "fr",
      avatar_url: u(AVATARS.portfolio, 400, 400),
    },
    services: [
      { id: "s1", profile_id: "demo-portfolio", title: "Logo & identité", description: "Logo + déclinaisons + charte graphique.", price: 120000, currency: "XOF", position: 0 },
      { id: "s2", profile_id: "demo-portfolio", title: "Direction artistique", description: "Pour vos campagnes et réseaux sociaux.", price: 200000, currency: "XOF", position: 1 },
    ],
    portfolio: [
      { id: "pf1", profile_id: "demo-portfolio", media_url: P.brand, media_type: "image", thumbnail_url: P.brand, title: "Identité de marque", position: 0 },
      { id: "pf2", profile_id: "demo-portfolio", media_url: P.studio, media_type: "image", thumbnail_url: P.studio, title: "Packshot studio", position: 1 },
      { id: "pf3", profile_id: "demo-portfolio", media_url: P.interior, media_type: "image", thumbnail_url: P.interior, title: "Moodboard intérieur", position: 2 },
    ],
    socials: [
      { id: "so1", profile_id: "demo-portfolio", platform: "instagram", url: "https://instagram.com", position: 0 },
      { id: "so2", profile_id: "demo-portfolio", platform: "behance", url: "https://behance.net", position: 1 },
    ],
    testimonials: [
      { id: "t1", authorName: "Fatou", authorRole: "CEO, Yasuka", content: "Mamadou a transformé notre marque. Un vrai professionnel.", rating: 5, createdAt: "2026-04-02T00:00:00Z" },
    ],
    msg,
    locale: "fr",
    links: wa("+2210700000002"),
    trackClick,
  },

  studio: {
    profile: {
      id: "demo-studio",
      username: "yann.studio",
      display_name: "Yann Kouassi",
      tagline: "Photographe studio, noir & blanc",
      bio: "Un rendu studio intemporel. Éclairage maîtrisé, direction de pose précise, tirages qui traversent le temps.",
      city: "Abidjan",
      country: "CI",
      phone_e164: "+2250700000003",
      email_public: null,
      template: "studio",
      locale: "fr",
      avatar_url: u(AVATARS.studio, 400, 400),
    },
    services: [
      { id: "s1", profile_id: "demo-studio", title: "Portrait corporate", description: "Photo professionnelle pour CV et LinkedIn.", price: 30000, currency: "XOF", position: 0 },
      { id: "s2", profile_id: "demo-studio", title: "Shooting éditorial", description: "Séance complète pour magazine ou portfolio.", price: 90000, currency: "XOF", position: 1 },
      { id: "s3", profile_id: "demo-studio", title: "Direction artistique", description: "Conception du concept et de la scénographie.", price: 120000, currency: "XOF", position: 2 },
    ],
    portfolio: [
      { id: "pf1", profile_id: "demo-studio", media_url: P.studio, media_type: "image", thumbnail_url: P.studio, title: "Série studio", position: 0 },
      { id: "pf2", profile_id: "demo-studio", media_url: P.portrait, media_type: "image", thumbnail_url: P.portrait, title: "Portrait", position: 1 },
    ],
    socials: [
      { id: "so1", profile_id: "demo-studio", platform: "instagram", url: "https://instagram.com", position: 0 },
    ],
    testimonials: [
      { id: "t1", authorName: "Bérénice", authorRole: "Entrepreneuse", content: "Un rendu d'une élégance rare. Je recommande vivement.", rating: 5, createdAt: "2026-06-20T00:00:00Z" },
    ],
    msg,
    locale: "fr",
    links: wa("+2250700000003"),
    trackClick,
  },

  edito: {
    profile: {
      id: "demo-edito",
      username: "clara.interiordesign",
      display_name: "Clara Mensah",
      tagline: "Architecte d'intérieur",
      bio: "Des espaces pensés comme des œuvres. Matières nobles, lumière naturelle et fonctionnalité pour des intérieurs qui racontent une histoire.",
      city: "Accra",
      country: "GH",
      phone_e164: "+2330700000004",
      email_public: null,
      template: "edito",
      locale: "fr",
      avatar_url: u(AVATARS.edito, 400, 400),
    },
    services: [
      { id: "s1", profile_id: "demo-edito", title: "Moodboard & conseil", description: "Première vision de votre espace.", price: 200, currency: "USD", position: 0 },
      { id: "s2", profile_id: "demo-edito", title: "Aménagement complet", description: "Plan + suivi de chantier + décoration.", price: 1500, currency: "USD", position: 1 },
      { id: "s3", profile_id: "demo-edito", title: "Rénovation clé en main", description: "De l'esquisse à la remise des clés.", price: 5000, currency: "USD", position: 2 },
    ],
    portfolio: [
      { id: "pf1", profile_id: "demo-edito", media_url: P.interior, media_type: "image", thumbnail_url: P.interior, title: "Salon sur mesure", position: 0 },
      { id: "pf2", profile_id: "demo-edito", media_url: P.brand, media_type: "image", thumbnail_url: P.brand, title: "Ambiance minimaliste", position: 1 },
    ],
    socials: [
      { id: "so1", profile_id: "demo-edito", platform: "instagram", url: "https://instagram.com", position: 0 },
      { id: "so2", profile_id: "demo-edito", platform: "pinterest", url: "https://pinterest.com", position: 1 },
    ],
    testimonials: [
      { id: "t1", authorName: "Efua", authorRole: "Propriétaire", content: "Clara a transformé mon appartement en un lieu d'exception.", rating: 5, createdAt: "2026-03-15T00:00:00Z" },
    ],
    msg,
    locale: "fr",
    links: wa("+2330700000004"),
    trackClick,
  },

  urban: {
    profile: {
      id: "demo-urban",
      username: "jules.urban",
      display_name: "Jules Zongo",
      tagline: "Designer urbain & créatif",
      bio: "Motifs, couleurs et énergie de la rue au service de vos projets. Fresques, identités street et campagnes qui marquent.",
      city: "Ouagadougou",
      country: "BF",
      phone_e164: "+2260700000005",
      email_public: null,
      template: "urban",
      locale: "fr",
      avatar_url: u(AVATARS.urban, 400, 400),
    },
    services: [
      { id: "s1", profile_id: "demo-urban", title: "Fresque murale", description: "Conception et réalisation sur site.", price: 350000, currency: "XOF", position: 0 },
      { id: "s2", profile_id: "demo-urban", title: "Identité street", description: "Logo, visuels et affiches pour événements.", price: 150000, currency: "XOF", position: 1 },
      { id: "s3", profile_id: "demo-urban", title: "Visuels réseaux", description: "Kit de contenu dynamique pour vos réseaux.", price: 80000, currency: "XOF", position: 2 },
    ],
    portfolio: [
      { id: "pf1", profile_id: "demo-urban", media_url: P.street, media_type: "image", thumbnail_url: P.street, title: "Série urbaine", position: 0 },
      { id: "pf2", profile_id: "demo-urban", media_url: P.brand, media_type: "image", thumbnail_url: P.brand, title: "Campagne", position: 1 },
      { id: "pf3", profile_id: "demo-urban", media_url: P.texture, media_type: "image", thumbnail_url: P.texture, title: "Textures", position: 2 },
    ],
    socials: [
      { id: "so1", profile_id: "demo-urban", platform: "instagram", url: "https://instagram.com", position: 0 },
      { id: "so2", profile_id: "demo-urban", platform: "tiktok", url: "https://tiktok.com", position: 1 },
    ],
    testimonials: [
      { id: "t1", authorName: "Sékou", authorRole: "Festival Waga", content: "Une fresque incroyable qui a donné vie à notre festival.", rating: 5, createdAt: "2026-07-01T00:00:00Z" },
    ],
    msg,
    locale: "fr",
    links: wa("+2260700000005"),
    trackClick,
  },

  obsidienne: {
    profile: {
      id: "demo-obsidienne",
      username: "nora.couture",
      display_name: "Nora Bamba",
      tagline: "Couture haute gamme",
      bio: "Des créations sur mesure où précision de coupe et matières d'exception se rencontrent. Chaque pièce est unique, conçue pour durer.",
      city: "Dakar",
      country: "SN",
      phone_e164: "+2210700000006",
      email_public: null,
      template: "obsidienne",
      locale: "fr",
      avatar_url: u(AVATARS.obsidienne, 400, 400),
    },
    services: [
      { id: "s1", profile_id: "demo-obsidienne", title: "Robe sur mesure", description: "Création unique, 2 essayages inclus.", price: 300000, currency: "XOF", position: 0 },
      { id: "s2", profile_id: "demo-obsidienne", title: "Costume homme", description: "Coupe contemporaine, tissus premium.", price: 250000, currency: "XOF", position: 1 },
      { id: "s3", profile_id: "demo-obsidienne", title: "Collection capsule", description: "Petite série cohérente pour marque.", price: 900000, currency: "XOF", position: 2 },
    ],
    portfolio: [
      { id: "pf1", profile_id: "demo-obsidienne", media_url: P.fashion, media_type: "image", thumbnail_url: P.fashion, title: "Collection haute couture", position: 0 },
      { id: "pf2", profile_id: "demo-obsidienne", media_url: P.texture, media_type: "image", thumbnail_url: P.texture, title: "Matériaux", position: 1 },
    ],
    socials: [
      { id: "so1", profile_id: "demo-obsidienne", platform: "instagram", url: "https://instagram.com", position: 0 },
    ],
    testimonials: [
      { id: "t1", authorName: "Aïcha", authorRole: "Cliente", content: "Une robe d'exception, d'une finesse incomparable. Merci Nora.", rating: 5, createdAt: "2026-05-28T00:00:00Z" },
    ],
    msg,
    locale: "fr",
    links: wa("+2210700000006"),
    trackClick,
  },
};

export const DEMO_TEMPLATE_IDS: Template[] = ["minimal", "portfolio", "studio", "edito", "urban", "obsidienne"];
