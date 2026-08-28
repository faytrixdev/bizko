import { cn } from "@/lib/utils";

interface LogoProps {
  /** Taille du logo (hauteur du symbole + taille du texte associée) */
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: { img: "h-6", text: "text-lg" },
  md: { img: "h-8", text: "text-xl" },
  lg: { img: "h-10", text: "text-2xl" },
};

export function Logo({ size = "md", className }: LogoProps) {
  const s = SIZES[size];
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <img src="/logo.png" alt="Bizko" className={cn(s.img, "w-auto")} />
      <span className={cn(s.text, "font-display font-bold tracking-tight text-gray-900")}>
        bizko
      </span>
    </span>
  );
}
