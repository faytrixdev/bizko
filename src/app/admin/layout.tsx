import type { Metadata } from "next";
import { PeriodProvider } from "./PeriodContext";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

export const metadata: Metadata = {
  title: "Bizko Analytics",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PeriodProvider>
      <div className="min-h-screen flex flex-col bg-white">
        <AdminHeader />
        <div className="flex flex-1">
          <AdminSidebar />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </PeriodProvider>
  );
}
