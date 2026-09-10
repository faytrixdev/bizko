import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function BlogMasthead() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-gray-900 transition-colors hover:text-accent"
        >
          Bizko
        </Link>
        <nav aria-label="Navigation du blog" className="flex items-center gap-3">
          <Link
            href="/blog"
            className="rounded-full bg-orange-50 px-3.5 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-orange-100"
          >
            Blog
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Créer ma page
            <ArrowUpRight className="size-4" />
          </Link>
        </nav>
      </div>
    </header>
  );
}