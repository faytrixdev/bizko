"use client";

import { getTemplate } from "@/lib/templates";
import { DEMO_FIXTURES } from "@/app/demo/fixtures";
import type { Template } from "@/types/database";

interface ProfileMockupProps {
  /** Fixture démo → rend le vrai composant template (identique à /demo). */
  demo: Template;
  /** Coque mobile (hero) : status bar + encoche. */
  frame?: boolean;
  /** Hauteur (px) de la fenêtre de rendu ; le surplus est masqué. */
  height?: string;
}

function TemplateContent({ demo, height }: { demo: Template; height: string }) {
  const tpl = getTemplate(demo);
  const fixture = DEMO_FIXTURES[demo];
  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      <div className={`w-full h-full ${tpl.bgClass}`}>
        <div className="max-w-[640px] mx-auto px-4 py-6">
          <tpl.Component {...fixture} />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-white/70" />
    </div>
  );
}

export function ProfileMockup({
  demo,
  frame = false,
  height = "560px",
}: ProfileMockupProps) {
  if (frame) {
    return (
      <div className="relative mx-auto">
        {/* Ambient glow */}
        <div className="absolute -inset-6 bg-gradient-to-b from-accent/[0.07] via-transparent to-transparent rounded-[3rem] blur-3xl pointer-events-none" />

        {/* Phone body */}
        <div className="relative bg-gray-900 rounded-[2.5rem] p-[10px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3),0_0_40px_rgba(255,107,53,0.06)]">
          {/* Screen */}
          <div className="relative bg-white rounded-[1.75rem] overflow-hidden">
            {/* Status bar */}
            <div className="flex items-center justify-between px-5 pt-3 pb-1 bg-white relative">
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

            <TemplateContent demo={demo} height={height} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-gray-200/80 bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow duration-300">
      <TemplateContent demo={demo} height={height} />
    </div>
  );
}