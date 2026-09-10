export function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-3xl border border-border bg-white p-7 text-center">
      <div className="text-4xl font-semibold tracking-tight text-accent">{value}</div>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{label}</p>
    </div>
  );
}