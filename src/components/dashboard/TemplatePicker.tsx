"use client";

import { useState } from "react";
import Link from "next/link";
import { TEMPLATE_CONFIGS } from "@/lib/template-config";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

interface TemplatePickerProps {
  current: string;
  isPro: boolean;
}

export function TemplatePicker({ current, isPro }: TemplatePickerProps) {
  const { t } = useI18n();
  const [selected, setSelected] = useState(current);
  const lockedId = selected
    ? TEMPLATE_CONFIGS.find((c) => c.id === selected)?.tier === "pro" && !isPro
      ? selected
      : null
    : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        {TEMPLATE_CONFIGS.map((cfg) => {
          const active = selected === cfg.id;
          const locked = cfg.tier === "pro" && !isPro;
          return (
            <button
              key={cfg.id}
              type="button"
              onClick={() => setSelected(cfg.id)}
              aria-pressed={active}
              className={cn(
                "relative rounded-2xl border p-4 text-left transition-all duration-200",
                active ? "border-accent ring-2 ring-accent/20" : "border-gray-200 hover:border-gray-300",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-gray-900 to-gray-600 flex items-center justify-center text-white font-bold text-sm">
                  {cfg.id[0].toUpperCase()}
                </span>
                {locked ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold uppercase tracking-wider">
                    {t("dashboard.templateLocked")}
                  </span>
                ) : active ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-accent" aria-hidden="true" />
                ) : null}
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">{t(cfg.nameKey) || cfg.id}</p>
              <p className="mt-1 text-[11px] leading-4 text-gray-500 line-clamp-2">{t(cfg.descriptionKey) || ""}</p>
            </button>
          );
        })}
      </div>
      <input type="hidden" name="template" value={selected} />
      {lockedId && (
        <Link
          href="/pricing"
          className="inline-flex items-center justify-center h-10 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors duration-200"
        >
          {t("dashboard.upgradeCta")}
        </Link>
      )}
    </div>
  );
}