import { cn } from "@/lib/utils";

export function ComparisonBadge({ current, previous, className }: { current: number; previous: number; className?: string }) {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) {
    return <span className={cn("text-xs font-medium text-green-600", className)}>Nouveau</span>;
  }
  const pct = ((current - previous) / previous) * 100;
  const positive = pct >= 0;
  return (
    <span className={cn("text-xs font-medium", positive ? "text-green-600" : "text-red-500", className)}>
      {positive ? "+" : ""}{pct.toFixed(1)}%
    </span>
  );
}
