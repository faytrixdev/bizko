"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  label: string;
  align?: "left" | "right";
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  defaultSort?: string;
  limit?: number;
}

export function DataTable<T extends Record<string, unknown>>({ columns, data, defaultSort, limit = 20 }: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState(defaultSort || columns[0]?.key);
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...data]
    .sort((a, b) => {
      const av = a[sortKey] ?? 0;
      const bv = b[sortKey] ?? 0;
      if (typeof av === "number" && typeof bv === "number") return sortAsc ? av - bv : bv - av;
      return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    })
    .slice(0, limit);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-900 transition-colors",
                  col.align === "right" ? "text-right" : "text-left"
                )}
                onClick={() => {
                  if (sortKey === col.key) setSortAsc(!sortAsc);
                  else { setSortKey(col.key); setSortAsc(false); }
                }}
              >
                {col.label}
                {sortKey === col.key && <span className="ml-1">{sortAsc ? "↑" : "↓"}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className={cn("px-4 py-3", col.align === "right" ? "text-right" : "text-left")}>
                  {col.render ? col.render(row) : String(row[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400 text-sm">
                Aucune donnée
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
