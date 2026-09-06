import Image from "next/image";
import type { Profile } from "@/types/database";

export function initials(name: string): string {
  return name.trim().slice(0, 2).toUpperCase();
}

export function Avatar({ profile, className }: { profile: Profile; className?: string }) {
  if (profile.avatar_url) {
    return (
      <Image
        src={profile.avatar_url}
        alt={profile.display_name}
        width={96}
        height={96}
        className={`h-24 w-24 rounded-full object-cover ${className ?? ""}`}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className={`h-24 w-24 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white font-bold text-2xl ${className ?? ""}`}
    >
      {initials(profile.display_name)}
    </div>
  );
}

const dateFormatter = (locale: string) =>
  new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });

export function formatTestimonialDate(locale: string, createdAt: string): string {
  return dateFormatter(locale).format(new Date(createdAt));
}