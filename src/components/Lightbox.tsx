"use client";

import { useEffect, useCallback, useState } from "react";
import Image from "next/image";

interface LightboxMedia {
  src: string;
  type?: "image" | "video";
  alt: string;
}

interface LightboxProps {
  items: LightboxMedia[];
  startIndex?: number;
  onClose: () => void;
}

export function Lightbox({ items, startIndex = 0, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(startIndex);

  const goNext = useCallback(() => {
    setCurrent((i) => (i + 1) % items.length);
  }, [items.length]);

  const goPrev = useCallback(() => {
    setCurrent((i) => (i - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, goNext, goPrev]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Fermer"
        className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Prev */}
      {items.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          aria-label="Image précédente"
          className="absolute left-2 sm:left-4 z-10 h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      )}

      {/* Next */}
      {items.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          aria-label="Image suivante"
          className="absolute right-2 sm:right-4 z-10 h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      )}

      {/* Media */}
      <div className="relative max-w-[90vw] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
        {items[current].type === "video" ? (
          <video
            key={items[current].src}
            src={items[current].src}
            controls
            autoPlay
            playsInline
            className="max-h-[85vh] w-auto max-w-[90vw] rounded-lg"
          />
        ) : (
          <img
            src={items[current].src}
            alt={items[current].alt}
            className="max-h-[85vh] w-auto object-contain rounded-lg"
          />
        )}
        {items[current].alt && (
          <p className="text-center text-white/70 text-sm mt-3">{items[current].alt}</p>
        )}
      </div>

      {/* Counter */}
      {items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm font-medium">
          {current + 1} / {items.length}
        </div>
      )}
    </div>
  );
}

interface PortfolioGalleryProps {
  items: { id: string; media_url: string; media_type?: "image" | "video"; thumbnail_url?: string | null; title?: string | null }[];
}

export function PortfolioGallery({ items }: PortfolioGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {items.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setLightboxIndex(i)}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
          >
            <Image
              src={p.thumbnail_url || p.media_url}
              alt={p.title || ""}
              fill
              sizes="(max-width: 768px) 50vw, 320px"
              className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {p.media_type === "video" && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-12 w-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-5 h-5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
            {p.title && (
              <div className="absolute inset-x-0 bottom-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <p className="text-xs font-medium text-white truncate">{p.title}</p>
              </div>
            )}
            {/* Zoom icon */}
            <div className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          items={items.map((p) => ({ src: p.media_url, type: p.media_type, alt: p.title || "" }))}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
