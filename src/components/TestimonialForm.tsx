"use client";

import { useState, useTransition } from "react";
import { submitTestimonial } from "@/app/[username]/actions";
import { useI18n } from "@/lib/i18n/provider";
import { CustomSelect } from "@/components/CustomSelect";
import { MAX_TESTIMONIAL_CONTENT, MAX_TESTIMONIAL_NAME, MAX_TESTIMONIAL_ROLE } from "@/lib/testimonials";

type Props = {
  profileId: string;
};

export function TestimonialForm({ profileId }: Props) {
  const { t } = useI18n();
  const [pending, startSubmit] = useTransition();
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg(null);
    const form = e.currentTarget;
    startSubmit(async () => {
      const res = await submitTestimonial(new FormData(form));
      if (res.error) {
        setMsg({ type: "error", text: res.error });
      } else if (res.success) {
        setMsg({ type: "success", text: res.success });
        form.reset();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <h3 className="font-display text-sm font-semibold text-gray-900">{t("profile.testimonials.formTitle")}</h3>
      <input type="hidden" name="profileId" value={profileId} />
      <input
        type="text"
        name="company"
        autoComplete="off"
        tabIndex={-1}
        aria-hidden="true"
        className="hidden"
      />
      <div className="mt-3 flex flex-col gap-2.5">
        <input
          name="authorName"
          required
          maxLength={MAX_TESTIMONIAL_NAME}
          placeholder={t("profile.testimonials.namePlaceholder")}
          className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none transition-all duration-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
        />
        <input
          name="authorRole"
          maxLength={MAX_TESTIMONIAL_ROLE}
          placeholder={t("profile.testimonials.rolePlaceholder")}
          className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none transition-all duration-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
        />
        <textarea
          name="content"
          required
          maxLength={MAX_TESTIMONIAL_CONTENT}
          rows={3}
          placeholder={t("profile.testimonials.contentPlaceholder")}
          className="resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition-all duration-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
        />
        <CustomSelect
          name="rating"
          placeholder={t("profile.testimonials.ratingLabel")}
          options={[
            { value: "", label: t("profile.testimonials.noRating") },
            { value: "5", label: "★★★★★" },
            { value: "4", label: "★★★★" },
            { value: "3", label: "★★★" },
            { value: "2", label: "★★" },
            { value: "1", label: "★" },
          ]}
          className="h-10"
        />
        <button
          type="submit"
          disabled={pending}
          className="h-10 rounded-lg bg-accent text-white text-sm font-medium transition-all duration-200 hover:bg-accent-hover hover:shadow-sm disabled:opacity-60"
        >
          {pending ? "..." : t("profile.testimonials.submit")}
        </button>
      </div>
      {msg && (
        <p
          className={`mt-3 rounded-lg border p-3 text-xs ${
            msg.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {msg.text}
        </p>
      )}
    </form>
  );
}