import { cookies, headers } from "next/headers";
import { getMessages, defaultLocale, locales, type Locale } from "./messages";

// Best effort browser language detection: walk Accept-Language (e.g. "en-US,en;q=0.9,fr;q=0.8")
// and return the first supported locale. Accounts for q-values being split by ";".
function fromAcceptLanguage(value: string | null): Locale | null {
  if (!value) return null;
  const supported = locales as readonly string[];
  for (const raw of value.split(",")) {
    const base = raw.trim().split(";")[0].split("-")[0].toLowerCase();
    if ((supported as readonly string[]).includes(base)) return base as Locale;
  }
  return null;
}

// Resolve the locale to serve: explicit user choice (cookie bizko-locale) wins,
// otherwise fall back to the visitor's browser language, then to the site default.
export async function resolveServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("bizko-locale")?.value;
  if (cookie === "fr" || cookie === "en") return cookie;
  const headerStore = await headers();
  return fromAcceptLanguage(headerStore.get("accept-language")) ?? defaultLocale;
}

export async function getServerMessages() {
  return getMessages(await resolveServerLocale());
}