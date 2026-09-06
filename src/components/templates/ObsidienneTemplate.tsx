import { buildWaLink, buildServiceWaMessage } from "@/lib/utils";
import Image from "next/image";
import { SocialIcon } from "@/components/socialIcons";
import { Avatar, formatTestimonialDate } from "./shared";
import type { TemplateProps } from "./types";

const CONDENSED = { fontFamily: "var(--font-archivo, 'Arial Narrow', sans-serif)" };
const GOLD = "#D4AF37";

export function ObsidienneTemplate({ profile, services, portfolio, socials, testimonials, msg, locale, links, trackClick }: TemplateProps) {
  const stars = (t: typeof testimonials[number]) =>
    t.rating != null ? { "aria-label": msg.testimonials.starsAria } : {};
  return (
    <>
      {/* Header */}
      <header className="pt-2 text-white">
        <div className="flex flex-col items-center text-center">
          <div className="h-1.5 w-16 bg-[#D4AF37]" aria-hidden="true" />
          <h1 style={CONDENSED} className="mt-6 text-4xl font-bold uppercase tracking-wide text-white">{profile.display_name}</h1>
          <p className="mt-2 text-sm font-medium text-[#D4AF37]">{profile.tagline}</p>
          <p className="mt-3 text-xs text-white/40">{profile.city}, {profile.country}</p>
          {profile.bio && <p className="mt-5 max-w-md text-sm leading-7 text-white/60">{profile.bio}</p>}
          <div className="mt-8 flex gap-3 w-full max-w-[400px]">
            <a href={links.mainWa} target="_blank" rel="noopener noreferrer" className="flex-1 h-12 rounded-xl bg-[#D4AF37] text-black font-bold inline-flex items-center justify-center gap-2 hover:bg-[#e5c65a] transition-colors duration-200 shadow-md shadow-[#D4AF37]/20">
              <SocialIcon platform="whatsapp" className="w-4 h-4" />
              {msg.whatsapp}
            </a>
            <a href={links.telLink} className="h-12 w-14 rounded-xl border border-white/20 inline-flex items-center justify-center text-white hover:bg-white/10 transition-colors duration-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Services */}
      {services.length > 0 && (
        <section className="mt-10">
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-white/50 mb-4">{msg.services}</h2>
          <div className="flex flex-col gap-3">
            {services.map((s) => {
              const href = trackClick(`click_service_${s.id}`, buildWaLink(profile.phone_e164, buildServiceWaMessage(s.title, s.price, s.currency)));
              return (
                <div key={s.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{s.title}</p>
                    {s.description && <p className="text-sm text-white/50 mt-0.5">{s.description}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    {s.price != null && <p className="text-lg font-bold" style={{ color: GOLD }}>{s.price.toLocaleString()} <span className="text-xs font-medium text-white/50">{s.currency}</span></p>}
                    <a href={href} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex h-9 items-center px-4 rounded-lg border border-[#D4AF37]/60 text-[#D4AF37] text-xs font-semibold hover:bg-[#D4AF37] hover:text-black transition-colors duration-200">{msg.demandBtn}</a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Portfolio — unique mosaic */}
      {portfolio.length > 0 && (
        <section className="mt-10">
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-white/50 mb-4">{msg.portfolio}</h2>
          <div className="grid grid-cols-6 gap-2">
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

      {/* Testimonials — custom dark cards */}
      {testimonials.length > 0 && (
        <section className="mt-10">
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-white/50 mb-4">{msg.testimonials.title}</h2>
          <div className="flex flex-col gap-3">
            {testimonials.map((t) => (
              <div key={t.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D4AF37]/20 text-sm font-bold text-[#D4AF37]">{t.authorName.trim().charAt(0).toUpperCase()}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{t.authorName}</p>
                    {t.authorRole && <p className="truncate text-xs text-white/40">{t.authorRole}</p>}
                  </div>
                  {t.rating != null && <div role="img" {...stars(t)} className="text-[#D4AF37] text-xs">{"★".repeat(Math.max(1, Math.min(5, Math.round(t.rating))))}</div>}
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
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-white/50 mb-4">{msg.socials}</h2>
          <div className="grid grid-cols-3 gap-2">
            {socials.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="h-12 rounded-xl border border-white/15 text-white inline-flex items-center justify-center hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors duration-200">
                <SocialIcon platform={s.platform} className="w-4 h-4" />
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}