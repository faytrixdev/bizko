import { I18nProvider } from "@/lib/i18n/provider";
import { getMessages } from "@/lib/i18n/messages";
import { resolveServerLocale } from "@/lib/i18n/messages-server";

export default async function LegalLayout({ children }: { children: React.ReactNode }) {
  const locale = await resolveServerLocale();
  const lang: "fr" | "en" = locale === "en" ? "en" : "fr";

  return (
    <I18nProvider initialLocale={lang} initialMessages={getMessages(lang)}>
      {children}
    </I18nProvider>
  );
}