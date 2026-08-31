import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";

export function ComparisonBadge({ current, previous, className }: { current: number; previous: number; className?: string }) {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent", className)}>
        <Sparkles className="w-3 h-3" />
        Nouveau
      </span>
    );
  }
  const pct = ((current - previous) / previous) * 100;
  const positive = pct >= 0;
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
      positive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600",
      className
    )}>
      {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {positive ? "+" : ""}{pct.toFixed(1)}%
    </span>
  );
}
