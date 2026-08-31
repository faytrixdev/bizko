"use client";

import Link from "next/link";
import { usePeriod } from "./PeriodContext";
import type { PeriodPreset } from "@/types/analytics";

const PRESETS: { value: PeriodPreset; label: string }[] = [
  { value: "today", label: "Aujourd'hui" },
  { value: "yesterday", label: "Hier" },
  { value: "7d", label: "7 derniers jours" },
  { value: "30d", label: "30 derniers jours" },
  { value: "90d", label: "90 derniers jours" },
];

export function AdminHeader() {
  const { state, setPreset, toggleCompare } = usePeriod();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-gray-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-3">
          <Link href="/" className="lg:hidden">
            <span className="font-display font-bold text-lg text-gray-900">bizko</span>
          </Link>
          <span className="text-sm font-semibold text-gray-900 hidden lg:inline">Bizko Analytics</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            {PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPreset(p.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  state.preset === p.value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Compare toggle */}
          <button
            onClick={toggleCompare}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              state.compare
                ? "bg-accent text-white border-accent"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
            }`}
          >
            Comparer
          </button>
        </div>
      </div>
    </header>
  );
}
