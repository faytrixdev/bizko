"use client";

import { useConsent as useConsentCtx } from "./consent-context";

export function useConsent() {
  return useConsentCtx();
}

export function useConsentGuard() {
  const { analytics, marketing, preferences } = useConsentCtx();
  return {
    isAnalyticsEnabled: () => analytics,
    isMarketingEnabled: () => marketing,
    isPreferencesEnabled: () => preferences,
  };
}
