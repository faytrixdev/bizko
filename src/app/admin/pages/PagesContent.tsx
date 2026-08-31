"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAdminPeriod } from "@/components/admin/PeriodSetter";
import { EmptyState } from "@/components/admin/EmptyState";
import { DataTable } from "@/components/admin/DataTable";
import type { TopPage } from "@/types/analytics";

export function PagesContent() {
  const { start, end } = useAdminPeriod();
  const [pages, setPages] = useState<TopPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase.rpc("get_admin_top_pages", { p_start: start, p_end: end, p_limit: 50 }).then(({ data }) => {
      if (!cancelled) {
        setPages((data as TopPage[]) ?? []);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [start, end]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>;
  if (pages.length === 0) return <EmptyState description="Les pages consultées apparaîtront ici." />;

  const columns = [
    { key: "page_path", label: "Page", render: (row: Record<string, unknown>) => <span className="font-mono text-xs">{String(row.page_path)}</span> },
    { key: "views", label: "Vues", align: "right" as const },
    { key: "unique_visitors", label: "Visiteurs uniques", align: "right" as const },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">Pages & contenu</h1>
        <p className="text-sm text-gray-500 mt-1">Les pages les plus consultées</p>
      </div>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Toutes les pages</h2>
        </div>
        <DataTable columns={columns} data={pages as unknown as Record<string, unknown>[]} defaultSort="views" />
      </section>
    </div>
  );
}
