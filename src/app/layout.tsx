import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/provider";
import { getMessages } from "@/lib/i18n/messages";
import { SessionHeartbeat } from "@/components/SessionHeartbeat";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { CookieConsentProvider } from "@/lib/cookies/consent-context";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { PwaProvider } from "@/components/pwa/PwaProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://bizko.pro"),
  title: "Bizko - Ton business en un lien",
  description:
    "Crée ton profil pro en 3 minutes. Partage-le partout. Convertis tes visiteurs en clients WhatsApp.",
  manifest: "/manifest.json",
  applicationName: "Bizko",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bizko",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("bizko-locale")?.value || "fr";
  const lang = locale === "en" ? "en" : "fr";

  return (
    <html lang={lang} className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <I18nProvider initialLocale={lang as "fr" | "en"} initialMessages={getMessages(lang as "fr" | "en")}>
          <CookieConsentProvider>
            <PwaProvider>
              {children}
              <CookieConsentBanner />
            </PwaProvider>
          </CookieConsentProvider>
        </I18nProvider>
        <SessionHeartbeat />
        <AnalyticsTracker />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
