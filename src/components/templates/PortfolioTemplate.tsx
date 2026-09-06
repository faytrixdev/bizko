import { buildWaLink, buildServiceWaMessage } from "@/lib/utils";
import Image from "next/image";
import { SocialIcon } from "@/components/socialIcons";
import { TestimonialCard } from "@/components/TestimonialCard";
import { Avatar, formatTestimonialDate } from "./shared";
import type { TemplateProps } from "./types";

export function PortfolioTemplate({ profile, services, portfolio, socials, testimonials, msg, locale, links, trackClick }: TemplateProps) {
  return (
    <>
      {/* Header card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
        <Avatar profile={profile} className="ring-4 ring-white shadow-lg" />
        <h1 className="text-3xl font-bold tracking-tight font-display mt-4 text-gray-900">{profile.display_name}</h1>
        <p className="text-base font-medium text-accent mt-2">{profile.tagline}</p>
        <div className="mt-3 inline-flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <span className="text-xs font-medium text-gray-500">{profile.city}, {profile.country}</span>
        </div>
        {profile.bio && <p className="text-sm text-gray-600 mt-4 leading-7 text-left bg-gray-50/50 border border-gray-100 rounded-2xl p-5 shadow-sm">{profile.bio}</p>}
        <div className="mt-5 flex gap-3">
          <a href={links.mainWa} target="_blank" rel="noopener noreferrer" className="flex-1 h-12 rounded-xl bg-whatsapp text-white font-semibold inline-flex items-center justify-center gap-2 hover:bg-whatsapp-hover transition-all duration-200 shadow-md shadow-[#25D366]/20">
            <SocialIcon platform="whatsapp" />
            {msg.whatsapp}
          </a>
          <a href={links.telLink} className="h-12 w-12 rounded-xl border border-gray-200 bg-white inline-flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-all duration-200">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Services */}
      {services.length > 0 && (
        <div className="mt-8">
          <h2 className="font-bold font-display px-1 mb-4 text-gray-900">{msg.services}</h2>
          <div className="rounded-2xl border border-gray-100 p-4 sm:p-5 grid gap-3 shadow-sm">
            {services.map((s) => {
              const href = trackClick(`click_service_${s.id}`, buildWaLink(profile.phone_e164, buildServiceWaMessage(s.title, s.price, s.currency)));
              return (
                <div key={s.id} className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 flex gap-3 shadow-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900">{s.title}</p>
                    {s.description && <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{s.description}</p>}
                    {s.price != null && <p className="text-sm font-bold text-accent mt-2">{s.price.toLocaleString()} {s.currency}</p>}
                  </div>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="self-center shrink-0 h-9 px-4 rounded-xl bg-accent text-white text-xs font-semibold inline-flex items-center justify-center hover:bg-accent-hover transition-all duration-200 shadow-sm shadow-[#FF6B35]/20">{msg.demandBtn}</a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Portfolio */}
      {portfolio.length > 0 && (
        <div className="mt-8">
          <h2 className="font-bold font-display px-1 mb-4 text-gray-900">{msg.portfolio}</h2>
          <div className="grid grid-cols-3 gap-2">
            {portfolio.map((p) => (
              <div key={p.id} className="relative aspect-square overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <Image src={p.thumbnail_url || p.media_url} alt={p.title || ""} fill sizes="(max-width: 768px) 33vw, 200px" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <div className="mt-8">
          <h2 className="font-bold font-display px-1 mb-4 text-gray-900">{msg.testimonials.title}</h2>
          <p className="px-1 mb-4 -mt-2 text-xs text-gray-500">{msg.testimonials.subtitle}</p>
          <div className="flex flex-col gap-3">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} starLabel={msg.testimonials.starsAria} date={formatTestimonialDate(locale, t.createdAt)} />
            ))}
          </div>
        </div>
      )}

      {/* Socials */}
      {socials.length > 0 && (
        <div className="mt-8">
          <h2 className="font-bold font-display px-1 mb-4 text-gray-900">{msg.socials}</h2>
          <div className="grid gap-2">
            {socials.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                className="h-12 rounded-xl bg-gray-900 text-white font-semibold inline-flex items-center justify-center gap-2 hover:bg-gray-800 transition-all duration-200 shadow-sm">
                <SocialIcon platform={s.platform} />
                <span className="capitalize">{s.platform}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}