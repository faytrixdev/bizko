import type { ReactNode } from "react";

export function CompareTable({
  head,
  highlightColumn,
  rows,
}: {
  head: string[];
  highlightColumn: number;
  rows: { label: string; values: ReactNode[] }[];
}) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-border bg-white">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted/60">
          <tr>
            {head.map((h) => (
              <th
                key={h}
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.label} className="transition-colors duration-200 hover:bg-muted/40">
              <td className="whitespace-nowrap px-6 py-5 font-medium text-gray-900">{row.label}</td>
              {row.values.map((value, i) => (
                <td key={i} className={i === highlightColumn ? "bg-accent/5 px-6 py-5" : "px-6 py-5"}>
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}