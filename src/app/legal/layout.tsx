"use client";

import { I18nProvider } from "@/lib/i18n/provider";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}
