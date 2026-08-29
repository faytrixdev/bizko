import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/provider";
import { getMessages } from "@/lib/i18n/messages";
import { SessionHeartbeat } from "@/components/SessionHeartbeat";

export const metadata: Metadata = {
  title: "Bizko - Ton business en un lien",
  description:
    "Cree ton profil pro en 3 minutes. Partage-le partout. Convertis tes visiteurs en clients WhatsApp.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("bizko-locale")?.value || "fr";
  const lang = locale === "en" ? "en" : "fr";

  return (
    <html lang={lang} className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <I18nProvider initialLocale={lang as "fr" | "en"} initialMessages={getMessages(lang as "fr" | "en")}>{children}</I18nProvider>
        <SessionHeartbeat />
      </body>
    </html>
  );
}
