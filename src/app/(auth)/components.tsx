"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";

export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[360px]">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 mx-auto">
          <span className="font-bold font-display text-gray-900 text-lg">
            Bizko<span className="text-[#FF6B35]">.</span>
          </span>
        </Link>
        <div className="text-center mb-6">
          <h1 className="text-[26px] font-bold tracking-tight font-display text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-gray-500">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center justify-between text-[13px] font-medium text-gray-900">
        {label}
        {hint && <span className="font-normal text-gray-500">{hint}</span>}
      </span>
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  const { error, className = "", ...rest } = props;
  return (
    <input
      {...rest}
      className={`h-11 w-full rounded-lg border bg-white px-4 text-[14px] placeholder:text-gray-400 outline-none transition
        ${error ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-500/10" : "border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"}
        ${className}`}
    />
  );
}

export function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={show ? "text" : "password"} className="pr-10" />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Masquer" : "Afficher"}
        className="absolute right-1 top-1 h-9 w-9 inline-flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition"
      >
        <span className="text-[11px] font-medium tracking-widest uppercase">{show ? "Masquer" : "Voir"}</span>
      </button>
    </div>
  );
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 w-full rounded-lg bg-[#FF6B35] text-white inline-flex items-center justify-center gap-2 text-sm font-semibold transition hover:bg-[#EA580C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending && <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
      {children}
    </button>
  );
}

export function Alert({ type = "error", children }: { type?: "error" | "success"; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div
      role="alert"
      className={`flex gap-2.5 rounded-lg border px-3.5 py-3 text-sm leading-5 ${
        type === "error" ? "bg-red-50 border-red-200/60 text-red-700" : "bg-emerald-50 border-emerald-200/60 text-emerald-800"
      }`}
    >
      <span className="mt-0.5 text-xs">{type === "error" ? "!" : "+"}</span>
      <span className="flex-1">{children}</span>
    </div>
  );
}
