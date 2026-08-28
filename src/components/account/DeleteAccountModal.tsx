"use client";

import React, { useState, useRef, useEffect } from "react";
import { useActionState } from "react";
import { deleteAccount } from "@/app/(auth)/actions";
import { Input } from "@/components/auth/Input";
import { Alert } from "@/components/auth/Alert";
import { useI18n } from "@/lib/i18n/provider";

interface DeleteAccountModalProps {
  open: boolean;
  onClose: () => void;
  user: { id: string; email?: string };
}

export function DeleteAccountModal({ open, onClose, user }: DeleteAccountModalProps) {
  const { t } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [confirmation, setConfirmation] = useState("");
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string } | null, _formData: FormData) => {
      return await deleteAccount();
    },
    null
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
      setConfirmation("");
    } else {
      dialog.close();
    }
  }, [open]);

  function handleClose() {
    onClose();
  }

  const isConfirmed = confirmation === "DELETE";

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      className="backdrop:bg-black/40 backdrop:backdrop-blur-sm rounded-2xl border border-gray-200 shadow-2xl p-0 w-full max-w-md"
    >
      <div className="flex flex-col gap-4 p-6">
        <h2 className="text-lg font-semibold text-red-600">{t("accountPage.deleteTitle")}</h2>

        <Alert type="error">{state?.error}</Alert>

        <p className="text-sm text-gray-600 leading-relaxed">
          {t("accountPage.deleteWarning")}
        </p>

        <ul className="text-sm text-gray-600 leading-relaxed list-disc list-inside space-y-1">
          <li>{t("accountPage.deleteItem1")}</li>
          <li>{t("accountPage.deleteItem2")}</li>
          <li>{t("accountPage.deleteItem3")}</li>
          <li>{t("accountPage.deleteItem4")}</li>
        </ul>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-700 mb-3">
            {t("accountPage.deleteTypeConfirm")}
          </p>
          <Input
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder={t("accountPage.deletePlaceholder")}
            className="font-mono"
          />
        </div>

        <div className="flex gap-3 mt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="flex-1 h-10 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-60"
          >
            {t("accountPage.deleteCancel")}
          </button>
          <form action={formAction} className="flex-1">
            <button
              type="submit"
              disabled={!isConfirmed || isPending}
              className="w-full h-10 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {isPending && <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
              {t("accountPage.deleteConfirmBtn")}
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
}
