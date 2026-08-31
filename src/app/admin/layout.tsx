import type { Metadata } from "next";
import { PeriodProvider } from "./PeriodContext";
import { AdminMobileMenu } from "./AdminMobileMenu";

export const metadata: Metadata = {
  title: "Bizko Analytics",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PeriodProvider>
      <AdminMobileMenu>{children}</AdminMobileMenu>
    </PeriodProvider>
  );
}
