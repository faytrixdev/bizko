import { Star } from "lucide-react";

export type TestimonialCardData = {
  id: string;
  authorName: string;
  authorRole: string | null;
  content: string;
  rating?: number | null;
};

type Props = {
  testimonial: TestimonialCardData;
  starLabel: string;
  date?: string;
};

export function TestimonialCard({ testimonial, starLabel, date }: Props) {
  const { authorName, authorRole, content, rating } = testimonial;
  const stars = rating != null ? Math.max(1, Math.min(5, Math.round(rating))) : 0;

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-900 to-gray-700 text-sm font-bold text-white"
        >
          {authorName.trim().charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900">{authorName}</p>
          {authorRole && <p className="truncate text-xs text-gray-500">{authorRole}</p>}
        </div>
        {stars > 0 && (
          <div role="img" aria-label={starLabel} className="flex shrink-0 items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={
                  i < stars
                    ? "h-4 w-4 fill-amber-500 text-amber-500"
                    : "h-4 w-4 text-gray-300"
                }
              />
            ))}
          </div>
        )}
      </div>
      <p className="mt-3 text-sm leading-6 text-gray-600">{content}</p>
      {date && <p className="mt-3 text-[11px] text-gray-400">{date}</p>}
    </div>
  );
}