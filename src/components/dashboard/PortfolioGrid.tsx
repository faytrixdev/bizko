"use client";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { reorderPortfolio, deletePortfolio } from "@/app/dashboard/actions";
import { useI18n } from "@/lib/i18n/provider";

interface PortfolioItem {
  id: string;
  image_url: string;
  title: string | null;
  position: number;
}

interface PortfolioGridProps {
  portfolio: PortfolioItem[];
}

function DeleteIconButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button aria-label={label} disabled={pending} className="bg-white/90 backdrop-blur text-xs w-6 h-6 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50">
      x
    </button>
  );
}

export function PortfolioGrid({ portfolio }: PortfolioGridProps) {
  const { t } = useI18n();
  const [list, setList] = useState(portfolio);
  const [isPending, startTransition] = useTransition();

  // Re-sync when the server-refreshed props change (add/delete) using the
  // "adjust state during render" pattern.
  const [prevPortfolio, setPrevPortfolio] = useState(portfolio);
  if (prevPortfolio !== portfolio) {
    setPrevPortfolio(portfolio);
    setList(portfolio);
  }

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const newList = [...list];
    [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
    setList(newList);

    startTransition(() => {
      reorderPortfolio(newList.map((p) => p.id));
    });
  };

  return (
    <div className="mt-4 grid grid-cols-3 gap-2">
      {list.map((p, i) => (
        <div key={p.id} className="relative group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.image_url} alt="" className="aspect-square object-cover rounded-xl border border-gray-100 hover:ring-2 hover:ring-gray-200 transition-all duration-300" />
          <div className="absolute top-1 left-1 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleMove(i, "up")}
              disabled={i === 0 || isPending}
              className="w-5 h-5 flex items-center justify-center bg-white/90 backdrop-blur text-gray-500 hover:text-gray-900 text-[10px] rounded border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label={t("dashboard.moveUp")}
            >
              ▲
            </button>
            <button
              onClick={() => handleMove(i, "down")}
              disabled={i === list.length - 1 || isPending}
              className="w-5 h-5 flex items-center justify-center bg-white/90 backdrop-blur text-gray-500 hover:text-gray-900 text-[10px] rounded border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label={t("dashboard.moveDown")}
            >
              ▼
            </button>
          </div>
          <form action={deletePortfolio} onSubmit={(e) => {
            if (!confirm("Supprimer cette image ?")) e.preventDefault();
          }} className="absolute top-1 right-1">
            <input type="hidden" name="id" value={p.id} />
            <DeleteIconButton label={t("dashboard.deleteImage")} />
          </form>
        </div>
      ))}
    </div>
  );
}
