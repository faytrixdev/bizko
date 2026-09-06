import Link from "next/link";
import { getTemplate } from "@/lib/templates";
import type { Template } from "@/types/database";
import { DEMO_FIXTURES } from "./fixtures";

interface DemoProfileViewProps {
  template: Template;
}

export function DemoProfileView({ template }: DemoProfileViewProps) {
  const tpl = getTemplate(template);
  const fixture = DEMO_FIXTURES[template];

  const footerClass =
    tpl.bgClass === "bg-[#0B0B0F]" ? "text-white/30" : "text-gray-400";

  return (
    <div className={`min-h-screen ${tpl.bgClass}`}>
      <div className="max-w-[640px] mx-auto px-4 py-8 pb-16 sm:pb-8">
        <tpl.Component {...fixture} />

        <p className={`text-center text-xs mt-12 ${footerClass}`}>
          {fixture.msg.madeWith}{" "}
          <Link href="/" className="font-medium text-accent">
            Bizko
          </Link>{" "}
          - bizko.pro/{fixture.profile.username}
        </p>
      </div>
    </div>
  );
}
