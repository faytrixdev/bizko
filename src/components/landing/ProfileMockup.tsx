"use client";

import { useI18n } from "@/lib/i18n/provider";

interface Social {
  platform: string;
  url: string;
}

interface Service {
  title: string;
  price: string;
}

interface PortfolioItem {
  image: string;
  label?: string;
}

interface ProfileMockupProps {
  name: string;
  initials: string;
  profession: string;
  bio: string;
  location: string;
  services: Service[];
  portfolio?: PortfolioItem[];
  socials?: Social[];
  avatarUrl?: string;
  variant?: "default" | "compact" | "detailed";
  frame?: boolean;
}

const WHATSAPP_ICON = (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const MAP_PIN = (
  <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const socialStyles: Record<string, { bg: string; hover: string; icon: React.ReactNode }> = {
  instagram: {
    bg: "bg-[#E4405F]",
    hover: "hover:bg-[#D63384]",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  tiktok: {
    bg: "bg-[#000000]",
    hover: "hover:bg-[#1a1a1a]",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
  whatsapp: {
    bg: "bg-[#25D366]",
    hover: "hover:bg-[#128C7E]",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  linkedin: {
    bg: "bg-[#0A66C2]",
    hover: "hover:bg-[#004182]",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  facebook: {
    bg: "bg-[#1877F2]",
    hover: "hover:bg-[#0D65D9]",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
      </svg>
    ),
  },
  x: {
    bg: "bg-[#000000]",
    hover: "hover:bg-[#1a1a1a]",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z" />
      </svg>
    ),
  },
  youtube: {
    bg: "bg-[#FF0000]",
    hover: "hover:bg-[#CC0000]",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
};

function RealProfile({
  name,
  initials,
  profession,
  bio,
  location,
  services,
  portfolio,
  socials,
  avatarUrl,
}: Omit<ProfileMockupProps, "frame" | "variant">) {
  const { t } = useI18n();
  return (
    <div className="px-4 pb-6 pt-2">
      {/* Avatar */}
      <div className="flex justify-center">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="h-[72px] w-[72px] rounded-full object-cover shadow-lg ring-4 ring-white"
          />
        ) : (
          <div className="h-[72px] w-[72px] rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white font-bold text-lg shadow-lg ring-4 ring-white">
            {initials}
          </div>
        )}
      </div>

      {/* Name */}
      <h1 className="mt-3 text-[22px] font-bold font-display text-center text-gray-900 leading-tight">
        {name}
      </h1>

      {/* Tagline */}
      <p className="mt-1 text-sm font-medium text-[#FF6B35] text-center">
        {profession}
      </p>

      {/* Location pill */}
      <div className="mt-2 flex justify-center">
        <div className="inline-flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1">
          {MAP_PIN}
          <span className="text-[11px] font-medium text-gray-500">{location}</span>
        </div>
      </div>

      {/* Bio */}
      <p className="mt-4 text-xs leading-6 text-gray-600 bg-gray-50/50 border border-gray-100 rounded-2xl p-4 shadow-sm text-left">
        {bio}
      </p>

      {/* WhatsApp + Call buttons */}
      <div className="mt-4 flex flex-col gap-2">
        <div className="h-10 w-full rounded-xl bg-[#25D366] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-sm shadow-[#25D366]/20">
          {WHATSAPP_ICON}
          WhatsApp - {name.split(" ")[0]}
        </div>
        <div className="h-9 w-full rounded-xl border border-gray-200 bg-white text-xs font-medium inline-flex items-center justify-center gap-2 text-gray-700">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
          </svg>
          {t("landing.mockupCall")}
        </div>
      </div>

      {/* Services section */}
      {services.length > 0 && (
        <div className="mt-5">
          <h2 className="text-[11px] font-bold font-display tracking-widest uppercase text-gray-400 px-1 mb-3">
            {t("landing.mockupServices")}
          </h2>
          <div className="space-y-2">
            {services.map((s, i) => (
              <div
                key={i}
                className="bg-gray-50/50 border border-gray-100 rounded-2xl p-3.5 shadow-sm flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900">{s.title}</p>
                  <p className="text-xs font-bold text-[#FF6B35] mt-1">{s.price}</p>
                </div>
                <div className="shrink-0 inline-flex items-center gap-1 h-7 px-3 rounded-xl bg-[#25D366] text-white text-[10px] font-semibold shadow-sm shadow-[#25D366]/20">
                  {WHATSAPP_ICON}
                  {t("landing.mockupRequest")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Portfolio section */}
      {portfolio && portfolio.length > 0 && (
        <div className="mt-5">
          <h2 className="text-[11px] font-bold font-display tracking-widest uppercase text-gray-400 px-1 mb-3">
            {t("landing.mockupPortfolio")}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {portfolio.map((p, i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
              >
                <img
                  src={p.image}
                  alt={p.label || ""}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Socials section */}
      {socials && socials.length > 0 && (
        <div className="mt-5">
          <h2 className="text-[11px] font-bold font-display tracking-widest uppercase text-gray-400 px-1 mb-3">
            {t("landing.mockupSocials")}
          </h2>
          <div className="space-y-2">
            {socials.map((s, i) => {
              const style = socialStyles[s.platform] || socialStyles.instagram;
              return (
                <div
                  key={i}
                  className={`${style.bg} ${style.hover} h-10 rounded-xl text-white text-xs font-semibold inline-flex items-center justify-center gap-2 w-full shadow-sm`}
                >
                  {style.icon}
                  <span className="capitalize">{s.platform}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <p className="text-center text-[10px] text-gray-300 mt-5">
        {t("landing.mockupFooter")}{" "}
        <span className="font-medium text-[#FF6B35]">Bizko</span>{" "}
        - bizko.me/{name.toLowerCase().replace(/\s/g, "")}
      </p>
    </div>
  );
}

function CompactProfile({
  name,
  initials,
  profession,
  bio,
  location,
  services,
  variant,
  avatarUrl,
}: Omit<ProfileMockupProps, "frame" | "portfolio" | "socials">) {
  const { t } = useI18n();
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
      {/* Avatar */}
      <div className="flex justify-center">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="h-16 w-16 rounded-full object-cover shadow-lg ring-4 ring-white"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white font-bold text-base shadow-lg ring-4 ring-white">
            {initials}
          </div>
        )}
      </div>

      {/* Name */}
      <h1 className="mt-3 text-lg font-bold font-display text-center text-gray-900 leading-tight">
        {name}
      </h1>

      {/* Tagline */}
      <p className="mt-1 text-xs font-medium text-[#FF6B35] text-center">
        {profession}
      </p>

      {/* Location pill */}
      <div className="mt-2 flex justify-center">
        <div className="inline-flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1">
          {MAP_PIN}
          <span className="text-[10px] font-medium text-gray-500">{location}</span>
        </div>
      </div>

      {/* Bio */}
      {variant !== "compact" && (
        <p className="mt-4 text-[11px] leading-5 text-gray-600 bg-gray-50/50 border border-gray-100 rounded-2xl p-3.5 shadow-sm text-left">
          {bio}
        </p>
      )}

      {/* Services */}
      {services.length > 0 && (
        <div className="mt-5">
          <h2 className="text-[10px] font-bold font-display tracking-widest uppercase text-gray-400 text-center mb-2.5">
            {t("landing.mockupServices")}
          </h2>
          <div className="space-y-1.5">
            {services.map((s, i) => (
              <div
                key={i}
                className="bg-gray-50/50 border border-gray-100 rounded-xl p-3 shadow-sm flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-gray-900">{s.title}</p>
                  <p className="text-[11px] font-bold text-[#FF6B35] mt-0.5">{s.price}</p>
                </div>
                <div className="shrink-0 inline-flex items-center gap-1 h-6 px-2.5 rounded-lg bg-[#25D366] text-white text-[9px] font-semibold shadow-sm shadow-[#25D366]/20">
                  {WHATSAPP_ICON}
                  {t("landing.mockupRequest")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <p className="text-[9px] text-center text-gray-300 mt-4 font-medium">
        {t("landing.mockupFooter")}{" "}
        <span className="font-medium text-[#FF6B35]">Bizko</span>{" "}
        - bizko.me/{name.toLowerCase().replace(/\s/g, "")}
      </p>
    </div>
  );
}

export function ProfileMockup({
  name,
  initials,
  profession,
  bio,
  location,
  services,
  portfolio = [],
  socials = [],
  avatarUrl,
  variant = "default",
  frame = false,
}: ProfileMockupProps) {
  if (frame) {
    return (
      <div className="relative mx-auto">
        {/* Ambient glow */}
        <div className="absolute -inset-6 bg-gradient-to-b from-[#FF6B35]/[0.07] via-transparent to-transparent rounded-[3rem] blur-3xl pointer-events-none" />

        {/* Phone body */}
        <div className="relative bg-gray-900 rounded-[2.5rem] p-[10px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3),0_0_40px_rgba(255,107,53,0.06)]">
          {/* Screen */}
          <div className="relative bg-white rounded-[1.75rem] overflow-hidden">
            {/* Status bar */}
            <div className="flex items-center justify-between px-5 pt-3 pb-1 bg-white">
              <span className="text-[11px] font-semibold text-gray-900">9:41</span>
              <div className="absolute left-1/2 -translate-x-1/2 top-2.5">
                <div className="w-20 h-5 bg-gray-900 rounded-full" />
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
                </svg>
                <svg className="w-3.5 h-3.5 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" />
                </svg>
              </div>
            </div>

            {/* Real Bizko profile content */}
            <RealProfile
              name={name}
              initials={initials}
              profession={profession}
              bio={bio}
              location={location}
              services={services}
              portfolio={portfolio}
              socials={socials}
              avatarUrl={avatarUrl}
            />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <CompactProfile
        name={name}
        initials={initials}
        profession={profession}
        bio={bio}
        location={location}
        services={services}
        variant={variant}
        avatarUrl={avatarUrl}
      />
    );
  }

  return (
    <CompactProfile
      name={name}
      initials={initials}
      profession={profession}
      bio={bio}
      location={location}
      services={services}
      variant={variant}
      avatarUrl={avatarUrl}
    />
  );
}
