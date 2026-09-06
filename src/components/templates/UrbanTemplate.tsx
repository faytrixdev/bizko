import { buildWaLink, buildServiceWaMessage } from "@/lib/utils";
import Image from "next/image";
import { SocialIcon } from "@/components/socialIcons";
import { TestimonialCard } from "@/components/TestimonialCard";
import { initials, formatTestimonialDate } from "./shared";
import type { TemplateProps } from "./types";

const DISPLAY = { fontFamily: "var(--font-sora, ui-sans-serif, sans-serif)" };

export function UrbanTemplate({ profile, services, portfolio, socials, testimonials, msg, locale, links, trackClick }: TemplateProps) {
  return (
    <>
      {/* Header */}
      <header className="text-center pt-2">
        {profile.avatar_url ? (
          <div className="mx-auto h-28 w-28 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#EC4899] p-1 shadow-lg shadow-[#7C3AED]/25">
            <Image src={profile.avatar_url} alt={profile.display_name} width={104} height={104} className="h-full w-full rounded-full object-cover ring-4 ring-white" />
          </div>
        ) : (
          <div className="mx-auto h-28 w-28 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#EC4899] flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-[#7C3AED]/25">
            {initials(profile.display_name)}
          </div>
        )}
        <h1 style={DISPLAY} className="mt-5 text-3xl font-bold tracking-tight text-gray-900">{profile.display_name}</h1>
        <span className="mt-3 inline-flex items-center px-4 py-1.5 rounded-full bg-[#F3E8FF] text-[#7C3AED] text-xs font-semibold">{profile.tagline}</span>
        <p className="mt-3 text-xs text-gray-400">{profile.city}, {profile.country}</p>
        {profile.bio && <p className="mt-5 text-sm leading-7 text-gray-600 max-w-md mx-auto">{profile.bio}</p>}
        <div className="mt-7 flex gap-3 w-full max-w-[400px] mx-auto">
          <a href={links.mainWa} target="_blank" rel="noopener noreferrer" className="flex-1 h-12 rounded-2xl bg-[#7C3AED] text-white font-semibold inline-flex items-center justify-center gap-2 hover:bg-[#6D28D9] transition-colors duration-200 shadow-md shadow-[#7C3AED]/25">
            <SocialIcon platform="whatsapp" className="w-4 h-4" />
            {msg.whatsapp}
          </a>
          <a href={links.telLink} className="h-12 w-12 rounded-2xl border border-gray-200 bg-white inline-flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors duration-200">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
          </a>
        </div>
      </header>

      {/* Services — pill cards */}
      {services.length > 0 && (
        <section className="mt-9">
          <h2 style={DISPLAY} className="text-sm font-bold text-gray-900 mb-4">{msg.services}</h2>
          <div className="flex flex-col gap-3">
            {services.map((s, i) => {
              const href = trackClick(`click_service_${s.id}`, buildWaLink(profile.phone_e164, buildServiceWaMessage(s.title, s.price, s.currency)));
              const chips = ["bg-[#F3E8FF] text-[#7C3AED]", "bg-[#FCE7F3] text-[#DB2777]", "bg-[#CFFAFE] text-[#0891B2]", "bg-[#FFF7ED] text-[#EA580C]"];
              const chip = chips[i % chips.length];
              return (
                <div key={s.id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">{s.title}</p>
                    {s.description && <p className="text-sm text-gray-500 mt-0.5">{s.description}</p>}
                    <span className={`mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${chip}`}>
                      {s.price != null ? `${s.price.toLocaleString()} ${s.currency}` : msg.demandBtn}
                    </span>
                  </div>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="shrink-0 h-10 px-4 rounded-2xl bg-[#7C3AED] text-white text-xs font-semibold inline-flex items-center justify-center hover:bg-[#6D28D9] transition-colors duration-200 shadow-sm shadow-[#7C3AED]/20">{msg.demandBtn}</a>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Portfolio — dynamic grid */}
      {portfolio.length > 0 && (
        <section className="mt-9">
          <h2 style={DISPLAY} className="text-sm font-bold text-gray-900 mb-4">{msg.portfolio}</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {portfolio.map((p, i) => (
              <div key={p.id} className={`relative overflow-hidden rounded-2xl ${i % 3 === 0 ? "aspect-square col-span-2" : "aspect-square"}`}>
                <Image src={p.thumbnail_url || p.media_url} alt={p.title || ""} fill sizes="(max-width: 768px) 50vw, 300px" className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="mt-9">
          <h2 style={DISPLAY} className="text-sm font-bold text-gray-900 mb-4">{msg.testimonials.title}</h2>
          <div className="flex flex-col gap-3">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} starLabel={msg.testimonials.starsAria} date={formatTestimonialDate(locale, t.createdAt)} />
            ))}
          </div>
        </section>
      )}

      {/* Socials — colored circles */}
      {socials.length > 0 && (
        <section className="mt-9">
          <h2 style={DISPLAY} className="text-sm font-bold text-gray-900 mb-4">{msg.socials}</h2>
          <div className="flex flex-wrap gap-3">
            {socials.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="h-12 w-12 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] inline-flex items-center justify-center hover:bg-[#7C3AED] hover:text-white transition-colors duration-200">
                <SocialIcon platform={s.platform} className="w-5 h-5" />
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}