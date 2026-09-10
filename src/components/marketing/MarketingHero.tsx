import Link from "next/link";

type MarketingHeroProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
};

export function MarketingHero({ eyebrow, title, subtitle, primary, secondary }: MarketingHeroProps) {
  return (
    <section className="border-b border-border/70">
      <div className="mx-auto max-w-6xl px-6 py-16 text-center md:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
        <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-gray-600">{subtitle}</p>
        {(primary || secondary) && (
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {primary && (
              <Link
                href={primary.href}
                className="rounded-full bg-accent px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-accent/20 transition-colors duration-200 hover:bg-accent-hover"
              >
                {primary.label}
              </Link>
            )}
            {secondary && (
              <Link
                href={secondary.href}
                className="rounded-full border border-gray-300 px-8 py-3.5 text-sm font-medium text-gray-700 transition-colors duration-200 hover:border-gray-400 hover:bg-gray-50"
              >
                {secondary.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}