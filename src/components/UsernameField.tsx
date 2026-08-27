"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type UsernameStatus = "idle" | "checking" | "available" | "unavailable" | "invalid";

interface UsernameFieldProps {
  onStatusChange?: (status: UsernameStatus) => void;
}

export function UsernameField({ onStatusChange }: UsernameFieldProps) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<UsernameStatus>("idle");
  const abortRef = useRef<AbortController | null>(null);

  const check = useCallback(async (username: string) => {
    if (!username) {
      setStatus("idle");
      return;
    }

    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
      setStatus("invalid");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("checking");

    try {
      const res = await fetch(`/api/check-username?username=${encodeURIComponent(username)}`, {
        signal: controller.signal,
      });
      const data = await res.json();
      if (!controller.signal.aborted) {
        setStatus(data.available ? "available" : "unavailable");
      }
    } catch {
      if (!controller.signal.aborted) {
        setStatus("idle");
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => check(value), 300);
    return () => clearTimeout(timer);
  }, [value, check]);

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  const borderColor =
    status === "available"
      ? "border-green-500 focus:border-green-600"
      : status === "unavailable" || status === "invalid"
        ? "border-red-400 focus:border-red-500"
        : "border-gray-200 focus:border-gray-900";

  return (
    <input
      name="username"
      required
      pattern="[a-z0-9_]{3,30}"
      placeholder="tonnom"
      value={value}
      onChange={(e) => setValue(e.target.value.toLowerCase())}
      className={`flex-1 min-w-0 h-11 rounded-lg border bg-white px-4 text-sm outline-none transition-colors ${borderColor}`}
    />
  );
}
