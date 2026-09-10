import Link from "next/link";

export function MarketingMasthead() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-semibold tracking-tight text-gray-900">
          Bizko
        </Link>
        <Link
          href="/signup"
          className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-hover"
        >
          Créer ma page
        </Link>
      </div>
    </header>
  );
}