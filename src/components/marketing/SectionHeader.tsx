import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
};

export function SectionHeader({ eyebrow, title, description, align = "center" }: SectionHeaderProps) {
  return (
    <div className={cn("max-w-3xl", align === "center" ? "mx-auto text-center" : "text-left")}>
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>}
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-lg leading-relaxed text-gray-600">{description}</p>}
    </div>
  );
}