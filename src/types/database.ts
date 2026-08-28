export interface Profile {
  id: string;
  username: string;
  display_name: string;
  tagline: string;
  bio: string | null;
  city: string;
  country: string;
  phone_e164: string;
  email_public: string | null;
  template: string;
  locale: string;
  avatar_url: string | null;
}

export interface Service {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  price: number | null;
  currency: string;
  position: number;
}

export interface PortfolioItem {
  id: string;
  profile_id: string;
  image_url: string;
  title: string | null;
  position: number;
}

export interface SocialLink {
  id: string;
  profile_id: string;
  platform: string;
  url: string;
  position: number;
}

export type Template = 'minimal' | 'portfolio';
export type Locale = 'fr' | 'en';
export type Currency = 'XOF' | 'XAF' | 'NGN' | 'KES' | 'ZAR' | 'DZD' | 'GHS' | 'TZS' | 'UGX' | 'USD' | 'EUR' | 'GBP';
