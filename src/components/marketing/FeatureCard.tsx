import type { ReactNode } from "react";

export function FeatureCard({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-border bg-white p-7 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_32px_64px_-32px_rgba(17,24,39,0.35)]">
      <div className="flex size-12 items-center justify-center rounded-full bg-accent/10 text-accent">{icon}</div>
      <h3 className="text-lg font-semibold tracking-tight text-gray-900">{title}</h3>
      <p className="leading-relaxed text-gray-600">{description}</p>
    </div>
  );
}