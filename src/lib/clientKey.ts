import { createHash } from "node:crypto";

/**
 * IP cliente « de confiance » côté serveur.
 *
 * Derrière Vercel, `x-real-ip` est posé par la plateforme et `x-forwarded-for`
 * peut contenir une valeur fournie par le client en tête de liste : on prend
 * donc `x-real-ip` en priorité, puis le DERNIER maillon de `x-forwarded-for`
 * (le plus proche de l'infrastructure), jamais le premier.
 */
export function clientIp(headers: Headers): string {
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean);
    const last = hops[hops.length - 1];
    if (last) return last;
  }

  return "unknown";
}

/**
 * Clé de throttle non réversible (aucune IP en clair en base) utilisée par
 * les RPC de rate-limit (`bump_rpc_throttle`). Tronquée : 128 bits suffisent
 * largement pour distinguer les clients.
 */
export function hashClientKey(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

/** Clé de throttle à partir d'une requête entrante. */
export function requestThrottleKey(headers: Headers): string {
  return hashClientKey(clientIp(headers));
}
