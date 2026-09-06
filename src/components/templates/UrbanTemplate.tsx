import { buildWaLink, buildServiceWaMessage } from "@/lib/utils";
import Image from "next/image";
import { SocialIcon } from "@/components/socialIcons";
import { Star } from "lucide-react";
import { initials, formatTestimonialDate } from "./shared";
import type { TemplateProps } from "./types";

const DISPLAY = { fontFamily: "var(--font-sora, ui-sans-serif, sans-serif)" };
const PANELS = [
  { bg: "bg-[#F3E8FF]", chip: "bg-white/80 text-[#7C3AED]" },
  { bg: "bg-[#FEF3C7]", chip: "bg-white/80 text-[#B45309]" },
  { bg: "bg-[#CFFAFE]", chip: "bg-white/80 text-[#0891B2]" },
  { bg: "bg-[#FCE7F3]", chip: "bg-white/80 text-[#DB2777]" },
];

export function UrbanTemplate({ profile, services, portfolio, socials, testimonials, msg, locale, links, trackClick }: TemplateProps) {
  return (
    <>
      {/* Header — Collage */}
      <header className="pt-2 text-center">
        {profile.avatar_url ? (
          <div data-testid="avatar-ring" className="mx-auto h-28 w-28 rounded-full bg-gradient-to-br from-[#7C3AED] via-[#312E81] to-[#F59E0B] p-[3px] shadow-lg shadow-[#7C3AED]/25">
            <Image src={profile.avatar_url} alt={profile.display_name} width={104} height={104} className="h-full w-full rounded-full object-cover ring-4 ring-white" />
          </div>
        ) : (
          <div className="mx-auto h-28 w-28 rounded-full bg-gradient-to-br from-[#7C3AED] via-[#312E81] to-[#F59E0B] p-[3px]">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-2xl font-bold text-[#7C3AED]">{initials(profile.display_name)}</div>
          </div>
        )}
        <h1 data-testid="t-name" style={DISPLAY} className="mt-5 text-4xl font-bold tracking-tight text-gray-900">
          {profile.display_name}
        </h1>
        <span className="mt-3 inline-flex items-center rounded-full bg-[#7C3AED] px-4 py-1.5 text-xs font-bold text-white">{profile.tagline}</span>
        <p className="mt-3 text-xs text-gray-400">{profile.city}, {profile.country}</p>
        {profile.bio && <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-gray-600">{profile.bio}</p>}
        <div className="mx-auto mt-7 flex w-full max-w-[400px] gap-3">
          <a data-testid="cta-wa" href={links.mainWa} target="_blank" rel="noopener noreferrer" className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#312E81] text-white shadow-lg shadow-[#7C3AED]/30 transition-opacity hover:opacity-90">
            <SocialIcon platform="whatsapp" className="h-4 w-4" />
            {msg.whatsapp}
          </a>
          <a href={links.telLink} className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#7C3AED]/20 text-[#7C3AED] transition-colors hover:bg-[#7C3AED]/5">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
          </a>
        </div>
      </header>

      {/* Services — panneaux couleur pleine */}
      {services.length > 0 && (
        <section className="mt-9">
          <h2 style={DISPLAY} className="text-sm font-bold text-gray-900">{msg.services}</h2>
          <div data-testid="services" className="mt-4 flex flex-col gap-3">
            {services.map((s, i) => {
              const href = trackClick(`click_service_${s.id}`, buildWaLink(profile.phone_e164, buildServiceWaMessage(s.title, s.price, s.currency)));
              const panel = PANELS[i % PANELS.length];
              return (
                <div key={s.id} data-testid="service-item" className={`flex items-center justify-between gap-4 rounded-3xl px-5 py-4 ${panel.bg}`}>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900">{s.title}</p>
                    {s.description && <p className="mt-0.5 text-sm text-gray-600">{s.description}</p>}
                    <span className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${panel.chip}`}>
                      {s.price != null ? `${s.price.toLocaleString()} ${s.currency}` : msg.demandBtn}
                    </span>
                  </div>
                  <a href={href} target="_blank" rel="noopener noreferrer" className={`flex h-9 shrink-0 items-center rounded-full px-4 text-xs font-bold text-white transition-opacity hover:opacity-90 ${i % 2 === 0 ? "bg-gray-900" : "bg-[#7C3AED]"}`}>{msg.demandBtn}</a>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Portfolio */}
      {portfolio.length > 0 && (
        <section className="mt-9">
          <h2 style={DISPLAY} className="text-sm font-bold text-gray-900">{msg.portfolio}</h2>
          <div data-testid="portfolio" className="mt-4 grid grid-cols-2 gap-2.5">
            {portfolio.map((p, i) => (
              <div key={p.id} className={`relative overflow-hidden rounded-3xl ${i % 3 === 0 ? "col-span-2 aspect-[16/10]" : "aspect-square"}`}>
                <Image src={p.thumbnail_url || p.media_url} alt={p.title || ""} fill sizes="(max-width: 768px) 50vw, 300px" className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials — bulles */}
      {testimonials.length > 0 && (
        <section className="mt-9">
          <h2 style={DISPLAY} className="text-sm font-bold text-gray-900">{msg.testimonials.title}</h2>
          <div data-testid="testimonials" className="mt-4 flex flex-col gap-3">
            {testimonials.map((t) => (
              <div key={t.id} className="rounded-3xl bg-[#F3E8FF] px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-[#7C3AED]">{t.authorName.trim().charAt(0).toUpperCase()}</div>
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">{t.authorName}</p>
                  {t.rating != null && (
                    <div aria-label={msg.testimonials.starsAria} className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => <Star key={i} className={i < (t.rating ?? 0) ? "h-3.5 w-3.5 fill-amber-500 text-amber-500" : "h-3.5 w-3.5 text-white/70"} />)}
                    </div>
                  )}
                </div>
                <p className="mt-2 text-sm leading-6 text-gray-700">{t.content}</p>
                {t.createdAt && <p className="mt-2 text-[11px] text-gray-500">{formatTestimonialDate(locale, t.createdAt)}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Socials — cercles dégradés */}
      {socials.length > 0 && (
        <section className="mt-9">
          <h2 style={DISPLAY} className="text-sm font-bold text-gray-900">{msg.socials}</h2>
          <div data-testid="socials" className="mt-4 flex flex-wrap gap-3">
            {socials.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#312E81] text-white transition-transform hover:scale-105">
                <SocialIcon platform={s.platform} className="h-5 w-5" />
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}