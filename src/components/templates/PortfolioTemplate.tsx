import { buildWaLink, buildServiceWaMessage } from "@/lib/utils";
import Image from "next/image";
import { SocialIcon } from "@/components/socialIcons";
import { Avatar, formatTestimonialDate } from "./shared";
import type { TemplateProps } from "./types";

const Phone = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

export function PortfolioTemplate({ profile, services, portfolio, socials, testimonials, msg, locale, links, trackClick }: TemplateProps) {
  return (
    <>
      {/* Header — compact, galerie d'abord */}
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-4 text-left">
          <Avatar className="h-16 w-16 shrink-0 ring-1 ring-stone-200 shadow-sm" profile={profile} />
          <div className="min-w-0">
            <h1 data-testid="hp-name" className="text-2xl font-bold text-gray-900">{profile.display_name}</h1>
            <p className="text-sm font-medium text-[#B45309]">{profile.tagline}</p>
            <p className="mt-0.5 text-xs text-gray-400">{profile.city}, {profile.country}</p>
          </div>
        </div>
        {profile.bio && <p className="mt-6 max-w-md text-sm leading-7 text-gray-600">{profile.bio}</p>}
        <div className="mt-6 flex gap-3 w-full max-w-[400px]">
          <a data-testid="cta-wa" href={links.mainWa} target="_blank" rel="noopener noreferrer" className="flex-1 h-12 rounded-2xl bg-whatsapp text-white font-semibold inline-flex items-center justify-center gap-2 transition-colors hover:bg-whatsapp-hover">
            <SocialIcon platform="whatsapp" className="h-4 w-4" />
            {msg.whatsapp}
          </a>
          <a href={links.telLink} className="h-12 w-12 rounded-2xl border border-stone-300 bg-white text-gray-600 inline-flex items-center justify-center transition-colors hover:bg-stone-100">
            <Phone />
          </a>
        </div>
      </div>

      {/* Services — compacts, ne volent pas la vedette */}
      {services.length > 0 && (
        <section className="mt-10">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">{msg.services}</h2>
          <div data-testid="services" className="mt-3 grid gap-2">
            {services.map((s) => {
              const href = trackClick(`click_service_${s.id}`, buildWaLink(profile.phone_e164, buildServiceWaMessage(s.title, s.price, s.currency)));
              return (
                <div key={s.id} className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                    {s.description && <p className="line-clamp-1 text-xs text-gray-500">{s.description}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    {s.price != null && <p className="text-sm font-bold text-[#B45309]">{s.price.toLocaleString()} {s.currency}</p>}
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-[11px] font-medium text-gray-500 underline underline-offset-4 hover:text-[#B45309]">{msg.demandBtn}</a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Portfolio — la star */}
      {portfolio.length > 0 && (
        <section className="mt-10">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">{msg.portfolio}</h2>
          <div data-testid="portfolio" className="mt-3 grid grid-cols-3 gap-2.5">
            {portfolio.map((p, i) => (
              <div key={p.id} className={`relative overflow-hidden rounded-2xl border border-stone-200 bg-white ${i % 4 === 0 ? "col-span-3 aspect-[16/10]" : "aspect-square"}`}>
                <Image src={p.thumbnail_url || p.media_url} alt={p.title || ""} fill sizes="(max-width: 768px) 100vw, 420px" className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials — pull-quotes */}
      {testimonials.length > 0 && (
        <section className="mt-10">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">{msg.testimonials.title}</h2>
          <div data-testid="testimonials" className="mt-4 flex flex-col gap-5">
            {testimonials.map((t) => (
              <div key={t.id} className="rounded-2xl border-l-4 border-[#B45309] bg-white px-4 py-4 shadow-sm">
                <p className="text-sm leading-6 text-gray-700">« {t.content} »</p>
                <p className="mt-2 text-xs font-semibold text-gray-900">{t.authorName}{t.authorRole ? ` · ${t.authorRole}` : ""}</p>
                {t.createdAt && <p className="mt-0.5 text-[11px] text-gray-400">{formatTestimonialDate(locale, t.createdAt)}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Socials */}
      {socials.length > 0 && (
        <section className="mt-10">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">{msg.socials}</h2>
          <div data-testid="socials" className="mt-3 grid gap-2">
            {socials.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-stone-300 hover:text-[#B45309]">
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