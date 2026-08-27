"use client";

import Link from "next/link";
import { LocaleSwitch } from "@/components/LocaleSwitch";

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
      <div className="fixed top-4 right-4 z-50">
        <LocaleSwitch />
      </div>
      <div className="w-full max-w-[360px]">
        <Link href="/" className="inline-flex items-center mb-8 mx-auto">
          <img src="/logo.png" alt="Bizko" className="h-8" />
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
