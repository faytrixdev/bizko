"use client";

import Image from "next/image";
import { useState } from "react";
import { Lightbox } from "@/components/Lightbox";
import type { PortfolioItem } from "@/types/database";

/**
 * Click-to-enlarge portfolio grid shared by the six public templates.
 *
 * Templates are server components, so the state that opens a lightbox has to
 * live in a client boundary. Rather than copy six interactive grids, this
 * component keeps each template's own layout as a `variant` and only owns the
 * open/close state, so the visual design of every template is unchanged.
 */
export type PortfolioGridVariant =
  | "minimal"
  | "studio"
  | "portfolio"
  | "urban"
  | "obsidienne"
  | "edito";

interface VariantSpec {
  /** Classes on the grid container, including the `data-testid` wrapper. */
  container: string;
  /** `sizes` attribute for next/image. */
  sizes: string;
  /** Classes on each tile wrapper (positioning context for the `fill` image). */
  tile: string;
  /** Per-index extra classes, e.g. the mosaic spans. */
  span?: (index: number) => string;
  /** Extra classes on the image itself (e.g. Studio's grayscale hover). */
  image?: string;
  /** Edito renders a `figure` + italic serif `figcaption`. */
  captioned?: boolean;
}

const VARIANTS: Record<PortfolioGridVariant, VariantSpec> = {
  minimal: {
    container: "mt-4 grid grid-cols-3 gap-2",
    sizes: "(max-width: 768px) 33vw, 200px",
    tile: "relative aspect-square overflow-hidden rounded-2xl",
  },
  studio: {
    container: "mt-4 grid grid-cols-2 gap-2",
    sizes: "(max-width: 768px) 50vw, 300px",
    tile: "relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100 grayscale transition-all duration-300 hover:grayscale-0",
  },
  portfolio: {
    container: "mt-3 grid grid-cols-3 gap-2.5",
    sizes: "(max-width: 768px) 100vw, 420px",
    tile: "relative overflow-hidden rounded-2xl border border-stone-200 bg-white",
    span: (i) => (i % 4 === 0 ? "col-span-3 aspect-[16/10]" : "aspect-square"),
  },
  urban: {
    container: "mt-4 grid grid-cols-2 gap-2.5",
    sizes: "(max-width: 768px) 50vw, 300px",
    tile: "relative overflow-hidden rounded-3xl",
    span: (i) => (i % 3 === 0 ? "col-span-2 aspect-[16/10]" : "aspect-square"),
  },
  obsidienne: {
    container: "mt-4 grid grid-cols-6 gap-2",
    sizes: "(max-width: 768px) 50vw, 320px",
    tile: "relative aspect-square overflow-hidden rounded-xl border border-white/10",
    span: (i) => (i % 4 === 0 ? "col-span-4" : i % 4 === 1 ? "col-span-2" : "col-span-3"),
  },
  edito: {
    container: "mt-5 grid grid-cols-2 gap-4",
    sizes: "(max-width: 768px) 50vw, 300px",
    // Edito's caption lives outside the crop box, so the button carries the
    // text and the inner div only holds the image.
    tile: "group block w-full text-center",
    captioned: true,
  },
};

interface PortfolioGridProps {
  items: PortfolioItem[];
  variant: PortfolioGridVariant;
  /** Edito's serif style, applied to the figcaption. */
  captionStyle?: React.CSSProperties;
}

export function PortfolioGrid({ items, variant, captionStyle }: PortfolioGridProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const spec = VARIANTS[variant];

  if (items.length === 0) return null;

  return (
    <>
      <div data-testid="portfolio" className={spec.container}>
        {items.map((p, i) => {
          const frame = (
            <div className={spec.captioned ? "relative aspect-[3/4] overflow-hidden bg-[#EFE9DD]" : spec.tile}>
              <Image
                src={p.thumbnail_url || p.media_url}
                alt={p.title || ""}
                fill
                sizes={spec.sizes}
                className={spec.image ?? "object-cover"}
              />
            </div>
          );

          const spanClass = spec.span ? spec.span(i) : "";

          if (spec.captioned) {
            return (
              <figure key={p.id} className="text-center">
                <button
                  type="button"
                  onClick={() => setOpenIndex(i)}
                  aria-label={p.title || "Agrandir l'image"}
                  className={`${spec.tile} cursor-zoom-in`}
                >
                  {frame}
                  {p.title && (
                    <figcaption
                      style={captionStyle}
                      className="mt-2 text-sm italic text-[#1C1917]/70"
                    >
                      {p.title}
                    </figcaption>
                  )}
                </button>
              </figure>
            );
          }

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setOpenIndex(i)}
              aria-label={p.title || "Agrandir l'image"}
              className={`${spec.tile} ${spanClass} cursor-zoom-in`}
            >
              {frame}
            </button>
          );
        })}
      </div>

      {openIndex !== null && (
        <Lightbox
          items={items.map((p) => ({
            src: p.media_url,
            type: p.media_type,
            alt: p.title || "",
          }))}
          startIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
}
