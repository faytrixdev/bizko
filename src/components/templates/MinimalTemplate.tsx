import { buildWaLink, buildServiceWaMessage } from "@/lib/utils";
import { Star } from "lucide-react";
import Image from "next/image";
import { SocialIcon } from "@/components/socialIcons";
import { Avatar, formatTestimonialDate } from "./shared";
import type { TemplateProps } from "./types";

const Phone = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

export function MinimalTemplate({ profile, services, portfolio, socials, testimonials, msg, locale, links, trackClick }: TemplateProps) {
  const stars = (t: (typeof testimonials)[number]) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={i < (t.rating ?? 0) ? "h-3.5 w-3.5 fill-amber-500 text-amber-500" : "h-3.5 w-3.5 text-gray-300"} />
    ));

  return (
    <>
      {/* Header — Signature */}
      <div className="flex flex-col items-center text-center">
        <Avatar profile={profile} className="h-24 w-24 ring-1 ring-black/5 shadow-sm" />
        <h1 data-testid="t-name" className="mt-6 text-5xl font-semibold tracking-tighter text-gray-900 font-display leading-none">
          {profile.display_name}
        </h1>
        <p className="mt-3 text-base font-medium text-accent">{profile.tagline}</p>
        <p className="mt-3 text-xs text-gray-400">{profile.city}, {profile.country}</p>
        {profile.bio && (
          <p className="mt-6 max-w-md text-base leading-8 text-gray-600">{profile.bio}</p>
        )}
        <div className="mt-8 w-full max-w-[400px] flex flex-col gap-3">
          <a data-testid="cta-wa" href={links.mainWa} target="_blank" rel="noopener noreferrer" className="h-14 w-full rounded-full bg-whatsapp text-white font-semibold inline-flex items-center justify-center gap-2 transition-colors duration-200 hover:bg-whatsapp-hover">
            <SocialIcon platform="whatsapp" className="h-4 w-4" />
            {msg.whatsapp} — {profile.display_name.split(" ")[0]}
          </a>
          <a href={links.telLink} className="h-12 w-full rounded-full border border-gray-300 text-gray-700 text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors duration-200 hover:bg-gray-50">
            <Phone />
            {msg.call}
          </a>
        </div>
      </div>

      {/* Services — liste éditoriale à filets */}
      {services.length > 0 && (
        <section className="mt-12">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">{msg.services}</h2>
          <div data-testid="services" className="mt-4 border-t border-gray-200 divide-y divide-gray-200">
            {services.map((s) => {
              const href = trackClick(`click_service_${s.id}`, buildWaLink(profile.phone_e164, buildServiceWaMessage(s.title, s.price, s.currency)));
              return (
                <div key={s.id} className="py-5 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[17px] font-medium text-gray-900">{s.title}</p>
                    {s.description && <p className="mt-1 text-sm leading-6 text-gray-500">{s.description}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    {s.price != null && <p className="text-lg font-semibold text-accent">{s.price.toLocaleString()} {s.currency}</p>}
                    <a href={href} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs font-medium text-gray-500 underline underline-offset-4 transition-colors hover:text-accent">
                      {msg.demandBtn} →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Portfolio */}
      {portfolio.length > 0 && (
        <section className="mt-12">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">{msg.portfolio}</h2>
          <div data-testid="portfolio" className="mt-4 grid grid-cols-3 gap-2">
            {portfolio.map((p) => (
              <div key={p.id} className="relative aspect-square overflow-hidden rounded-2xl">
                <Image src={p.thumbnail_url || p.media_url} alt={p.title || ""} fill sizes="(max-width: 768px) 33vw, 200px" className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials — blocs éditoriaux */}
      {testimonials.length > 0 && (
        <section className="mt-12">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">{msg.testimonials.title}</h2>
          <div data-testid="testimonials" className="mt-4 flex flex-col gap-6">
            {testimonials.map((t) => (
              <div key={t.id} className="border-l-2 border-gray-200 pl-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">{stars(t)}</div>
                </div>
                <p className="mt-2 text-[15px] leading-7 text-gray-700">« {t.content} »</p>
                <p className="mt-2 text-xs font-semibold text-gray-900">{t.authorName}{t.authorRole ? ` · ${t.authorRole}` : ""}</p>
                {t.createdAt && <p className="mt-0.5 text-[11px] text-gray-400">{formatTestimonialDate(locale, t.createdAt)}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Socials — lignes */}
      {socials.length > 0 && (
        <section className="mt-12">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">{msg.socials}</h2>
          <div data-testid="socials" className="mt-3 border-y border-gray-200 divide-y divide-gray-200">
            {socials.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 py-3 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900">
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