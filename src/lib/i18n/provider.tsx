"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { defaultLocale, type Locale } from "./config";
import { getMessages } from "./messages";

type Messages = Record<string, unknown>;
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

export function I18nProvider({
  children,
  initialLocale,
  initialMessages,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
  initialMessages?: Messages;
}) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (initialLocale) return initialLocale;
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("bizko-locale");
      return saved === "fr" || saved === "en" ? saved : defaultLocale;
    }
    return defaultLocale;
  });

  const [messages, setMessages] = useState<Messages>(
    () =>
      initialMessages ??
      (getMessages(initialLocale ?? defaultLocale) as unknown as Messages)
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    setMessages(getMessages(l) as unknown as Messages);
    document.documentElement.lang = l;
    try {
      window.localStorage.setItem("bizko-locale", l);
    } catch {
      // localStorage indisponible (navigation privée etc.) : le cookie suffit.
    }
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `bizko-locale=${l}; path=/; max-age=31536000; SameSite=Lax${secure}`;
  }, []);

  const t = useCallback((path: string) => getNested(messages, path), [messages]);

  return <I18nCtx.Provider value={{ locale, setLocale, t }}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  return useContext(I18nCtx);
}