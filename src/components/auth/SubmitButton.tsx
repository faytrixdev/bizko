"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 w-full rounded-lg bg-accent text-white inline-flex items-center justify-center gap-2 text-sm font-semibold transition hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending && <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
      {children}
    </button>
  );
}
