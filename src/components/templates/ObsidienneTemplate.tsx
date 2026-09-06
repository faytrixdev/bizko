import { buildWaLink, buildServiceWaMessage } from "@/lib/utils";
import Image from "next/image";
import { SocialIcon } from "@/components/socialIcons";
import { Avatar, formatTestimonialDate } from "./shared";
import type { TemplateProps } from "./types";

const SERIF = { fontFamily: "var(--font-garamond, Georgia, serif)" };
const CONDENSED = { fontFamily: "var(--font-archivo, 'Arial Narrow', sans-serif)" };
const GOLD = "#D4AF37";
const GOLD_SOFT = "#E6C87A";

export function ObsidienneTemplate({ profile, services, portfolio, socials, testimonials, msg, locale, links, trackClick }: TemplateProps) {
  return (
    <>
      {/* Header — Club noir */}
      <header className="pt-2 text-white">
        <div className="flex flex-col items-center text-center">
          <div className="h-1.5 w-16 bg-[#D4AF37]" aria-hidden="true" />
          <div className="relative mt-8" data-testid="halo">
            <div aria-hidden="true" className="absolute -inset-4 rounded-full bg-[#D4AF37]/30 blur-2xl" />
            <Avatar profile={profile} className="relative h-28 w-28 ring-1 ring-[#D4AF37]/50" />
          </div>
          <h1 data-testid="t-name" style={SERIF} className="mt-6 text-4xl font-medium tracking-wide text-white sm:text-5xl">
            {profile.display_name}
          </h1>
          <p className="mt-2 text-sm font-medium" style={{ color: GOLD }}>{profile.tagline}</p>
          <p className="mt-3 text-xs text-white/40">{profile.city}, {profile.country}</p>
          {profile.bio && <p className="mt-5 max-w-md text-sm leading-7 text-white/60">{profile.bio}</p>}
          <div className="mt-8 flex w-full max-w-[400px] gap-3">
            <a data-testid="cta-wa" href={links.mainWa} target="_blank" rel="noopener noreferrer" className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E6C87A] font-bold text-black transition-opacity hover:opacity-90">
              <SocialIcon platform="whatsapp" className="h-4 w-4" />
              {msg.whatsapp}
            </a>
            <a href={links.telLink} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Services — panneaux verre */}
      {services.length > 0 && (
        <section className="mt-10">
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-white/50">{msg.services}</h2>
          <div data-testid="services" className="mt-4 flex flex-col gap-3">
            {services.map((s) => {
              const href = trackClick(`click_service_${s.id}`, buildWaLink(profile.phone_e164, buildServiceWaMessage(s.title, s.price, s.currency)));
              return (
                <div key={s.id} data-testid="service-item" className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur-md">
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{s.title}</p>
                    {s.description && <p className="mt-0.5 text-sm text-white/50">{s.description}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    {s.price != null && <p className="text-lg font-bold" style={{ color: GOLD }}>{s.price.toLocaleString()} <span className="text-xs font-medium text-white/50">{s.currency}</span></p>}
                    <a href={href} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-[#D4AF37] hover:text-black" style={{ borderColor: "rgba(212,175,55,0.6)", color: GOLD }}>
                      {msg.demandBtn}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Portfolio — mosaïque */}
      {portfolio.length > 0 && (
        <section className="mt-10">
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-white/50">{msg.portfolio}</h2>
          <div data-testid="portfolio" className="mt-4 grid grid-cols-6 gap-2">
            {portfolio.map((p, i) => {
              const span = i % 4 === 0 ? "col-span-4" : i % 4 === 1 ? "col-span-2" : "col-span-3";
              return (
                <div key={p.id} className={`relative aspect-square overflow-hidden rounded-xl border border-white/10 ${span}`}>
                  <Image src={p.thumbnail_url || p.media_url} alt={p.title || ""} fill sizes="(max-width: 768px) 50vw, 320px" className="object-cover" />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Testimonials — cartes sombres */}
      {testimonials.length > 0 && (
        <section className="mt-10">
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-white/50">{msg.testimonials.title}</h2>
          <div data-testid="testimonials" className="mt-4 flex flex-col gap-3">
            {testimonials.map((t) => (
              <div key={t.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D4AF37]/20 text-sm font-bold" style={{ color: GOLD }}>{t.authorName.trim().charAt(0).toUpperCase()}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{t.authorName}</p>
                    {t.authorRole && <p className="truncate text-xs text-white/40">{t.authorRole}</p>}
                  </div>
                  {t.rating != null && <div role="img" aria-label={msg.testimonials.starsAria} style={{ color: GOLD }} className="text-xs">{"★".repeat(Math.max(1, Math.min(5, Math.round(t.rating))))}</div>}
                </div>
                <p className="mt-3 text-sm leading-6 text-white/70">{t.content}</p>
                <p className="mt-3 text-[11px] text-white/30">{formatTestimonialDate(locale, t.createdAt)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Socials */}
      {socials.length > 0 && (
        <section className="mt-10">
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-white/50">{msg.socials}</h2>
          <div data-testid="socials" className="mt-4 grid grid-cols-3 gap-2">
            {socials.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center rounded-xl border border-white/15 text-white transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37]">
                <SocialIcon platform={s.platform} className="h-4 w-4" />
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}