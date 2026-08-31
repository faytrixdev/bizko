"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { subDays, startOfDay, endOfDay, subMonths } from "date-fns";
import type { PeriodState, DateRange } from "@/types/analytics";

function getPresetRange(preset: PeriodState["preset"]): DateRange {
  const now = new Date();
  const today = endOfDay(now);
  switch (preset) {
    case "today":
      return { start: startOfDay(now), end: today };
    case "yesterday":
      return { start: startOfDay(subDays(now, 1)), end: endOfDay(subDays(now, 1)) };
    case "7d":
      return { start: startOfDay(subDays(now, 6)), end: today };
    case "30d":
      return { start: startOfDay(subDays(now, 29)), end: today };
    case "90d":
      return { start: startOfDay(subDays(now, 89)), end: today };
    case "custom":
      return { start: startOfDay(subMonths(now, 1)), end: today };
  }
}

function getPrevRange(range: DateRange): DateRange {
  const diff = range.end.getTime() - range.start.getTime();
  return {
    start: new Date(range.start.getTime() - diff),
    end: new Date(range.end.getTime() - diff),
  };
}

interface PeriodContextValue {
  state: PeriodState;
  setPreset: (preset: PeriodState["preset"]) => void;
  setCustomRange: (range: DateRange) => void;
  toggleCompare: () => void;
  prevRange: DateRange;
  fmt: (d: Date) => string;
  toISO: (d: Date) => string;
}

const PeriodContext = createContext<PeriodContextValue | null>(null);

export function PeriodProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PeriodState>({
    preset: "30d",
    range: getPresetRange("30d"),
    compare: true,
  });

  const setPreset = useCallback((preset: PeriodState["preset"]) => {
    setState((s) => ({ ...s, preset, range: getPresetRange(preset) }));
  }, []);

  const setCustomRange = useCallback((range: DateRange) => {
    setState((s) => ({ ...s, preset: "custom", range }));
  }, []);

  const toggleCompare = useCallback(() => {
    setState((s) => ({ ...s, compare: !s.compare }));
  }, []);

  const prevRange = getPrevRange(state.range);

  const fmt = (d: Date) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  const toISO = (d: Date) => d.toISOString();

  return (
    <PeriodContext.Provider value={{ state, setPreset, setCustomRange, toggleCompare, prevRange, fmt, toISO }}>
      {children}
    </PeriodContext.Provider>
  );
}

export function usePeriod() {
  const ctx = useContext(PeriodContext);
  if (!ctx) throw new Error("usePeriod must be used within PeriodProvider");
  return ctx;
}
