import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type PricingCardProps = {
  name: string;
  price: string;
  note?: string;
  features: string[];
  popular?: boolean;
  ctaHref: string;
  ctaLabel?: string;
};

export function PricingCard({
  name,
  price,
  note,
  features,
  popular = false,
  ctaHref,
  ctaLabel = "Choisir ce plan",
}: PricingCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-3xl border bg-white p-8",
        popular
          ? "border-accent shadow-[0_32px_64px_-32px_rgba(255,107,53,0.5)]"
          : "border-border"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-semibold tracking-tight text-gray-900">{name}</h3>
        {popular && (
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
            Populaire
          </span>
        )}
      </div>
      <div className="mt-5">
        <span className="text-4xl font-semibold tracking-tight text-gray-900">{price}</span>
        {note && <p className="mt-1 text-sm text-gray-500">{note}</p>}
      </div>
      <ul className="mt-6 flex flex-1 flex-col gap-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
            <Check className="mt-0.5 size-4 shrink-0 text-accent" /> {f}
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className={cn(
          "mt-8 rounded-full py-3 text-center text-sm font-semibold transition-colors duration-200",
          popular
            ? "bg-accent text-white hover:bg-accent-hover"
            : "border border-gray-300 text-gray-900 hover:border-gray-400 hover:bg-gray-50"
        )}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}