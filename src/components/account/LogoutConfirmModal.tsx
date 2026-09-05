"use client";

import React, { useState, useRef, useEffect } from "react";
import { logout } from "@/app/(auth)/actions";
import { Alert } from "@/components/auth/Alert";
import { useI18n } from "@/lib/i18n/provider";

interface LogoutConfirmModalProps {
  open: boolean;
  onClose: () => void;
}

export function LogoutConfirmModal({ open, onClose }: LogoutConfirmModalProps) {
  const { t } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  function handleClose() {
    setError(null);
    onClose();
  }

  async function handleLogout() {
    setIsPending(true);
    setError(null);
    try {
      const result = await logout();
      if (result && "error" in result && result.error) {
        setError(result.error);
      } else {
        // Hard navigation clears any client-side session leftovers (localStorage)
        // a soft router.push wouldn't wipe.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/";
      }
    } catch {
      setError(t("auth2.logoutError"));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      className="rounded-2xl border border-gray-200 shadow-2xl p-0 w-full max-w-sm"
    >
      <div className="flex flex-col gap-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900">{t("accountPage.logoutTitle")}</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          {t("accountPage.logoutConfirm")}
        </p>
        {error && <Alert type="error">{error}</Alert>}
        <div className="flex gap-3 mt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="flex-1 h-10 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-60"
          >
            {t("accountPage.logoutCancel")}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            className="flex-1 h-10 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {isPending && <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
            {t("accountPage.logoutConfirmBtn")}
          </button>
        </div>
      </div>
    </dialog>
  );
}
