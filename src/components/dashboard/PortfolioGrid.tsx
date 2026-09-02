"use client";

import { useState, useTransition } from "react";
import { reorderPortfolio, deletePortfolio } from "@/app/dashboard/actions";
import { useI18n } from "@/lib/i18n/provider";
import { ConfirmDialog } from "./ConfirmDialog";
import { Lightbox } from "@/components/Lightbox";

interface PortfolioItem {
  id: string;
  media_url: string;
  media_type?: 'image' | 'video';
  thumbnail_url?: string | null;
  title: string | null;
  position: number;
}

interface PortfolioGridProps {
  portfolio: PortfolioItem[];
}

export function PortfolioGrid({ portfolio }: PortfolioGridProps) {
  const { t } = useI18n();
  const [list, setList] = useState(portfolio);
  const [isPending, startTransition] = useTransition();
  const [pendingDelete, setPendingDelete] = useState<{ id: string; media_type?: string } | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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
    <>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {list.map((p, i) => (
          <div key={p.id} className="relative group cursor-pointer" onClick={() => setLightboxIndex(i)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.thumbnail_url || p.media_url} alt="" className="aspect-square object-cover rounded-xl border border-gray-100 hover:ring-2 hover:ring-gray-200 transition-all duration-300" />
            {p.media_type === 'video' && (
              <span className="absolute bottom-1 right-1 w-5 h-5 flex items-center justify-center bg-black/60 text-white text-[10px] rounded-full pointer-events-none">▶</span>
            )}
            <div className="absolute top-1 left-1 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); handleMove(i, "up"); }}
                disabled={i === 0 || isPending}
                className="w-5 h-5 flex items-center justify-center bg-white/90 backdrop-blur text-gray-500 hover:text-gray-900 text-[10px] rounded border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label={t("dashboard.moveUp")}
              >
                ▲
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleMove(i, "down"); }}
                disabled={i === list.length - 1 || isPending}
                className="w-5 h-5 flex items-center justify-center bg-white/90 backdrop-blur text-gray-500 hover:text-gray-900 text-[10px] rounded border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label={t("dashboard.moveDown")}
              >
                ▼
              </button>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setPendingDelete({ id: p.id, media_type: p.media_type }); }}
              aria-label={t("dashboard.deleteImage")}
              className="absolute top-1 right-1 bg-white/90 backdrop-blur text-xs w-6 h-6 rounded-lg border border-gray-200 hover:bg-white flex items-center justify-center"
            >
              x
            </button>
          </div>
        ))}
        <ConfirmDialog
          open={pendingDelete !== null}
          onClose={() => setPendingDelete(null)}
          title={t("dashboard.confirmDeleteTitle")}
          message={pendingDelete?.media_type === "video" ? t("dashboard.confirmDeleteVideoMsg") : t("dashboard.confirmDeleteImageMsg")}
          confirmLabel={t("dashboard.confirm")}
          cancelLabel={t("dashboard.cancel")}
          action={deletePortfolio}
          hiddenFields={pendingDelete ? [{ name: "id", value: pendingDelete.id }] : []}
        />
      </div>
      {lightboxIndex !== null && (
        <Lightbox
          items={list.map((p) => ({ src: p.media_url, type: p.media_type, alt: p.title || "" }))}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
