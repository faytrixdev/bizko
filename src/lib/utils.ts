import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizePhoneE164(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("00")) return "+" + cleaned.slice(2);
  return "+" + cleaned;
}

export function buildWaLink(phoneE164: string, message: string): string {
  const phone = phoneE164.replace("+", "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildMainWaMessage(displayName: string): string {
  return `Salut ${displayName}, j'ai vu ton profil Bizko et je souhaite discuter de tes services.`;
}

export function buildServiceWaMessage(serviceTitle: string, price?: number | null, currency?: string): string {
  const pricePart = price ? ` à ${price} ${currency || "XOF"}` : "";
  return `Salut, je suis intéressé par "${serviceTitle}"${pricePart}, vu sur ton profil Bizko.`;
}
