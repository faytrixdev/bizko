"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { messages, defaultLocale, type Locale } from "./messages";

type Ctx = { locale: Locale; setLocale: (l: Locale) => void; t: (path: string) => string };
const I18nCtx = createContext<Ctx>({ locale: defaultLocale, setLocale: () => {}, t: (p) => p });

function getNested(obj: Record<string, unknown>, path: string): string {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) cur = (cur as Record<string, unknown>)[p];
    else return path;
  }
  return typeof cur === "string" ? cur : path;
}

export function I18nProvider({ children, initialLocale }: { children: React.ReactNode; initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || defaultLocale);

  useEffect(() => {
    const saved = localStorage.getItem("bizko-locale") as Locale | null;
    if (saved && (saved === "fr" || saved === "en")) {
      setLocaleState(saved);
      document.documentElement.lang = saved;
    } else {
      const nav = navigator.language.slice(0, 2) as Locale;
      if (nav === "en" || nav === "fr") {
        setLocaleState(nav);
        document.documentElement.lang = nav;
      }
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("bizko-locale", l);
    document.cookie = `bizko-locale=${l}; path=/; max-age=31536000`;
    document.documentElement.lang = l;
  };

  const t = (path: string) => getNested(messages[locale] as unknown as Record<string, unknown>, path);

  return <I18nCtx.Provider value={{ locale, setLocale, t }}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  return useContext(I18nCtx);
}


