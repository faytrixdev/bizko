"use client";

import { useEffect, useRef, useState } from "react";
import { getTemplate } from "@/lib/templates";
import { DEMO_FIXTURES } from "@/app/demo/fixtures";
import type { TemplateProps } from "@/components/templates/types";
import type { Template } from "@/types/database";

interface ProfileMockupProps {
  /** Fixture démo → rend le vrai composant template (identique à /demo). */
  demo: Template;
  /** Sections à afficher : full = tout, detailed = header + services. */
  variant?: "full" | "detailed";
  /**
   * Coque mobile réaliste (hero) : dimensions fixes + scroll-jack.
   * L'utilisateur scrolle la PAGE → le contenu DEDANS la coque défile (translaté)
   * jusqu'à épuisement, puis l'accès à la section suivante se libère.
   */
  frame?: boolean;
}

/** Masque les sections non voulues : le template réel ignore les sections vides et la bio absente. */
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

function FrameMockup({
  demo,
  variant,
}: {
  demo: Template;
  variant: "full" | "detailed";
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(0);
  const [offset, setOffset] = useState(0);
  const [vh, setVh] = useState(800);

  useEffect(() => {
    setVh(window.innerHeight);
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const measure = () => {
      if (!contentRef.current) return;
      const screenH = window.innerWidth >= 640 ? 688 : 644;
      setOverflow(Math.max(0, contentRef.current.offsetHeight - screenH));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (contentRef.current) ro.observe(contentRef.current);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [demo, variant]);

  useEffect(() => {
    if (overflow <= 0) return;
    let raf = 0;
    const update = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const sectionH = el.offsetHeight;
      const travel = sectionH - vh;
      if (travel <= 0) return;
      const progress = Math.min(1, Math.max(0, -rect.top / travel));
      setOffset(progress * overflow);
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [overflow, vh]);

  const screenW = "w-[300px] sm:w-[320px]";
  const screenH = "h-[644px] sm:h-[688px]";
  const sectionH = overflow > 0 ? vh + overflow + 120 : vh;

  return (
    <div ref={sectionRef} className="relative" style={{ height: sectionH }}>
      {/* Coque : SEUL élément qui porte la sémantique (mockup décoratif → aria-hidden sur tout ce qui est dedans). */}
      <div
        role="img"
        aria-label="Aperçu du profil Bizko dans une coque de téléphone mobile"
        className="sticky top-24 mx-auto w-fit"
      >
        {/* Corps du téléphone */}
        <div className="relative bg-gray-900 rounded-[2.75rem] p-[12px] shadow-[0_8px_40px_-8px_rgba(0,0,0,0.25)]">
          <div className={`relative bg-white rounded-[2rem] overflow-hidden ${screenW} ${screenH}`}>
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

            {/* Contenu : plus haut que l'écran, translaté par le scroll de la PAGE (scroll-jack). */}
            <div
              ref={contentRef}
              aria-hidden
              className="will-change-transform"
              style={{ transform: `translate3d(0, ${-offset}px, 0)` }}
            >
              <TemplateContent demo={demo} variant={variant} />
            </div>
          </div>
        </div>
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
    return <FrameMockup demo={demo} variant={variant} />;
  }

  return (
    <div className="w-full rounded-2xl border border-gray-200/80 bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow duration-300">
      <TemplateContent demo={demo} variant={variant} />
    </div>
  );
}
