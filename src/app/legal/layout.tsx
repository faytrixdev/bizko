import { cookies } from "next/headers";
import { I18nProvider } from "@/lib/i18n/provider";
import { getMessages } from "@/lib/i18n/messages";

export default async function LegalLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("bizko-locale")?.value || "fr";
  const lang: "fr" | "en" = locale === "en" ? "en" : "fr";

  return (
    <I18nProvider initialLocale={lang} initialMessages={getMessages(lang)}>
      {children}
    </I18nProvider>
  );
}