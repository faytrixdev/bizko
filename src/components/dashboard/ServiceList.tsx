"use client";

import { useState, useTransition } from "react";
import { reorderServices, deleteService } from "@/app/dashboard/actions";
import { useI18n } from "@/lib/i18n/provider";

interface Service {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  currency: string;
  position: number;
}

interface ServiceListProps {
  services: Service[];
}

export function ServiceList({ services }: ServiceListProps) {
  const { t } = useI18n();
  const [list, setList] = useState(services);
  const [isPending, startTransition] = useTransition();

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const newList = [...list];
    [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
    setList(newList);

    startTransition(() => {
      reorderServices(newList.map((s) => s.id));
    });
  };

  return (
    <div className="mt-4 flex flex-col gap-2">
      {list.map((s, i) => (
        <div key={s.id} className="flex items-center justify-between border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex flex-col gap-0.5 shrink-0">
              <button
                onClick={() => handleMove(i, "up")}
                disabled={i === 0 || isPending}
                className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Move up"
              >
                ▲
              </button>
              <button
                onClick={() => handleMove(i, "down")}
                disabled={i === list.length - 1 || isPending}
                className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Move down"
              >
                ▼
              </button>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate text-gray-900">{s.title}</p>
              {s.price != null && (
                <p className="text-xs text-gray-500">
                  {s.price.toLocaleString()} {s.currency}
                </p>
              )}
            </div>
          </div>
          <form action={deleteService}>
            <input type="hidden" name="id" value={s.id} />
            <button className="text-xs text-red-600 hover:underline shrink-0 ml-3">
              {t("dashboard.delete")}
            </button>
          </form>
        </div>
      ))}
    </div>
  );
}
