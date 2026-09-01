const KEY = "bizko_analytics_sid";

export function getAnalyticsSessionId(): string {
  if (typeof window === "undefined" || typeof sessionStorage === "undefined") {
    return "";
  }
  try {
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = "s-" + crypto.randomUUID().replace(/-/g, "").slice(0, 24);
      sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}