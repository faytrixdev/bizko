import { ComparisonBadge } from "./ComparisonBadge";
import { cn } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: number;
  previous: number;
  format?: "number" | "duration" | "percent";
  className?: string;
}

function formatValue(v: number, format: string): string {
  if (format === "duration") {
    const s = Math.round(v / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  }
  if (format === "percent") return `${v.toFixed(1)}%`;
  return v.toLocaleString("fr-FR");
}

export function KPICard({ label, value, previous, format = "number", className }: KPICardProps) {
  return (
    <div className={cn("bg-white border border-gray-200 rounded-xl p-4", className)}>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900">{formatValue(value, format)}</span>
        <ComparisonBadge current={value} previous={previous} />
      </div>
    </div>
  );
}
