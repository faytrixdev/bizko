import { cookies } from "next/headers";
import fr from "@/../messages/fr.json";
import en from "@/../messages/en.json";

export const messages = { fr, en } as const;
export type Locale = keyof typeof messages;
export const locales: Locale[] = ["fr", "en"];
export const defaultLocale: Locale = "fr";

export function getMessages(locale: Locale) {
  return messages[locale] ?? messages[defaultLocale];
}

export async function getServerMessages() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("bizko-locale")?.value as Locale) || defaultLocale;
  return getMessages(locale);
}
