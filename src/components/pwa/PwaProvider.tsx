"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export const isStandalone =
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true);

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface PwaContextValue {
  canInstall: boolean;
  isStandalone: boolean;
  install: () => Promise<"accepted" | "dismissed" | "unavailable">;
}

const PwaContext = createContext<PwaContextValue>({
  canInstall: false,
  isStandalone: false,
  install: async () => "unavailable",
});

export function usePwaInstall() {
  return useContext(PwaContext);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration is best-effort; ignore failures (private mode, unsupported).
    });
  });
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState<boolean>(() => isStandalone);

  useEffect(() => {
    registerServiceWorker();

    if (isStandalone) return;

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setDeferredPrompt(null);
      setStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    const media = window.matchMedia("(display-mode: standalone)");
    const handleMediaChange = (evt: MediaQueryListEvent) => setStandalone(evt.matches);
    media.addEventListener?.("change", handleMediaChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
      media.removeEventListener?.("change", handleMediaChange);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return "unavailable" as const;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return choice.outcome;
    } catch {
      return "unavailable" as const;
    }
  }, [deferredPrompt]);

  const value = useMemo<PwaContextValue>(
    () => ({
      canInstall: !standalone && deferredPrompt !== null,
      isStandalone: standalone,
      install,
    }),
    [standalone, deferredPrompt, install]
  );

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>;
}
