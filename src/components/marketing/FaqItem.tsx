export function FaqItem({ index, q, a }: { index: number; q: string; a: string }) {
  return (
    <div className="rounded-2xl border border-border p-6">
      <h3 className="flex gap-3 text-lg font-semibold tracking-tight text-gray-900">
        <span className="font-mono text-sm font-medium text-accent">{String(index + 1).padStart(2, "0")}</span>
        {q}
      </h3>
      <p className="mt-2 pl-8 leading-relaxed text-gray-600">{a}</p>
    </div>
  );
}