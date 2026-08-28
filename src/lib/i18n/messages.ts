import fr from "@/../messages/fr.json";
import en from "@/../messages/en.json";
import { defaultLocale, locales, type Locale } from "./config";

export { defaultLocale, locales, type Locale };

export const messages = { fr, en } as const;

export function getMessages(locale: Locale) {
  return messages[locale] ?? messages[defaultLocale];
}