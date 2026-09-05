"use client";

import React, { useState, useRef, useEffect } from "react";
import { sendPasswordResetEmail } from "@/app/(auth)/actions";
import { Alert } from "@/components/auth/Alert";
import { useI18n } from "@/lib/i18n/provider";

interface PasswordChangeModalProps {
  open: boolean;
  onClose: () => void;
  email: string;
}

export function PasswordChangeModal({ open, onClose, email }: PasswordChangeModalProps) {
  const { t } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

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
    setSent(false);
    onClose();
  }

  async function handleSend() {
    setIsPending(true);
    setError(null);
    try {
      const result = await sendPasswordResetEmail();
      if (result?.error) {
        setError(result.error);
      } else {
        setSent(true);
      }
    } catch {
      setError(t("auth2.errorFetchFailed"));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      className="rounded-2xl border border-gray-200 shadow-2xl p-0 w-full max-w-md"
    >
      <div className="flex flex-col gap-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900">{t("accountPage.changePassword")}</h2>

        {sent ? (
          <>
            <Alert type="success">{t("auth2.successForgotEmail")}</Alert>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t("accountPage.passwordCheckInbox")}
            </p>
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 h-10 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
              >
                {t("accountPage.passwordDone")}
              </button>
            </div>
          </>
        ) : (
          <>
            {error && <Alert type="error">{error}</Alert>}
            <p className="text-sm text-gray-600 leading-relaxed">
              {t("accountPage.passwordModalDesc")}
            </p>
            <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-sm font-medium text-gray-900 break-all">
              {email}
            </div>
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="flex-1 h-10 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-60"
              >
                {t("accountPage.passwordCancel")}
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={isPending}
                className="flex-1 h-10 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {isPending && <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                {t("accountPage.passwordSendLink")}
              </button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
