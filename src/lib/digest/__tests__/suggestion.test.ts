import { describe, it, expect } from 'vitest'
import { selectSuggestion, SuggestionType } from '../suggestion'

describe('selectSuggestion', () => {
  const baseProfile = {
    id: 'profile-1',
    username: 'testuser',
    display_name: 'Test User',
    tagline: 'Photographer',
    bio: 'I am a photographer',
    city: 'Abidjan',
    country: 'CI',
    phone_e164: '+2250700000000',
    email_public: 'test@example.com',
    template: 'minimal',
    locale: 'fr',
    avatar_url: null,
  }

  const baseDigestData = {
    services: [
      { id: '1', profile_id: 'profile-1', title: 'Service 1', price: 1000, currency: 'XOF', position: 1 },
      { id: '2', profile_id: 'profile-1', title: 'Service 2', price: 2000, currency: 'XOF', position: 2 },
    ],
    portfolioItems: [
      { id: '1', profile_id: 'profile-1', media_url: 'img1.jpg', media_type: 'image' as const, title: 'Item 1', position: 1 },
    ],
    isPro: true,
  }

  describe('priority 1: no bio', () => {
    it('returns bio suggestion when bio is null', () => {
      const profile = { ...baseProfile, bio: null }
      const result = selectSuggestion(profile, baseDigestData)

      expect(result).toEqual({
        type: 'bio',
        titleKey: 'digest.suggestions.bio.title',
        descriptionKey: 'digest.suggestions.bio.description',
        ctaKey: 'digest.suggestions.bio.cta',
      })
    })

    it('returns bio suggestion when bio is empty string', () => {
      const profile = { ...baseProfile, bio: '' }
      const result = selectSuggestion(profile, baseDigestData)

      expect(result?.type).toBe('bio')
    })

    it('returns bio suggestion even when other conditions also match', () => {
      const profile = { ...baseProfile, bio: null }
      const digestData = {
        ...baseDigestData,
        services: [{ id: '1', profile_id: 'profile-1', title: 'Service 1', price: 1000, currency: 'XOF', position: 1 }],
        portfolioItems: [],
        isPro: false,
      }
      const result = selectSuggestion(profile, digestData)

      expect(result?.type).toBe('bio')
    })
  })

  describe('priority 2: services count < 3', () => {
    it('returns services suggestion when services count is 0', () => {
      const profile = { ...baseProfile }
      const digestData = { ...baseDigestData, services: [], portfolioItems: baseDigestData.portfolioItems, isPro: true }
      const result = selectSuggestion(profile, digestData)

      expect(result).toEqual({
        type: 'services',
        titleKey: 'digest.suggestions.services.title',
        descriptionKey: 'digest.suggestions.services.description',
        ctaKey: 'digest.suggestions.services.cta',
      })
    })

    it('returns services suggestion when services count is 1', () => {
      const profile = { ...baseProfile }
      const digestData = {
        ...baseDigestData,
        services: [{ id: '1', profile_id: 'profile-1', title: 'Service 1', price: 1000, currency: 'XOF', position: 1 }],
      }
      const result = selectSuggestion(profile, digestData)

      expect(result?.type).toBe('services')
    })

    it('returns services suggestion when services count is 2', () => {
      const profile = { ...baseProfile }
      const result = selectSuggestion(profile, baseDigestData)

      expect(result?.type).toBe('services')
    })

    it('does not return services when services count is 3', () => {
      const profile = { ...baseProfile }
      const digestData = {
        ...baseDigestData,
        services: [
          { id: '1', profile_id: 'profile-1', title: 'Service 1', price: 1000, currency: 'XOF', position: 1 },
          { id: '2', profile_id: 'profile-1', title: 'Service 2', price: 2000, currency: 'XOF', position: 2 },
          { id: '3', profile_id: 'profile-1', title: 'Service 3', price: 3000, currency: 'XOF', position: 3 },
        ],
        portfolioItems: [],
        isPro: true,
      }
      const result = selectSuggestion(profile, digestData)

      expect(result?.type).not.toBe('services')
    })
  })

  describe('priority 3: no portfolio items', () => {
    it('returns portfolio suggestion when portfolio items is empty', () => {
      const profile = { ...baseProfile }
      const digestData = {
        ...baseDigestData,
        services: [
          { id: '1', profile_id: 'profile-1', title: 'Service 1', price: 1000, currency: 'XOF', position: 1 },
          { id: '2', profile_id: 'profile-1', title: 'Service 2', price: 2000, currency: 'XOF', position: 2 },
          { id: '3', profile_id: 'profile-1', title: 'Service 3', price: 3000, currency: 'XOF', position: 3 },
        ],
        portfolioItems: [],
        isPro: true,
      }
      const result = selectSuggestion(profile, digestData)

      expect(result).toEqual({
        type: 'portfolio',
        titleKey: 'digest.suggestions.portfolio.title',
        descriptionKey: 'digest.suggestions.portfolio.description',
        ctaKey: 'digest.suggestions.portfolio.cta',
      })
    })

    it('does not return portfolio when portfolio has items', () => {
      const profile = { ...baseProfile }
      const digestData = {
        ...baseDigestData,
        services: [
          { id: '1', profile_id: 'profile-1', title: 'Service 1', price: 1000, currency: 'XOF', position: 1 },
          { id: '2', profile_id: 'profile-1', title: 'Service 2', price: 2000, currency: 'XOF', position: 2 },
          { id: '3', profile_id: 'profile-1', title: 'Service 3', price: 3000, currency: 'XOF', position: 3 },
        ],
        portfolioItems: [{ id: '1', profile_id: 'profile-1', media_url: 'img1.jpg', media_type: 'image' as const, title: 'Item 1', position: 1 }],
        isPro: false,
      }
      const result = selectSuggestion(profile, digestData)

      expect(result?.type).not.toBe('portfolio')
    })
  })

  describe('priority 4: not Pro', () => {
    it('returns pro_cta suggestion when not Pro and all previous conditions pass', () => {
      const profile = { ...baseProfile }
      const digestData = {
        ...baseDigestData,
        services: [
          { id: '1', profile_id: 'profile-1', title: 'Service 1', price: 1000, currency: 'XOF', position: 1 },
          { id: '2', profile_id: 'profile-1', title: 'Service 2', price: 2000, currency: 'XOF', position: 2 },
          { id: '3', profile_id: 'profile-1', title: 'Service 3', price: 3000, currency: 'XOF', position: 3 },
        ],
        portfolioItems: [{ id: '1', profile_id: 'profile-1', media_url: 'img1.jpg', media_type: 'image' as const, title: 'Item 1', position: 1 }],
        isPro: false,
      }
      const result = selectSuggestion(profile, digestData)

      expect(result).toEqual({
        type: 'pro_cta',
        titleKey: 'digest.suggestions.pro_cta.title',
        descriptionKey: 'digest.suggestions.pro_cta.description',
        ctaKey: 'digest.suggestions.pro_cta.cta',
      })
    })

    it('does not return pro_cta when isPro is true', () => {
      const profile = { ...baseProfile }
      const digestData = {
        ...baseDigestData,
        services: [
          { id: '1', profile_id: 'profile-1', title: 'Service 1', price: 1000, currency: 'XOF', position: 1 },
          { id: '2', profile_id: 'profile-1', title: 'Service 2', price: 2000, currency: 'XOF', position: 2 },
          { id: '3', profile_id: 'profile-1', title: 'Service 3', price: 3000, currency: 'XOF', position: 3 },
        ],
        portfolioItems: [{ id: '1', profile_id: 'profile-1', media_url: 'img1.jpg', media_type: 'image' as const, title: 'Item 1', position: 1 }],
        isPro: true,
      }
      const result = selectSuggestion(profile, digestData)

      expect(result).toBeNull()
    })
  })

  describe('priority 5: all conditions pass', () => {
    it('returns null when profile is complete and user is Pro', () => {
      const profile = { ...baseProfile }
      const digestData = {
        ...baseDigestData,
        services: [
          { id: '1', profile_id: 'profile-1', title: 'Service 1', price: 1000, currency: 'XOF', position: 1 },
          { id: '2', profile_id: 'profile-1', title: 'Service 2', price: 2000, currency: 'XOF', position: 2 },
          { id: '3', profile_id: 'profile-1', title: 'Service 3', price: 3000, currency: 'XOF', position: 3 },
        ],
        portfolioItems: [{ id: '1', profile_id: 'profile-1', media_url: 'img1.jpg', media_type: 'image' as const, title: 'Item 1', position: 1 }],
        isPro: true,
      }
      const result = selectSuggestion(profile, digestData)

      expect(result).toBeNull()
    })
  })

  describe('SuggestionType type', () => {
    it('only allows the four valid types', () => {
      const validTypes: SuggestionType[] = ['bio', 'services', 'portfolio', 'pro_cta']
      expect(validTypes).toHaveLength(4)
    })
  })
})