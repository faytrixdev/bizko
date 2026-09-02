"use client";

import { useEffect } from "react";
import Script from "next/script";
import { useConsent } from "@/lib/cookies/consent-context";

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function GoogleAnalytics() {
  const { analytics, status } = useConsent();

  useEffect(() => {
    if (!GA_ID || typeof window.gtag !== "function") return;

    if (status === "pending") {
      window.gtag("consent", "default", { analytics_storage: "denied" });
    } else if (analytics) {
      window.gtag("consent", "update", { analytics_storage: "granted" });
      window.gtag("config", GA_ID, {
        page_title: document.title,
        page_location: window.location.href,
      });
    }
  }, [analytics, status]);

  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('consent', 'default', { analytics_storage: 'denied' });
          gtag('config', '${GA_ID}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
