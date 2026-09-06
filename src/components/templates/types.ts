import type { Messages } from "@/lib/i18n/messages";
import type { PublicTestimonial } from "@/lib/supabase/queries";
import type { Profile, Service, PortfolioItem, SocialLink } from "@/types/database";

export type ProfileMessages = Messages["profile"];

export interface TemplateLinks {
  /** Header WhatsApp href, wrapped in trackClick("click_main", …). */
  mainWa: string;
  /** tel: href, untracked. */
  telLink: string;
}

export interface TemplateProps {
  profile: Profile;
  services: Service[];
  portfolio: PortfolioItem[];
  socials: SocialLink[];
  testimonials: PublicTestimonial[];
  msg: ProfileMessages;
  locale: string;
  links: TemplateLinks;
  /** Builds a tracked href for a click type: `/api/track-click?pid=…&type=…&to=…` */
  trackClick: (type: string, to: string) => string;
}