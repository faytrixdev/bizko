"use client";

import { useEffect } from "react";

/**
 * Strips all query parameters from the current URL (via history.replaceState)
 * after they have been consumed by the component. Keeps the address bar clean
 * without triggering a re-render.
 */
export function useCleanUrl() {
  useEffect(() => {
    const { pathname, hash } = window.location;
    if (window.location.search) {
      window.history.replaceState(null, "", pathname + hash);
    }
  }, []);
}
