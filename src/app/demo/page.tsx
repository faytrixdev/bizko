"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { TEMPLATE_CONFIGS } from "@/lib/template-config";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/provider";
import type { Template } from "@/types/database";
import { DemoProfileView } from "./DemoProfileView";
import { DEMO_TEMPLATE_IDS } from "./fixtures";

export default function Demo() {
  const { t } = useI18n();
  const [tpl, setTpl] = useState<Template>("minimal");

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="inline-flex">
            <Logo size="md" />
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-gray-900 text-white px-4 py-1.5 rounded-lg"
          >
            {t("demo.createMine")}
          </Link>
        </div>
      </header>

      {/* Demo banner */}
      <div className="border-b border-gray-100 bg-gray-50/70">
        <div className="max-w-[640px] mx-auto px-4 py-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
              Démo
            </span>
            <span className="text-xs text-gray-500">Aperçu des templates Bizko</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {DEMO_TEMPLATE_IDS.map((id) => {
              const cfg = TEMPLATE_CONFIGS.find((c) => c.id === id);
              if (!cfg) return null;
              const active = tpl === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTpl(id)}
                  aria-pressed={active}
                  className={cn(
                    "shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200",
                    active
                      ? "border-accent bg-white text-gray-900 ring-1 ring-accent/30 shadow-sm"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300",
                  )}
                >
                  {t(cfg.nameKey) || id}
                  {cfg.tier === "pro" && (
                    <span className="inline-flex items-center rounded-full bg-violet-100 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-violet-700">
                      Pro
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rendered template */}
      <div key={tpl}>
        <DemoProfileView template={tpl} />
      </div>
    </div>
  );
}
