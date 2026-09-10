import Link from "next/link";

type CtaSectionProps = {
  title: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
};

export function CtaSection({ title, primary, secondary }: CtaSectionProps) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center md:py-16">
        <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h2>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={primary.href}
            className="rounded-full bg-accent px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/20 transition-colors duration-200 hover:bg-accent-hover"
          >
            {primary.label}
          </Link>
          {secondary && (
            <Link
              href={secondary.href}
              className="rounded-full border border-white/30 px-8 py-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-white/10"
            >
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}