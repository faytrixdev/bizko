export function Alert({ type = "error", children }: { type?: "error" | "success"; children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <div
      role="alert"
      className={`flex gap-2.5 rounded-lg border px-3.5 py-3 text-sm leading-5 ${
        type === "error" ? "bg-red-50 border-red-200/60 text-red-700" : "bg-emerald-50 border-emerald-200/60 text-emerald-800"
      }`}
    >
      <span className="mt-0.5 text-xs">{type === "error" ? "!" : "+"}</span>
      <span className="flex-1">{children}</span>
    </div>
  );
}
