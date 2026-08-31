"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

type ConsentStatus = "pending" | "accepted" | "refused";

interface ConsentState {
  status: ConsentStatus;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

interface ConsentCtx extends ConsentState {
  setConsent: (status: "accepted" | "refused") => void;
  openBanner: () => void;
  resetConsent: () => void;
}

const STORAGE_KEY = "bizko-consent";
const DEFAULT_STATE: ConsentState = {
  status: "pending",
  analytics: false,
  marketing: false,
  preferences: false,
};

const ConsentContext = createContext<ConsentCtx>({
  ...DEFAULT_STATE,
  setConsent: () => {},
  openBanner: () => {},
  resetConsent: () => {},
});

function loadConsent(): ConsentState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.status === "string") {
      return {
        status: parsed.status,
        analytics: Boolean(parsed.analytics),
        marketing: Boolean(parsed.marketing),
        preferences: Boolean(parsed.preferences),
      };
    }
  } catch {}
  return DEFAULT_STATE;
}

function saveConsent(state: ConsentState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConsentState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadConsent());
    setHydrated(true);
  }, []);

  const setConsent = useCallback((status: "accepted" | "refused") => {
    const next: ConsentState = {
      status,
      analytics: status === "accepted",
      marketing: status === "accepted",
      preferences: status === "accepted",
    };
    setState(next);
    saveConsent(next);
  }, []);

  const openBanner = useCallback(() => {
    setState((prev) => ({ ...prev, status: "pending" }));
  }, []);

  const resetConsent = useCallback(() => {
    setState(DEFAULT_STATE);
    saveConsent(DEFAULT_STATE);
  }, []);

  return (
    <ConsentContext.Provider value={{ ...state, setConsent, openBanner, resetConsent }}>
      {hydrated ? children : null}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  return useContext(ConsentContext);
}
