import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function BlogMasthead() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-baseline gap-1.5 font-semibold tracking-tight">
          <span className="text-lg">Bizko</span>
          <span className="text-xs font-medium text-accent">Blog</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          Créer ma page
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </header>
  );
}