import { BarChart3 } from "lucide-react";

export function EmptyState({ title = "Pas encore de données", description }: { title?: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mb-5 ring-1 ring-gray-900/5">
        <BarChart3 className="w-10 h-10 text-gray-300" />
      </div>
      <p className="text-base font-semibold text-gray-900">{title}</p>
      {description && <p className="text-sm text-gray-500 mt-2 max-w-sm">{description}</p>}
    </div>
  );
}
