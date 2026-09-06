import { buildWaLink, buildServiceWaMessage } from "@/lib/utils";
import Image from "next/image";
import { SocialIcon } from "@/components/socialIcons";
import { TestimonialCard } from "@/components/TestimonialCard";
import { Avatar, formatTestimonialDate } from "./shared";
import type { TemplateProps } from "./types";

const CONDENSED = { fontFamily: "var(--font-archivo, 'Arial Narrow', sans-serif)" };

export function StudioTemplate({ profile, services, portfolio, socials, testimonials, msg, locale, links, trackClick }: TemplateProps) {
  return (
    <>
      {/* Hero */}
      <header className="bg-[#0A0A0A] -mx-4 px-4 py-12 text-white">
        <div className="flex flex-col items-center text-center">
          <Avatar
            profile={profile}
            className="h-28 w-28 ring-2 ring-white/20 shadow-2xl"
          />
          <h1 style={CONDENSED} className="mt-6 text-5xl font-bold uppercase tracking-tight text-white text-center leading-[0.95]">
            {profile.display_name}
          </h1>
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/60">{profile.tagline}</p>
          <p className="mt-3 text-xs text-white/40">{profile.city}, {profile.country}</p>
          {profile.bio && <p className="mt-6 max-w-md text-sm leading-7 text-white/70">{profile.bio}</p>}
          <div className="mt-8 flex gap-3 w-full max-w-[400px]">
            <a href={links.mainWa} target="_blank" rel="noopener noreferrer" className="flex-1 h-12 rounded-none bg-white text-black font-bold text-sm uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-white/85 transition-colors duration-200">
              <SocialIcon platform="whatsapp" className="h-4 w-4" />
              {msg.whatsapp}
            </a>
            <a href={links.telLink} className="h-12 w-14 rounded-none border border-white/30 inline-flex items-center justify-center text-white hover:bg-white/10 transition-colors duration-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Services */}
      {services.length > 0 && (
        <div className="mt-10">
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400 mb-4">{msg.services}</h2>
          <div className="grid gap-3">
            {services.map((s) => {
              const href = trackClick(`click_service_${s.id}`, buildWaLink(profile.phone_e164, buildServiceWaMessage(s.title, s.price, s.currency)));
              return (
                <div key={s.id} className="border border-gray-200 p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-base font-bold text-gray-900">{s.title}</p>
                    {s.description && <p className="text-sm text-gray-500 mt-1">{s.description}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    {s.price != null && <p className="text-lg font-bold text-gray-900">{s.price.toLocaleString()} <span className="text-xs font-medium text-gray-400">{s.currency}</span></p>}
                    <a href={href} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex h-9 items-center px-4 border border-gray-900 text-black text-xs font-semibold uppercase tracking-wider hover:bg-gray-900 hover:text-white transition-colors duration-200">{msg.demandBtn}</a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Portfolio */}
      {portfolio.length > 0 && (
        <div className="mt-10">
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400 mb-4">{msg.portfolio}</h2>
          <div className="grid grid-cols-2 gap-2">
            {portfolio.map((p) => (
              <div key={p.id} className="relative aspect-[2/3] overflow-hidden bg-gray-100">
                <Image src={p.thumbnail_url || p.media_url} alt={p.title || ""} fill sizes="(max-width: 768px) 50vw, 300px" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <div className="mt-10">
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400 mb-4">{msg.testimonials.title}</h2>
          <div className="flex flex-col gap-3">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} starLabel={msg.testimonials.starsAria} date={formatTestimonialDate(locale, t.createdAt)} />
            ))}
          </div>
        </div>
      )}

      {/* Socials */}
      {socials.length > 0 && (
        <div className="mt-10">
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400 mb-4">{msg.socials}</h2>
          <div className="grid grid-cols-3 gap-2">
            {socials.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="h-12 border border-gray-200 text-gray-700 inline-flex items-center justify-center gap-2 hover:border-gray-900 hover:text-gray-900 transition-colors duration-200">
                <SocialIcon platform={s.platform} className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}