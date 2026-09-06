import { buildWaLink, buildServiceWaMessage } from "@/lib/utils";
import Image from "next/image";
import { SocialIcon } from "@/components/socialIcons";
import { Avatar, formatTestimonialDate } from "./shared";
import type { TemplateProps } from "./types";

const CONDENSED = { fontFamily: "var(--font-archivo, 'Arial Narrow', sans-serif)" };
const LIME = "#D9FF4C";

export function StudioTemplate({ profile, services, portfolio, socials, testimonials, msg, locale, links, trackClick }: TemplateProps) {
  return (
    <>
      {/* Hero — Noir Éditorial */}
      <header className="rounded-2xl bg-[#0A0A0A] px-4 py-14 text-center text-white">
        <Avatar profile={profile} className="h-24 w-24 rounded-full ring-1 ring-white/20" />
        <h1 data-testid="t-name" style={CONDENSED} className="mt-6 text-5xl font-bold uppercase leading-[0.9] text-white">
          {profile.display_name}
        </h1>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: LIME }}>{profile.tagline}</p>
        <p className="mt-3 text-xs text-white/40">{profile.city}, {profile.country}</p>
        {profile.bio && <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-white/70">{profile.bio}</p>}
        <div className="mx-auto mt-8 flex w-full max-w-[400px] gap-3">
          <a data-testid="cta-wa" href={links.mainWa} target="_blank" rel="noopener noreferrer" className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold uppercase tracking-widest text-black transition-colors hover:brightness-95" style={{ backgroundColor: LIME }}>
            <SocialIcon platform="whatsapp" className="h-4 w-4" />
            {msg.whatsapp}
          </a>
          <a href={links.telLink} className="flex h-14 w-14 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/10" style={{ border: "1px solid rgba(255,255,255,0.3)" }}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
          </a>
        </div>
      </header>

      {/* Services — rangées rulées */}
      {services.length > 0 && (
        <section className="mt-10">
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">{msg.services}</h2>
          <div data-testid="services" className="mt-4 border-t-2 border-gray-900">
            {services.map((s) => {
              const href = trackClick(`click_service_${s.id}`, buildWaLink(profile.phone_e164, buildServiceWaMessage(s.title, s.price, s.currency)));
              return (
                <div key={s.id} className="flex items-center justify-between gap-4 border-b border-gray-200 py-5">
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-gray-900">{s.title}</p>
                    {s.description && <p className="mt-1 text-sm leading-6 text-gray-500">{s.description}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    {s.price != null && <p className="text-xl font-bold text-gray-900">{s.price.toLocaleString()} <span className="text-xs font-medium text-gray-400">{s.currency}</span></p>}
                    <a href={href} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs font-bold uppercase tracking-widest text-gray-900 underline decoration-2 underline-offset-4 transition-colors hover:text-gray-500">{msg.demandBtn}</a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Portfolio — B&W, hover couleur */}
      {portfolio.length > 0 && (
        <section className="mt-10">
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">{msg.portfolio}</h2>
          <div data-testid="portfolio" className="mt-4 grid grid-cols-2 gap-2">
            {portfolio.map((p) => (
              <div key={p.id} className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100 grayscale transition-all duration-300 hover:grayscale-0">
                <Image src={p.thumbnail_url || p.media_url} alt={p.title || ""} fill sizes="(max-width: 768px) 50vw, 300px" className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials — blocs rulés */}
      {testimonials.length > 0 && (
        <section className="mt-10">
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">{msg.testimonials.title}</h2>
          <div data-testid="testimonials" className="mt-4 flex flex-col gap-5">
            {testimonials.map((t) => (
              <div key={t.id} className="border-l-2 border-gray-900 pl-4">
                <p className="text-sm leading-6 text-gray-700">{t.content}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-widest text-gray-900">{t.authorName}{t.authorRole ? ` · ${t.authorRole}` : ""}</p>
                {t.createdAt && <p className="mt-1 text-[11px] text-gray-400">{formatTestimonialDate(locale, t.createdAt)}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Socials */}
      {socials.length > 0 && (
        <section className="mt-10">
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">{msg.socials}</h2>
          <div data-testid="socials" className="mt-4 grid grid-cols-3 gap-2">
            {socials.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center rounded-xl text-gray-700 transition-colors hover:bg-gray-900 hover:text-white" style={{ border: "1px solid #d1d5db" }}>
                <SocialIcon platform={s.platform} className="h-4 w-4" />
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}