"use client";

import { usePeriod } from "@/app/admin/PeriodContext";

/**
 * Hook for admin pages to get period dates as ISO strings for RPC calls.
 */
export function useAdminPeriod() {
  const { state, prevRange, fmt, toISO } = usePeriod();
  return {
    start: toISO(state.range.start),
    end: toISO(state.range.end),
    prevStart: toISO(prevRange.start),
    prevEnd: toISO(prevRange.end),
    compare: state.compare,
    preset: state.preset,
    label: fmt(state.range.start) + " — " + fmt(state.range.end),
  };
}
