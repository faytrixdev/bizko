"use client";

import { getTemplate } from "@/lib/templates";
import { DEMO_FIXTURES } from "@/app/demo/fixtures";
import type { TemplateProps } from "@/components/templates/types";
import type { Template } from "@/types/database";

interface ProfileMockupProps {
  /** Fixture démo → rend le vrai composant template (identique à /demo). */
  demo: Template;
  /** Sections à afficher : full = tout, detailed = header + services. */
  variant?: "full" | "detailed";
  /** Coque mobile réaliste (hero) : dimensions iPhone fixes + scroll interne. */
  frame?: boolean;
}

/** Masque les sections non voulues : le template réel ignore les tableaux vides et la bio absente. */
function trimFixture(fixture: TemplateProps, variant: "full" | "detailed"): TemplateProps {
  if (variant === "full") return fixture;
  return { ...fixture, portfolio: [], socials: [], testimonials: [] };
}

function TemplateContent({
  demo,
  variant,
}: {
  demo: Template;
  variant: "full" | "detailed";
}) {
  const tpl = getTemplate(demo);
  const fixture = trimFixture(DEMO_FIXTURES[demo], variant);
  return (
    <div className={`w-full ${tpl.bgClass}`}>
      <div className="max-w-[640px] mx-auto px-4 py-6">
        <tpl.Component {...fixture} />
      </div>
    </div>
  );
}

export function ProfileMockup({
  demo,
  variant = "full",
  frame = false,
}: ProfileMockupProps) {
  if (frame) {
    return (
      /* Coque mobile réaliste : SEUL élément qui porte la sémantique (mockup décoratif → aria-hidden sur tout ce qui est dedans). */
      <div
        role="img"
        aria-label="Aperçu du profil Bizko dans une coque de téléphone mobile"
        className="relative mx-auto"
      >
        {/* Lumière ambiante */}
        <div aria-hidden className="absolute -inset-6 bg-gradient-to-b from-accent/[0.07] via-transparent to-transparent rounded-[3rem] blur-3xl pointer-events-none" />

        {/* Boutons latéraux de la coque (décoratifs : silencieux, volume, power) */}
        <div aria-hidden className="absolute -left-[7px] top-[14%] h-7 w-[3px] rounded-l bg-gray-800" />
        <div aria-hidden className="absolute -left-[7px] top-[23%] h-11 w-[3px] rounded-l bg-gray-800" />
        <div aria-hidden className="absolute -left-[7px] top-[33%] h-11 w-[3px] rounded-l bg-gray-800" />
        <div aria-hidden className="absolute -right-[7px] top-[25%] h-14 w-[3px] rounded-r bg-gray-800" />

        {/* Corps du téléphone */}
        <div className="relative bg-gray-900 rounded-[2.75rem] p-[12px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3),0_0_40px_rgba(255,107,53,0.06)]">
          {/* Écran : dimensions FIXES (set explicite), contenu qui scrolle DEDANS */}
          <div className="relative bg-white rounded-[2rem] overflow-hidden w-[300px] h-[644px] sm:w-[320px] sm:h-[688px]">
            {/* Barre de statut + encoche */}
            <div className="relative flex items-center justify-between px-5 pt-3 pb-1 bg-white">
              <span aria-hidden className="text-[11px] font-semibold text-gray-900">9:41</span>
              {/* Dynamic Island */}
              <div aria-hidden className="absolute left-1/2 -translate-x-1/2 top-2.5">
                <div className="w-20 h-5 bg-gray-900 rounded-full" />
              </div>
              <div aria-hidden className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
                </svg>
                <svg className="w-3.5 h-3.5 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" />
                </svg>
              </div>
            </div>

            {/* Contenu scrollable : le scroll se fait ici, la coque ne bouge pas */}
            <div aria-hidden className="h-[calc(100%-3rem)] overflow-y-auto overscroll-contain">
              <TemplateContent demo={demo} variant={variant} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-gray-200/80 bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow duration-300">
      <TemplateContent demo={demo} variant={variant} />
    </div>
  );
}
