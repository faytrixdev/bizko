import { cookies } from "next/headers";
import { getMessages, defaultLocale, type Locale } from "./messages";

export async function getServerMessages() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("bizko-locale")?.value as Locale) || defaultLocale;
  return getMessages(locale);
}
