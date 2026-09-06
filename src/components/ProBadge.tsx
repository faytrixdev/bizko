import { Crown } from "lucide-react";

export function ProBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm ring-1 ring-inset ring-violet-900/20">
      <Crown className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  );
}