"use client";

import React, { useState, useRef, useEffect } from "react";
import { useActionState } from "react";
import { changePassword } from "@/app/(auth)/actions";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Field } from "@/components/auth/Field";
import { Alert } from "@/components/auth/Alert";
import { useI18n } from "@/lib/i18n/provider";

interface PasswordChangeModalProps {
  open: boolean;
  onClose: () => void;
}

export function PasswordChangeModal({ open, onClose }: PasswordChangeModalProps) {
  const { t } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction, isPending] = useActionState(
    async (_prev: { success?: string; error?: string } | null, formData: FormData) => {
      return await changePassword(formData);
    },
    null
  );

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
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      className="backdrop:bg-black/40 backdrop:backdrop-blur-sm rounded-2xl border border-gray-200 shadow-2xl p-0 w-full max-w-md"
    >
      <form action={formAction} className="flex flex-col gap-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900">{t("accountPage.changePassword")}</h2>

        <Alert type="error">{state?.error}</Alert>
        <Alert type="success">{state?.success}</Alert>

        <Field label={t("accountPage.passwordCurrent")}>
          <PasswordInput
            name="currentPassword"
            required
            autoComplete="current-password"
          />
        </Field>

        <Field label={t("accountPage.passwordNew")} hint={t("accountPage.passwordNewHint")}>
          <PasswordInput
            name="newPassword"
            required
            minLength={6}
            autoComplete="new-password"
          />
        </Field>

        <Field label={t("accountPage.passwordConfirm")}>
          <PasswordInput
            name="confirmPassword"
            required
            minLength={6}
            autoComplete="new-password"
          />
        </Field>

        <div className="flex gap-3 mt-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 h-10 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
          >
            {t("accountPage.passwordCancel")}
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 h-10 rounded-lg bg-[#FF6B35] text-white text-sm font-semibold hover:bg-[#EA580C] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {isPending && <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
            {t("accountPage.passwordChangeBtn")}
          </button>
        </div>
      </form>
    </dialog>
  );
}
