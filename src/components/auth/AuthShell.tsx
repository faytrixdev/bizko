"use client";

import Link from "next/link";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { Logo } from "@/components/Logo";

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
    <div className="min-h-screen bg-white flex flex-col items-center px-4 pt-12 pb-12">
      <div className="w-full max-w-[360px]">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="inline-flex">
            <Logo size="md" />
          </Link>
          <LocaleSwitch />
        </div>
        <div className="text-center mb-6">
          <h1 className="text-[26px] font-bold tracking-tight font-display text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-gray-500">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
