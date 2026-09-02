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
  const { analytics } = useConsent();

  useEffect(() => {
    if (!analytics || !GA_ID || typeof window.gtag !== "function") return;

    window.gtag("config", GA_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });
  }, [analytics]);

  if (!GA_ID || !analytics) return null;

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
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}
