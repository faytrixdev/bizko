"use client";

import React from "react";
import { Download } from "lucide-react";
import { usePwaInstall } from "./PwaProvider";
import { useI18n } from "@/lib/i18n/provider";

interface InstallAppButtonProps {
  className?: string;
}

export function InstallAppButton({ className }: InstallAppButtonProps) {
  const { canInstall, install } = usePwaInstall();
  const { t } = useI18n();

  if (!canInstall) return null;

  return (
    <button
      type="button"
      onClick={() => install()}
      className={
        "inline-flex items-center justify-center h-8 px-2.5 text-xs font-medium border border-gray-200/80 bg-white rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all duration-200 " +
        (className ?? "")
      }
      aria-label={t("pwa.install")}
    >
      <Download className="w-4 h-4" />
      <span className="hidden sm:inline ml-1.5">{t("pwa.install")}</span>
    </button>
  );
}
