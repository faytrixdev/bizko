import { buildWaLink, buildServiceWaMessage } from "@/lib/utils";
import Image from "next/image";
import { SocialIcon } from "@/components/socialIcons";
import { Avatar, formatTestimonialDate } from "./shared";
import type { TemplateProps } from "./types";

const SERIF = { fontFamily: "var(--font-garamond, Georgia, serif)" };

const pad = (n: number) => String(n + 1).padStart(2, "0");

export function EditoTemplate({ profile, services, portfolio, socials, testimonials, msg, locale, links, trackClick }: TemplateProps) {
  return (
    <>
      {/* Header — Magazine */}
      <header className="pt-4 text-center">
        <Avatar profile={profile} className="h-20 w-20 ring-4 ring-[#FAF7F2] shadow-sm" />
        <h1 data-testid="t-name" style={SERIF} className="mt-5 text-4xl font-medium text-[#1C1917] sm:text-5xl">
          {profile.display_name}
        </h1>
        <p className="mt-2 text-sm italic text-[#B07D3D]">{profile.tagline}</p>
        <p className="mt-3 text-xs uppercase tracking-[0.25em] text-[#1C1917]/50">{profile.city}, {profile.country}</p>
        {profile.bio && (
          <blockquote style={SERIF} className="mx-auto mt-8 max-w-md border-y border-[#B07D3D]/30 px-2 py-6 text-lg leading-8 text-[#1C1917]/80">
            « {profile.bio} »
          </blockquote>
        )}
        <div className="mx-auto mt-8 flex w-full max-w-[400px] gap-3">
          <a data-testid="cta-wa" href={links.mainWa} target="_blank" rel="noopener noreferrer" className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#B07D3D] font-medium text-white transition-colors hover:bg-[#96702f]">
            <SocialIcon platform="whatsapp" className="h-4 w-4" />
            {msg.whatsapp}
          </a>
          <a href={links.telLink} className="flex h-12 w-12 items-center justify-center rounded-full border border-[#1C1917]/20 text-[#1C1917] transition-colors hover:bg-[#1C1917]/5">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
          </a>
        </div>
      </header>

      {/* Services — menu numéroté */}
      {services.length > 0 && (
        <section className="mt-10">
          <h2 style={SERIF} className="text-xl italic text-[#1C1917]">{msg.services}</h2>
          <div data-testid="services" className="mt-5">
            {services.map((s, i) => {
              const href = trackClick(`click_service_${s.id}`, buildWaLink(profile.phone_e164, buildServiceWaMessage(s.title, s.price, s.currency)));
              return (
                <div key={s.id} className="flex items-baseline gap-3 border-b border-[#1C1917]/10 py-4">
                  <span style={SERIF} className="text-sm italic text-[#B07D3D]">{pad(i)}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-[#1C1917]">{s.title}</p>
                    {s.description && <p className="mt-0.5 text-sm text-[#1C1917]/55">{s.description}</p>}
                  </div>
                  <span className="flex-1 border-b border-dotted border-[#1C1917]/25" aria-hidden="true" />
                  {s.price != null && <p style={SERIF} className="shrink-0 text-lg text-[#B07D3D]">{s.price.toLocaleString()} <span className="text-xs">{s.currency}</span></p>}
                  <a href={href} target="_blank" rel="noopener noreferrer" className="ml-1 shrink-0 text-xs font-medium text-[#B07D3D] underline underline-offset-4 hover:text-[#96702f]">{msg.demandBtn}</a>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Portfolio — figures */}
      {portfolio.length > 0 && (
        <section className="mt-10">
          <h2 style={SERIF} className="text-xl italic text-[#1C1917]">{msg.portfolio}</h2>
          <div data-testid="portfolio" className="mt-5 grid grid-cols-2 gap-4">
            {portfolio.map((p) => (
              <figure key={p.id} className="text-center">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#EFE9DD]">
                  <Image src={p.thumbnail_url || p.media_url} alt={p.title || ""} fill sizes="(max-width: 768px) 50vw, 300px" className="object-cover" />
                </div>
                {p.title && <figcaption style={SERIF} className="mt-2 text-sm italic text-[#1C1917]/70">{p.title}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials — citations serif */}
      {testimonials.length > 0 && (
        <section className="mt-10">
          <h2 style={SERIF} className="text-xl italic text-[#1C1917]">{msg.testimonials.title}</h2>
          <div data-testid="testimonials" className="mt-5 flex flex-col gap-6">
            {testimonials.map((t) => (
              <blockquote key={t.id} className="border-y border-[#B07D3D]/25 py-5 text-center">
                <p style={SERIF} className="text-lg italic leading-8 text-[#1C1917]/80">« {t.content} »</p>
                <footer className="mt-3 text-xs font-medium text-[#1C1917]/60">{t.authorName}{t.authorRole ? ` · ${t.authorRole}` : ""}</footer>
                {t.createdAt && <p className="mt-1 text-[11px] text-[#1C1917]/40">{formatTestimonialDate(locale, t.createdAt)}</p>}
              </blockquote>
            ))}
          </div>
        </section>
      )}

      {/* Socials — text links */}
      {socials.length > 0 && (
        <section className="mt-10">
          <h2 style={SERIF} className="text-xl italic text-[#1C1917]">{msg.socials}</h2>
          <div data-testid="socials" className="mt-3 flex flex-col">
            {socials.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 border-b border-[#1C1917]/10 py-2.5 text-sm font-medium text-[#1C1917] transition-colors hover:text-[#B07D3D]">
                <SocialIcon platform={s.platform} className="h-4 w-4" />
                <span className="capitalize">{s.platform}</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}