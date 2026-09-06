export type SuggestionType = 'bio' | 'services' | 'portfolio' | 'pro_cta'

export interface Suggestion {
  type: SuggestionType
  titleKey: string
  descriptionKey: string
  ctaKey: string
}

export interface DigestData {
  services: Array<{ id: string; profile_id: string; title: string; price: number | null; currency: string; position: number }>
  portfolioItems: Array<{ id: string; profile_id: string; media_url: string; media_type: 'image' | 'video'; title: string | null; position: number }>
  isPro: boolean
}

export interface Profile {
  id: string
  username: string
  display_name: string
  tagline: string
  bio: string | null
  city: string
  country: string
  phone_e164: string
  email_public: string | null
  template: string
  locale: string
  avatar_url: string | null
}

const SUGGESTIONS: Record<SuggestionType, Suggestion> = {
  bio: {
    type: 'bio',
    titleKey: 'digest.suggestions.bio.title',
    descriptionKey: 'digest.suggestions.bio.description',
    ctaKey: 'digest.suggestions.bio.cta',
  },
  services: {
    type: 'services',
    titleKey: 'digest.suggestions.services.title',
    descriptionKey: 'digest.suggestions.services.description',
    ctaKey: 'digest.suggestions.services.cta',
  },
  portfolio: {
    type: 'portfolio',
    titleKey: 'digest.suggestions.portfolio.title',
    descriptionKey: 'digest.suggestions.portfolio.description',
    ctaKey: 'digest.suggestions.portfolio.cta',
  },
  pro_cta: {
    type: 'pro_cta',
    titleKey: 'digest.suggestions.pro_cta.title',
    descriptionKey: 'digest.suggestions.pro_cta.description',
    ctaKey: 'digest.suggestions.pro_cta.cta',
  },
}

function hasBio(profile: Profile): boolean {
  return profile.bio !== null && profile.bio.trim().length > 0
}

function hasEnoughServices(digestData: DigestData): boolean {
  return digestData.services.length >= 3
}

function hasPortfolioItems(digestData: DigestData): boolean {
  return digestData.portfolioItems.length > 0
}

export function selectSuggestion(profile: Profile, digestData: DigestData): Suggestion | null {
  if (!hasBio(profile)) {
    return SUGGESTIONS.bio
  }

  if (!hasEnoughServices(digestData)) {
    return SUGGESTIONS.services
  }

  if (!hasPortfolioItems(digestData)) {
    return SUGGESTIONS.portfolio
  }

  if (!digestData.isPro) {
    return SUGGESTIONS.pro_cta
  }

  return null
}