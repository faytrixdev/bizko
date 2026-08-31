"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import {
  BarChart3,
  Zap,
  TrendingUp,
  FileText,
  Target,
  GitBranch,
  Users,
  Globe,
  Smartphone,
  ArrowLeft,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/realtime", label: "Temps réel", icon: Zap },
  { href: "/admin/acquisition", label: "Acquisition", icon: TrendingUp },
  { href: "/admin/pages", label: "Pages & contenu", icon: FileText },
  { href: "/admin/events", label: "Événements", icon: Target },
  { href: "/admin/funnels", label: "Funnel", icon: GitBranch },
  { href: "/admin/retention", label: "Rétention", icon: Users },
  { href: "/admin/audience", label: "Audience", icon: Globe },
  { href: "/admin/technology", label: "Technologie", icon: Smartphone },
];

export function AdminSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-gray-100 transition-transform duration-300 lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:z-auto lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100">
        <Link href="/admin" onClick={onClose} className="flex items-center gap-2">
          <Logo size="sm" />
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                active
                  ? "bg-accent/5 text-accent border-l-2 border-accent"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 border-l-2 border-transparent"
              )}
            >
              <Icon className={cn("w-5 h-5", active ? "text-accent" : "text-gray-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Back link */}
      <div className="p-4 border-t border-gray-100">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à Bizko
        </Link>
      </div>
    </aside>
  );
}
