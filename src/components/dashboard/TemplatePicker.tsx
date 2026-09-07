"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { TEMPLATE_CONFIGS } from "@/lib/template-config";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

// Local demo avatars used as template thumbnails (public/avatars-demo).
const THUMBNAILS: Record<string, string> = {
  minimal: "/avatars-demo/min-awa.jpg",
  portfolio: "/avatars-demo/min-mamadou.jpg",
  studio: "/avatars-demo/min-yann.jpg",
  edito: "/avatars-demo/min-clara.jpg",
  urban: "/avatars-demo/min-jules.jpg",
  obsidienne: "/avatars-demo/min-nora.jpg",
};

interface TemplatePickerProps {
  current: string;
  isPro: boolean;
}

export function TemplatePicker({ current, isPro }: TemplatePickerProps) {
  const { t } = useI18n();
  const [selected, setSelected] = useState(current);
  const [preview, setPreview] = useState<string | null>(null);

  const previewLocked =
    !!preview && TEMPLATE_CONFIGS.find((c) => c.id === preview)?.tier === "pro" && !isPro;

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
              onClick={() => {
                setSelected(cfg.id);
                setPreview(cfg.id);
              }}
              aria-pressed={active}
              className={cn(
                "relative rounded-2xl border p-2.5 text-left transition-all duration-200 group",
                active ? "border-accent ring-2 ring-accent/20" : "border-gray-200 hover:border-gray-300",
              )}
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100">
                <Image
                  src={THUMBNAILS[cfg.id]}
                  alt={t(cfg.nameKey) || cfg.id}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 200px"
                />
                {locked ? (
                  <span className="absolute right-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    {t("dashboard.templateLocked")}
                  </span>
                ) : active ? (
                  <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-white" aria-hidden="true" />
                ) : null}
              </div>
              <p className="mt-2 text-sm font-semibold text-gray-900">{t(cfg.nameKey) || cfg.id}</p>
              <p className="mt-0.5 text-[11px] leading-4 text-gray-500 line-clamp-2">{t(cfg.descriptionKey) || ""}</p>
            </button>
          );
        })}
      </div>
      <input type="hidden" name="template" value={selected} />

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <p className="text-sm font-semibold text-gray-900">
                {t("dashboard.templatePreview")}: {t(TEMPLATE_CONFIGS.find((c) => c.id === preview)?.nameKey ?? "") || preview}
              </p>
              <button
                type="button"
                onClick={() => setPreview(null)}
                aria-label={t("dashboard.templateClosePreview")}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden bg-gray-50">
              <iframe
                src={`/demo/preview/${preview}`}
                title={t("dashboard.templatePreview")}
                className="h-full w-full"
              />
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
              <Link
                href={`/demo/preview/${preview}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                {t("dashboard.templateOpenFull")}
              </Link>
              {previewLocked ? (
                <Link
                  href="/pricing"
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
                >
                  {t("dashboard.upgradeCta")}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSelected(preview);
                    setPreview(null);
                  }}
                  className="h-9 rounded-lg bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
                >
                  {t("dashboard.templateChoose")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
