"use client";

import { useState, useTransition } from "react";
import { addTestimonial, approveTestimonial, deleteTestimonial } from "@/app/dashboard/actions";
import { useI18n } from "@/lib/i18n/provider";
import { CustomSelect } from "@/components/CustomSelect";
import { ConfirmDialog } from "./ConfirmDialog";
import { getLimits } from "@/lib/plans";
import { MAX_TESTIMONIAL_NAME, MAX_TESTIMONIAL_ROLE, MAX_TESTIMONIAL_CONTENT } from "@/lib/testimonials";

interface Testimonial {
  id: string;
  author_name: string;
  author_role: string | null;
  content: string;
  rating: number | null;
  is_published: boolean;
  created_at: string;
}

interface TabTestimonialsProps {
  testimonials: Testimonial[];
  isPro: boolean;
}

export function TabTestimonials({ testimonials, isPro }: TabTestimonialsProps) {
  const { t, locale } = useI18n();
  const [pendingSubmit, startSubmit] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const published = testimonials.filter((x) => x.is_published).length;
  const cap = getLimits(isPro ? "pro" : "free").publishedTestimonials;
  const reached = isPro ? false : published >= cap;

  const dateFormat = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg(null);
    const form = e.currentTarget;
    startSubmit(async () => {
      const res = await addTestimonial(new FormData(form));
      if (res.error) {
        setMsg({ type: "error", text: res.error });
      } else if (res.success) {
        setMsg({ type: "success", text: res.success });
        form.reset();
      }
    });
  };

  const handleApprove = (id: string) => {
    setMsg(null);
    setPendingId(id);
    startSubmit(async () => {
      const res = await approveTestimonial(id);
      setPendingId(null);
      if (res.error) setMsg({ type: "error", text: res.error });
    });
  };

  const handleDelete = (id: string) => {
    setMsg(null);
    setPendingDelete(id);
  };

  return (
    <div className="border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <h2 className="font-semibold font-display text-sm text-gray-900 uppercase tracking-wider text-xs">{t("dashboard.testimonialsTitle")} ({published}/{isPro ? "∞" : cap})</h2>
      {msg && (
        <p className={`mt-3 text-xs p-3 rounded-lg border ${msg.type === "error" ? "text-red-700 bg-red-50 border-red-200" : "text-green-700 bg-green-50 border-green-200"}`}>
          {msg.text}
        </p>
      )}
      {reached ? (
        <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {t("dashboard.testimonialsFull")}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
          <input name="authorName" required placeholder={t("dashboard.testimonialNamePlaceholder")} maxLength={MAX_TESTIMONIAL_NAME} className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200" />
          <input name="authorRole" placeholder={t("dashboard.testimonialRolePlaceholder")} maxLength={MAX_TESTIMONIAL_ROLE} className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200" />
          <textarea name="content" required placeholder={t("dashboard.testimonialContentPlaceholder")} maxLength={MAX_TESTIMONIAL_CONTENT} rows={3} className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200 resize-none" />
          <CustomSelect
            name="rating"
            placeholder={t("dashboard.testimonialRatingPlaceholder")}
            options={[
              { value: "", label: t("dashboard.testimonialNoRating") },
              { value: "5", label: "★★★★★" },
              { value: "4", label: "★★★★" },
              { value: "3", label: "★★★" },
              { value: "2", label: "★★" },
              { value: "1", label: "★" },
            ]}
            className="h-10"
          />
          <button type="submit" disabled={pendingSubmit} className="h-10 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-all duration-200 hover:shadow-sm disabled:opacity-60">
            {pendingSubmit ? "..." : t("dashboard.add")}
          </button>
        </form>
      )}
      {testimonials.length > 0 ? (
        <div className="mt-4 flex flex-col gap-2">
          {testimonials.map((x) => (
            <div key={x.id} className="border border-gray-100 bg-gray-50/50 rounded-xl px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-sm font-medium truncate text-gray-900">
                    {x.author_name}
                    {x.author_role && <span className="text-gray-500 font-normal"> · {x.author_role}</span>}
                  </p>
                  {x.rating != null && (
                    <span className="text-xs text-amber-500 shrink-0">{"★".repeat(x.rating)}</span>
                  )}
                </div>
                {!x.is_published && (
                  <span className="shrink-0 text-[10px] uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                    {t("dashboard.testimonialPending")}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">{x.content}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] text-gray-400">{dateFormat.format(new Date(x.created_at))}</span>
                <div className="flex items-center gap-3">
                  {!x.is_published && (
                    <button
                      type="button"
                      disabled={pendingSubmit}
                      onClick={() => handleApprove(x.id)}
                      className="text-xs text-gray-700 hover:underline disabled:opacity-50"
                    >
                      {pendingId === x.id ? "..." : t("dashboard.testimonialApprove")}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(x.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    {t("dashboard.delete")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500 mt-3 text-center py-8">
          {t("dashboard.noTestimonials")}
        </p>
      )}
      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title={t("dashboard.confirmDeleteTitle")}
        message={t("dashboard.confirmDeleteTestimonialMsg")}
        confirmLabel={t("dashboard.confirm")}
        cancelLabel={t("dashboard.cancel")}
        action={async () => {
          if (!pendingDelete) return;
          const res = await deleteTestimonial(pendingDelete);
          if ("error" in res && res.error) setMsg({ type: "error", text: res.error });
        }}
        hiddenFields={[]}
      />
    </div>
  );
}
