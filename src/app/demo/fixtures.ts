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

// Local AI-generated West African avatar portraits (public/avatars-demo).
const AVATARS = {
  minimal: "/avatars-demo/min-awa.jpg",
  portfolio: "/avatars-demo/min-mamadou.jpg",
  studio: "/avatars-demo/min-yann.jpg",
  edito: "/avatars-demo/min-clara.jpg",
  urban: "/avatars-demo/min-jules.jpg",
  obsidienne: "/avatars-demo/min-nora.jpg",
} as const;

// Local sourced African portfolio visuals (public/portfolios-demo).
const P = {
  minimalWedding: "/portfolios-demo/minimal-wedding.jpg", // couple, tenues traditionnelles
  minimalCouple: "/portfolios-demo/minimal-couple.jpg", // cérémonie africaine
  minimalKiss: "/portfolios-demo/minimal-kiss.jpg", // couple nigérian
  basketWeave: "/portfolios-demo/portfolio-baskets.jpg", // paniers tissés géométriques
  artisanBowls: "/portfolios-demo/portfolio-bowls.png", // bols artisanaux marocains
  afroInterior: "/portfolios-demo/portfolio-interior.jpg", // intérieur art africain
  bwPortrait1: "/portfolios-demo/studio-portrait1.jpg", // portrait N&B
  bwPortrait2: "/portfolios-demo/studio-portrait2.png", // portrait N&B Lagos
  bwPortrait3: "/portfolios-demo/studio-portrait3.jpg", // portrait N&B dramatique
  bambooDecor: "/portfolios-demo/edito-bamboo.jpg", // déco bambou chaleureuse
  moroccanCeiling: "/portfolios-demo/edito-moroccan.jpg", // plafond marocain
  kaftanInterior: "/portfolios-demo/edito-kaftan.jpg", // kaftan en intérieur africain
  durbanMural: "/portfolios-demo/urban-graffiti.jpg", // graff mural Durban
  streetFace: "/portfolios-demo/urban-face.jpg", // street-art portrait
  waxFabric: "/portfolios-demo/urban-wax.jpg", // tissus wax colorés
  runwayGown: "/portfolios-demo/obsidienne-runway.jpg", // robe noire défilé
  coutureMan: "/portfolios-demo/obsidienne-man.jpg", // homme tenue nigériane
  obsidianBaskets: "/portfolios-demo/obsidienne-baskets.jpg", // paniers africains sur noir
  nairobiHeaddress: "/portfolios-demo/obsidienne-nairobi-head.jpg", // mode avant-garde Nairobi
  patternBags: "/portfolios-demo/portfolio-pattern-bags.jpg", // mains/ordures africaines sur fond sombre
  bwSmoke: "/portfolios-demo/studio-bw-smoke.jpg", // portrait N&B fumée
  africanLivingRoom: "/portfolios-demo/edito-african-livingroom.jpg", // salon africain moderne
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
      avatar_url: AVATARS.minimal,
    },
    services: [
      { id: "s1", profile_id: "demo-minimal", title: "Séance portrait", description: "1h de shooting en extérieur ou studio.", price: 25000, currency: "XOF", position: 0 },
      { id: "s2", profile_id: "demo-minimal", title: "Mariage (journée)", description: "Couverture complète, 8h, livreur 300 photos retouchées.", price: 150000, currency: "XOF", position: 1 },
      { id: "s3", profile_id: "demo-minimal", title: "Pack évènement", description: "Baptême, anniversaire, remise de diplôme — 3h.", price: 75000, currency: "XOF", position: 2 },
    ],
    portfolio: [
      { id: "pf1", profile_id: "demo-minimal", media_url: P.minimalWedding, media_type: "image", thumbnail_url: P.minimalWedding, title: "Mariage Koffi", position: 0 },
      { id: "pf2", profile_id: "demo-minimal", media_url: P.minimalCouple, media_type: "image", thumbnail_url: P.minimalCouple, title: "Cérémonie Akpé", position: 1 },
      { id: "pf3", profile_id: "demo-minimal", media_url: P.minimalKiss, media_type: "image", thumbnail_url: P.minimalKiss, title: "Couple", position: 2 },
    ],
    socials: [
      { id: "so1", profile_id: "demo-minimal", platform: "instagram", url: "https://instagram.com", position: 0 },
      { id: "so2", profile_id: "demo-minimal", platform: "tiktok", url: "https://tiktok.com", position: 1 },
      { id: "so3", profile_id: "demo-minimal", platform: "whatsapp", url: "https://wa.link/demo", position: 2 },
      { id: "so4", profile_id: "demo-minimal", platform: "website", url: "https://example.com", position: 3 },
    ],
    testimonials: [
      { id: "t1", authorName: "Mariam", authorRole: "Mariée", content: "Des photos magnifiques, Awa a su capturer chaque émotion.", rating: 5, createdAt: "2026-05-12T00:00:00Z" },
      { id: "t2", authorName: "Jean-Marc", authorRole: "Époux", content: "Un cadre impeccable, des souvenirs pour la vie.", rating: 5, createdAt: "2026-04-30T00:00:00Z" },
      { id: "t3", authorName: "Sophie", authorRole: "Célébrant", content: "Gentillesse et professionnalisme du début à la fin.", rating: 4, createdAt: "2026-03-18T00:00:00Z" },
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
      avatar_url: AVATARS.portfolio,
    },
    services: [
      { id: "s1", profile_id: "demo-portfolio", title: "Logo & identité", description: "Logo + déclinaisons + charte graphique.", price: 120000, currency: "XOF", position: 0 },
      { id: "s2", profile_id: "demo-portfolio", title: "Direction artistique", description: "Pour vos campagnes et réseaux sociaux.", price: 200000, currency: "XOF", position: 1 },
    ],
    portfolio: [
      { id: "pf1", profile_id: "demo-portfolio", media_url: P.basketWeave, media_type: "image", thumbnail_url: P.basketWeave, title: "Paniers tissés", position: 0 },
      { id: "pf2", profile_id: "demo-portfolio", media_url: P.artisanBowls, media_type: "image", thumbnail_url: P.artisanBowls, title: "Artisanat", position: 1 },
      { id: "pf3", profile_id: "demo-portfolio", media_url: P.afroInterior, media_type: "image", thumbnail_url: P.afroInterior, title: "Direction artistique", position: 2 },
      { id: "pf4", profile_id: "demo-portfolio", media_url: P.patternBags, media_type: "image", thumbnail_url: P.patternBags, title: "Packaging patterns", position: 3 },
    ],
    socials: [
      { id: "so1", profile_id: "demo-portfolio", platform: "instagram", url: "https://instagram.com", position: 0 },
      { id: "so2", profile_id: "demo-portfolio", platform: "behance", url: "https://behance.net", position: 1 },
      { id: "so3", profile_id: "demo-portfolio", platform: "linkedin", url: "https://linkedin.com", position: 2 },
      { id: "so4", profile_id: "demo-portfolio", platform: "website", url: "https://example.com", position: 3 },
    ],
    testimonials: [
      { id: "t1", authorName: "Fatou", authorRole: "CEO, Yasuka", content: "Mamadou a transformé notre marque. Un vrai professionnel.", rating: 5, createdAt: "2026-04-02T00:00:00Z" },
      { id: "t2", authorName: "Ibrahima", authorRole: "Restaurateur", content: "Un logo qui nous ressemble enfin, livré dans les temps.", rating: 5, createdAt: "2026-03-22T00:00:00Z" },
      { id: "t3", authorName: "Laetitia", authorRole: "PME", content: "Rigueur, écoute et sens du détail : rare.", rating: 4, createdAt: "2026-02-14T00:00:00Z" },
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
      avatar_url: AVATARS.studio,
    },
    services: [
      { id: "s1", profile_id: "demo-studio", title: "Portrait corporate", description: "Photo professionnelle pour CV et LinkedIn.", price: 30000, currency: "XOF", position: 0 },
      { id: "s2", profile_id: "demo-studio", title: "Shooting éditorial", description: "Séance complète pour magazine ou portfolio.", price: 90000, currency: "XOF", position: 1 },
      { id: "s3", profile_id: "demo-studio", title: "Direction artistique", description: "Conception du concept et de la scénographie.", price: 120000, currency: "XOF", position: 2 },
    ],
    portfolio: [
      { id: "pf1", profile_id: "demo-studio", media_url: P.bwPortrait1, media_type: "image", thumbnail_url: P.bwPortrait1, title: "Série studio", position: 0 },
      { id: "pf2", profile_id: "demo-studio", media_url: P.bwPortrait2, media_type: "image", thumbnail_url: P.bwPortrait2, title: "Portrait Lagos", position: 1 },
      { id: "pf3", profile_id: "demo-studio", media_url: P.bwPortrait3, media_type: "image", thumbnail_url: P.bwPortrait3, title: "Portrait dramatique", position: 2 },
      { id: "pf4", profile_id: "demo-studio", media_url: P.bwSmoke, media_type: "image", thumbnail_url: P.bwSmoke, title: "Série fumée", position: 3 },
    ],
    socials: [
      { id: "so1", profile_id: "demo-studio", platform: "instagram", url: "https://instagram.com", position: 0 },
      { id: "so2", profile_id: "demo-studio", platform: "tiktok", url: "https://tiktok.com", position: 1 },
      { id: "so3", profile_id: "demo-studio", platform: "linkedin", url: "https://linkedin.com", position: 2 },
      { id: "so4", profile_id: "demo-studio", platform: "website", url: "https://example.com", position: 3 },
    ],
    testimonials: [
      { id: "t1", authorName: "Bérénice", authorRole: "Entrepreneuse", content: "Un rendu d'une élégance rare. Je recommande vivement.", rating: 5, createdAt: "2026-06-20T00:00:00Z" },
      { id: "t2", authorName: "Didier", authorRole: "PME Abidjan", content: "Des portraits corporate impeccables, livrés en 48h.", rating: 5, createdAt: "2026-05-30T00:00:00Z" },
      { id: "t3", authorName: "Nadège", authorRole: "Organisatrice", content: "Yann capte l'essentiel en une fraction de seconde.", rating: 4, createdAt: "2026-04-11T00:00:00Z" },
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
      avatar_url: AVATARS.edito,
    },
    services: [
      { id: "s1", profile_id: "demo-edito", title: "Moodboard & conseil", description: "Première vision de votre espace.", price: 200, currency: "USD", position: 0 },
      { id: "s2", profile_id: "demo-edito", title: "Aménagement complet", description: "Plan + suivi de chantier + décoration.", price: 1500, currency: "USD", position: 1 },
      { id: "s3", profile_id: "demo-edito", title: "Rénovation clé en main", description: "De l'esquisse à la remise des clés.", price: 5000, currency: "USD", position: 2 },
    ],
    portfolio: [
      { id: "pf1", profile_id: "demo-edito", media_url: P.bambooDecor, media_type: "image", thumbnail_url: P.bambooDecor, title: "Décor bambou", position: 0 },
      { id: "pf2", profile_id: "demo-edito", media_url: P.moroccanCeiling, media_type: "image", thumbnail_url: P.moroccanCeiling, title: "Plafond marocain", position: 1 },
      { id: "pf3", profile_id: "demo-edito", media_url: P.kaftanInterior, media_type: "image", thumbnail_url: P.kaftanInterior, title: "Ambiance kaftan", position: 2 },
      { id: "pf4", profile_id: "demo-edito", media_url: P.africanLivingRoom, media_type: "image", thumbnail_url: P.africanLivingRoom, title: "Salon référence", position: 3 },
    ],
    socials: [
      { id: "so1", profile_id: "demo-edito", platform: "instagram", url: "https://instagram.com", position: 0 },
      { id: "so2", profile_id: "demo-edito", platform: "pinterest", url: "https://pinterest.com", position: 1 },
      { id: "so3", profile_id: "demo-edito", platform: "website", url: "https://example.com", position: 2 },
    ],
    testimonials: [
      { id: "t1", authorName: "Efua", authorRole: "Propriétaire", content: "Clara a transformé mon appartement en un lieu d'exception.", rating: 5, createdAt: "2026-03-15T00:00:00Z" },
      { id: "t2", authorName: "Kwame", authorRole: "Architecte", content: "Une vision juste, des matériaux bien choisis, un vrai dialogue.", rating: 5, createdAt: "2026-02-20T00:00:00Z" },
      { id: "t3", authorName: "Amélie", authorRole: "Locataire", content: "Le résultat dépasse largement mes attentes.", rating: 4, createdAt: "2026-01-27T00:00:00Z" },
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
      avatar_url: AVATARS.urban,
    },
    services: [
      { id: "s1", profile_id: "demo-urban", title: "Fresque murale", description: "Conception et réalisation sur site.", price: 350000, currency: "XOF", position: 0 },
      { id: "s2", profile_id: "demo-urban", title: "Identité street", description: "Logo, visuels et affiches pour événements.", price: 150000, currency: "XOF", position: 1 },
      { id: "s3", profile_id: "demo-urban", title: "Visuels réseaux", description: "Kit de contenu dynamique pour vos réseaux.", price: 80000, currency: "XOF", position: 2 },
    ],
    portfolio: [
      { id: "pf1", profile_id: "demo-urban", media_url: P.durbanMural, media_type: "image", thumbnail_url: P.durbanMural, title: "Mural Durban", position: 0 },
      { id: "pf2", profile_id: "demo-urban", media_url: P.waxFabric, media_type: "image", thumbnail_url: P.waxFabric, title: "Matière wax", position: 1 },
      { id: "pf3", profile_id: "demo-urban", media_url: P.streetFace, media_type: "image", thumbnail_url: P.streetFace, title: "Street-art", position: 2 },
    ],
    socials: [
      { id: "so1", profile_id: "demo-urban", platform: "instagram", url: "https://instagram.com", position: 0 },
      { id: "so2", profile_id: "demo-urban", platform: "tiktok", url: "https://tiktok.com", position: 1 },
      { id: "so3", profile_id: "demo-urban", platform: "youtube", url: "https://youtube.com", position: 2 },
      { id: "so4", profile_id: "demo-urban", platform: "x", url: "https://x.com", position: 3 },
    ],
    testimonials: [
      { id: "t1", authorName: "Sékou", authorRole: "Festival Waga", content: "Une fresque incroyable qui a donné vie à notre festival.", rating: 5, createdAt: "2026-07-01T00:00:00Z" },
      { id: "t2", authorName: "Moussa", authorRole: "DJ, Ouaga", content: "Un visuel street qui claque sur toutes nos affiches.", rating: 5, createdAt: "2026-06-12T00:00:00Z" },
      { id: "t3", authorName: "Claire", authorRole: "Marque", content: "De l'énergie, des idées, et une exécution carrée.", rating: 4, createdAt: "2026-05-03T00:00:00Z" },
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
      avatar_url: AVATARS.obsidienne,
    },
    services: [
      { id: "s1", profile_id: "demo-obsidienne", title: "Robe sur mesure", description: "Création unique, 2 essayages inclus.", price: 300000, currency: "XOF", position: 0 },
      { id: "s2", profile_id: "demo-obsidienne", title: "Costume homme", description: "Coupe contemporaine, tissus premium.", price: 250000, currency: "XOF", position: 1 },
      { id: "s3", profile_id: "demo-obsidienne", title: "Collection capsule", description: "Petite série cohérente pour marque.", price: 900000, currency: "XOF", position: 2 },
    ],
    portfolio: [
      { id: "pf1", profile_id: "demo-obsidienne", media_url: P.runwayGown, media_type: "image", thumbnail_url: P.runwayGown, title: "Collection haute couture", position: 0 },
      { id: "pf2", profile_id: "demo-obsidienne", media_url: P.coutureMan, media_type: "image", thumbnail_url: P.coutureMan, title: "Tenue couture", position: 1 },
      { id: "pf3", profile_id: "demo-obsidienne", media_url: P.obsidianBaskets, media_type: "image", thumbnail_url: P.obsidianBaskets, title: "Matières", position: 2 },
      { id: "pf4", profile_id: "demo-obsidienne", media_url: P.nairobiHeaddress, media_type: "image", thumbnail_url: P.nairobiHeaddress, title: "Avant-garde Nairobi", position: 3 },
    ],
    socials: [
      { id: "so1", profile_id: "demo-obsidienne", platform: "instagram", url: "https://instagram.com", position: 0 },
      { id: "so2", profile_id: "demo-obsidienne", platform: "tiktok", url: "https://tiktok.com", position: 1 },
      { id: "so3", profile_id: "demo-obsidienne", platform: "whatsapp", url: "https://wa.link/demo", position: 2 },
      { id: "so4", profile_id: "demo-obsidienne", platform: "website", url: "https://example.com", position: 3 },
    ],
    testimonials: [
      { id: "t1", authorName: "Aïcha", authorRole: "Cliente", content: "Une robe d'exception, d'une finesse incomparable. Merci Nora.", rating: 5, createdAt: "2026-05-28T00:00:00Z" },
      { id: "t2", authorName: "Mamadou", authorRole: "Marié", content: "Un costume d'une coupe parfaite, accueil impeccable.", rating: 5, createdAt: "2026-05-02T00:00:00Z" },
      { id: "t3", authorName: "Rosalie", authorRole: "Styliste", content: "Nora maîtrise les matières comme personne.", rating: 5, createdAt: "2026-03-09T00:00:00Z" },
    ],
    msg,
    locale: "fr",
    links: wa("+2210700000006"),
    trackClick,
  },
};

export const DEMO_TEMPLATE_IDS: Template[] = ["minimal", "portfolio", "studio", "edito", "urban", "obsidienne"];
