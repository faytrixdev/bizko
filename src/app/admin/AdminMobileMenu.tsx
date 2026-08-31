"use client";

import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

export function AdminMobileMenu({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => setMenuOpen((v) => !v);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AdminHeader onMenuToggle={toggleMenu} />
      <div className="flex flex-1">
        {menuOpen && (
          <div
            className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm lg:hidden"
            onClick={closeMenu}
            aria-hidden="true"
          />
        )}
        <AdminSidebar isOpen={menuOpen} onClose={closeMenu} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
