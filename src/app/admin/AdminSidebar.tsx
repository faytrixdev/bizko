"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: "📊" },
  { href: "/admin/realtime", label: "Temps réel", icon: "⚡" },
  { href: "/admin/acquisition", label: "Acquisition", icon: "📈" },
  { href: "/admin/pages", label: "Pages & contenu", icon: "📄" },
  { href: "/admin/events", label: "Événements", icon: "🎯" },
  { href: "/admin/funnels", label: "Funnel", icon: "🔄" },
  { href: "/admin/retention", label: "Rétention", icon: "👥" },
  { href: "/admin/audience", label: "Audience", icon: "🌍" },
  { href: "/admin/technology", label: "Technologie", icon: "💻" },
];

export function AdminSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-gray-200 bg-gray-50/95 backdrop-blur-sm transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 lg:bg-gray-50/50",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <Link href="/admin" onClick={onClose}>
            <Logo size="sm" />
          </Link>
          <span className="ml-2 text-xs font-medium text-gray-400 uppercase tracking-wider">Analytics</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le menu"
            className="lg:hidden p-1 -mr-1 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200/60"
                  : "text-gray-500 hover:text-gray-900 hover:bg-white/60"
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
          Retour à Bizko
        </Link>
      </div>
    </aside>
  );
}
