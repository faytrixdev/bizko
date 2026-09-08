import Image from "next/image";
import type { CSSProperties } from "react";
import { DEMO_FIXTURES } from "@/app/demo/fixtures";
import type { Template } from "@/types/database";

const SERIF = { fontFamily: "var(--font-garamond, Georgia, serif)" } as CSSProperties;
const DISPLAY = { fontFamily: "var(--font-sora, ui-sans-serif, sans-serif)" } as CSSProperties;

interface ExampleCardProps {
  demo: Template;
  /** Label du lien de bas de carte. */
  footerCta: string;
}

/** Une ligne service par template — mêmes hauteurs (py identiques, texte sur 1 ligne). */
type RowTheme = {
  rowClass: string;
  number?: string;
  priceClass: string;
  chipClass?: string;
  price: (s: { price: number | null; currency: string }) => string;
};

interface Theme {
  bgClass: string;
  avatarRing: string;
  nameClass: string;
  nameStyle?: CSSProperties;
  taglineClass: string;
  taglineStyle?: CSSProperties;
  cityClass: string;
  row: RowTheme;
}

const priceText = (s: { price: number | null; currency: string }) =>
  s.price != null ? `${s.price.toLocaleString()} ${s.currency}` : "";

const THEMES: Record<Template, Theme> = {
  minimal: {
    bgClass: "bg-white",
    avatarRing: "ring-1 ring-stone-200",
    nameClass: "font-bold text-gray-900",
    taglineClass: "font-medium text-gray-500",
    cityClass: "text-gray-400",
    row: {
      rowClass: "rounded-2xl border border-stone-200 bg-white px-4 py-2.5 flex items-center justify-between gap-3",
      priceClass: "shrink-0 text-sm font-bold text-gray-900",
      price: priceText,
    },
  },
  portfolio: {
    bgClass: "bg-[#FAFAF6]",
    avatarRing: "ring-1 ring-stone-200",
    nameClass: "font-bold text-gray-900",
    taglineClass: "font-medium text-[#B45309]",
    cityClass: "text-gray-400",
    row: {
      rowClass: "rounded-2xl border border-stone-200 bg-white px-4 py-2.5 flex items-center justify-between gap-3",
      priceClass: "shrink-0 text-sm font-bold text-[#B45309]",
      price: priceText,
    },
  },
  studio: {
    bgClass: "bg-white",
    avatarRing: "ring-1 ring-gray-900/10",
    nameClass: "font-bold text-gray-900",
    taglineClass: "font-medium text-gray-500",
    cityClass: "text-gray-400",
    row: {
      rowClass: "rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 flex items-center justify-between gap-3",
      priceClass: "shrink-0 text-sm font-bold text-gray-900",
      price: priceText,
    },
  },
  edito: {
    bgClass: "bg-[#FAF7F2]",
    avatarRing: "ring-4 ring-[#FAF7F2]",
    nameClass: "font-medium text-[#1C1917]",
    nameStyle: SERIF,
    taglineClass: "italic text-[#B07D3D]",
    taglineStyle: { fontStyle: "italic" },
    cityClass: "uppercase tracking-[0.2em] text-[#1C1917]/50",
    row: {
      rowClass: "flex items-center gap-3 border-b border-[#1C1917]/10 py-2.5",
      number: "text-xs italic text-[#B07D3D]",
      priceClass: "shrink-0 text-sm text-[#B07D3D]",
      price: (s) => (s.price != null ? `${s.price.toLocaleString()} ${s.currency}` : ""),
    },
  },
  urban: {
    bgClass: "bg-white",
    avatarRing: "ring-2 ring-[#7C3AED]/30",
    nameClass: "font-bold tracking-tight text-gray-900",
    nameStyle: DISPLAY,
    taglineClass: "font-bold text-[#7C3AED]",
    cityClass: "text-gray-400",
    row: {
      rowClass: "flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5",
      priceClass: "",
      chipClass: "shrink-0 rounded-full bg-white/80 px-3 py-1 text-xs font-bold",
      price: priceText,
    },
  },
  obsidienne: {
    bgClass: "bg-[#0B0B0F]",
    avatarRing: "ring-1 ring-white/20",
    nameClass: "font-semibold text-white",
    taglineClass: "font-medium text-gray-400",
    cityClass: "text-gray-500",
    row: {
      rowClass: "rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 flex items-center justify-between gap-3",
      priceClass: "shrink-0 text-sm font-bold text-amber-200",
      price: priceText,
    },
  },
};

const PANELS = ["bg-[#F3E8FF]", "bg-[#FEF3C7]", "bg-[#CFFAFE]"];
const CHIPS = ["text-[#7C3AED]", "text-[#B45309]", "text-[#0891B2]"];

/** Carte vitrine de la section exemples : squelette identique, style du template conservé. */
export function ExampleCard({ demo, footerCta }: ExampleCardProps) {
  const fixture = DEMO_FIXTURES[demo];
  const { profile, services } = fixture;
  const theme = THEMES[demo];
  const border = demo === "urban" ? "border-gray-100" : demo === "edito" ? "border-[#1C1917]/10" : "border-stone-200/70";

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] transition-shadow duration-300">
      <div className={`flex-1 ${theme.bgClass} px-5 pt-5`}>
        {/* Identité — structure commune */}
        <div className="flex items-center gap-3.5">
          <Image
            src={profile.avatar_url ?? ""}
            alt={profile.display_name}
            width={56}
            height={56}
            className={`h-14 w-14 shrink-0 rounded-full object-cover ${theme.avatarRing}`}
          />
          <div className="min-w-0">
            <h3 className={`truncate text-lg ${theme.nameClass}`} style={theme.nameStyle} data-testid="ex-name">
              {profile.display_name}
            </h3>
            <p className={`mt-0.5 truncate text-xs ${theme.taglineClass}`} style={theme.taglineStyle}>
              {profile.tagline}
            </p>
            <p className={`mt-0.5 truncate text-[11px] ${theme.cityClass}`}>
              {profile.city}, {profile.country}
            </p>
          </div>
        </div>

        {/* Services — 3 rangées identiques */}
        <div className="mt-4 flex flex-col gap-2 pb-5">
          {services.slice(0, 3).map((s, i) => (
            <div key={s.id} className={`${theme.row.rowClass} ${demo === "urban" ? PANELS[i % PANELS.length] : ""}`} data-testid="ex-service">
              {theme.row.number && (
                <span className={theme.row.number} style={SERIF}>
                  {String(i + 1).padStart(2, "0")}
                </span>
              )}
              <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-gray-900">
                {s.title}
              </span>
              {!theme.row.chipClass && (
                <span className={`shrink-0 ${theme.row.priceClass}`} style={theme.row.number ? SERIF : undefined}>
                  {theme.row.price(s)}
                </span>
              )}
              {theme.row.chipClass && (
                <span className={`${theme.row.chipClass} ${CHIPS[i % CHIPS.length]}`}>{theme.row.price(s)}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pied de carte — ancré en bas */}
      <div className={`flex items-center justify-between border-t ${border} px-5 py-3`}>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">{demo}</span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent">
          {footerCta}
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </div>
    </div>
  );
}