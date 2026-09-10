import Image from "next/image";
import { cn } from "@/lib/utils";

const GRADIENTS = [
  "from-[#111827] via-[#1f2937] to-[#7c2d12]",
  "from-[#1c1917] via-[#292524] to-[#9a3412]",
  "from-[#18181b] via-[#3f3f46] to-[#c2410c]",
  "from-[#0f172a] via-[#1e293b] to-[#b45309]",
];

function pick<T extends unknown[]>(seed: string, arr: T): T[number] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return arr[Math.abs(hash) % arr.length];
}

type BlogBannerProps = {
  seed: string;
  label: string;
  cover?: string;
  className?: string;
};

export function BlogBanner({ seed, label, cover, className }: BlogBannerProps) {
  if (cover) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image src={cover} alt={label} fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
      </div>
    );
  }

  const gradient = pick(seed, GRADIENTS);

  return (
    <div
      aria-hidden
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
        gradient,
        className
      )}
    >
      <div className="absolute -right-16 -top-16 size-56 rounded-full bg-accent/25 blur-3xl" />
      <div className="absolute -bottom-24 -left-10 size-64 rounded-full bg-orange-400/10 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_45%)]" />
      <span className="relative px-6 text-center text-4xl font-semibold uppercase tracking-tight text-white/90 md:text-5xl">
        {label}
      </span>
    </div>
  );
}