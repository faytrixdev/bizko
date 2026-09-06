import Link from "next/link";
import { buildWaLink, buildMainWaMessage } from "@/lib/utils";
import { getTemplate } from "@/lib/templates";
import type { Messages } from "@/lib/i18n/messages";
import type { PublicProfileData } from "@/lib/supabase/queries";
import type { TemplateProps } from "@/components/templates/types";
import { WhatsAppFloating } from "@/components/WhatsAppFloating";
import { ViewTracker } from "@/components/ViewTracker";
import { ServiceViewTracker } from "@/components/ServiceViewTracker";
import { SocialIcon } from "@/components/socialIcons";
import { TestimonialForm } from "@/components/TestimonialForm";

export interface ProfileViewProps extends Omit<PublicProfileData, "profile"> {
  profile: PublicProfileData["profile"];
  locale: string;
  msg: Messages;
}

export function ProfileView({
  profile,
  services,
  portfolio,
  socials,
  testimonials,
  locale,
  msg,
}: ProfileViewProps) {
  const template = getTemplate(profile.template);
  const pid = profile.id;
  const mainWaRaw = buildWaLink(profile.phone_e164, buildMainWaMessage(profile.display_name));
  const telLink = `tel:${profile.phone_e164}`;
  const trackClick = (type: string, to: string) =>
    `/api/track-click?pid=${pid}&type=${type}&to=${encodeURIComponent(to)}`;

  const props: TemplateProps = {
    profile,
    services,
    portfolio,
    socials,
    testimonials,
    msg: msg.profile,
    locale,
    links: { mainWa: trackClick("click_main", mainWaRaw), telLink },
    trackClick,
  };

  return (
    <div className={`min-h-screen ${template.bgClass}`}>
      <div className="max-w-[640px] mx-auto px-4 py-8 pb-28 sm:pb-8">
        <template.Component {...props} />

        {testimonials.length > 0 && <TestimonialForm profileId={pid} />}

        <p className={`text-center text-xs mt-12 ${template.bgClass === "bg-[#0B0B0F]" ? "text-white/30" : "text-gray-400"}`}>
          {msg.profile.madeWith}{" "}
          <Link href="/" className="font-medium text-accent">
            Bizko
          </Link>{" "}
          - bizko.pro/{profile.username}
        </p>
      </div>

      {/* Sticky WhatsApp CTA - mobile only */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-100/60 bg-white/95 backdrop-blur-xl p-4 flex justify-center sm:hidden z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <a href={trackClick("click_sticky", mainWaRaw)} target="_blank" rel="noopener noreferrer" className="h-12 w-full max-w-[640px] rounded-2xl bg-whatsapp text-white font-semibold inline-flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/25">
          <SocialIcon platform="whatsapp" />
          {msg.profile.stickyWa}
        </a>
      </div>

      {/* Floating WhatsApp - desktop only */}
      <WhatsAppFloating href={trackClick("click_floating", mainWaRaw)} />

      {/* Trackers (client, SSR path stays cache-friendly) */}
      <ViewTracker profileId={profile.id} />
      {services.length > 0 && <ServiceViewTracker serviceIds={services.map((s) => s.id)} />}
    </div>
  );
}