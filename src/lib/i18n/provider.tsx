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
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (initialLocale) return initialLocale;
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("bizko-locale");
      return saved === "fr" || saved === "en" ? saved : defaultLocale;
    }
    return defaultLocale;
  });

  useEffect(() => {
    // Keep the cookie in sync with the effective locale so SSR matches the client
    // on subsequent requests (only relevant when initialLocale was not provided).
    document.cookie = `bizko-locale=${locale}; path=/; max-age=31536000`;
    document.documentElement.lang = locale;
  }, [locale]);

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


