"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-accent hover:text-accent"
    >
      {copied ? <Check className="size-4 text-accent" /> : <Link2 className="size-4" />}
      {copied ? "Copié !" : "Copier le lien"}
    </button>
  );
}