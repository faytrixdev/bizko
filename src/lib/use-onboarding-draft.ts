"use client";

import { useSyncExternalStore } from "react";

const STORAGE_PREFIX = "bizko-onboarding-draft:";
const UPDATE_EVENT = "bizko-onboarding-draft-updated";
const EMPTY: Record<string, string> = {};

// Cache the parsed draft per user so useSyncExternalStore snapshots keep a
// stable reference (a fresh object per call would re-render forever).
const cache = new Map<string, Record<string, string>>();

function keyFor(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

function readFromStorage(key: string): Record<string, string> {
  const cached = cache.get(key);
  if (cached) return cached;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as unknown;
    const value =
      parsed && typeof parsed === "object" ? (parsed as Record<string, string>) : EMPTY;
    cache.set(key, value);
    return value;
  } catch {
    return EMPTY;
  }
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(UPDATE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(UPDATE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/**
 * Reads the onboarding form draft for a user from localStorage (per-user key
 * so a different account on the same browser never sees someone else's data).
 * SSR-safe snapshot.
 */
export function useOnboardingDraft(userId: string): Record<string, string> {
  const key = keyFor(userId);
  return useSyncExternalStore(
    subscribe,
    () => readFromStorage(key),
    () => EMPTY,
  );
}

/** Persists the onboarding form draft for a user and notifies subscribers. */
export function writeOnboardingDraft(userId: string, fields: Record<string, string>): void {
  if (typeof window === "undefined") return;
  const key = keyFor(userId);
  cache.set(key, fields);
  try {
    window.localStorage.setItem(key, JSON.stringify(fields));
    window.dispatchEvent(new Event(UPDATE_EVENT));
  } catch {
    // localStorage unavailable: ignore.
  }
}

/** Clears the onboarding form draft for a user. */
export function clearOnboardingDraft(userId: string): void {
  if (typeof window === "undefined") return;
  const key = keyFor(userId);
  cache.delete(key);
  try {
    window.localStorage.removeItem(key);
    window.dispatchEvent(new Event(UPDATE_EVENT));
  } catch {
    // ignore
  }
}