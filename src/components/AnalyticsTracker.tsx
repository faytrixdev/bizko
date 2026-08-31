"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function getSessionId(): string {
  let id = sessionStorage.getItem("bizko_analytics_sid");
  if (!id) {
    id = "s-" + crypto.randomUUID().replace(/-/g, "").slice(0, 24);
    sessionStorage.setItem("bizko_analytics_sid", id);
  }
  return id;
}

function detectDevice(): string {
  const ua = navigator.userAgent;
  if (/tablet|ipad/i.test(ua)) return "tablet";
  if (/mobile|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Other";
}

function detectOS(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Win")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  return "Other";
}

function parseUTM(search: string) {
  const params = new URLSearchParams(search);
  return {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_content: params.get("utm_content"),
    utm_term: params.get("utm_term"),
  };
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    void getSessionId();
    const utm = parseUTM(searchParams.toString());
    const device = detectDevice();
    const browser = detectBrowser();
    const os = detectOS();

    const track = (eventName: string, extra: Record<string, string | null> = {}) => {
      supabase
        .rpc("track_analytics_event", {
          p_event_name: eventName,
          p_page_path: pathname,
          p_referrer: document.referrer || null,
          p_device_type: device,
          p_browser: browser,
          p_os: os,
          ...utm,
          ...extra,
        })
        .then(({ error }) => {
          if (error) {
            console.error(`[AnalyticsTracker] ${eventName} failed:`, error.message);
          }
        });
    };

    // Session start (once per page load)
    if (!initRef.current) {
      initRef.current = true;
      track("session_start");
    }

    // Page view on every navigation
    track("page_view");
  }, [pathname, searchParams]);

  return null;
}
