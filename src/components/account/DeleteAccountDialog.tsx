"use client";

import React, { useState } from "react";
import { useActionState } from "react";
import { deleteAccount } from "@/app/(auth)/actions";
import { Input } from "@/components/auth/Input";
import { Alert } from "@/components/auth/Alert";
import { useI18n } from "@/lib/i18n/provider";

interface DeleteAccountDialogProps {
  user: { id: string; email?: string };
}

export function DeleteAccountDialog({ user }: DeleteAccountDialogProps) {
  const { t } = useI18n();
  const [confirmation, setConfirmation] = useState("");
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string } | null, _formData: FormData) => {
      return await deleteAccount();
    },
    null
  );

  const isConfirmed = confirmation === "SUPPRIMER";

  return (
    <div className="flex flex-col gap-5">
      <Alert type="error">{state?.error}</Alert>

      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <h3 className="text-sm font-semibold text-red-800 mb-2">
          {t("deleteAccount.zone")}
        </h3>
        <p className="text-sm text-red-700 leading-relaxed mb-4">
          {t("deleteAccount.warning")} <strong>{t("deleteAccount.irreversible")}</strong>.
          {t("deleteAccount.willDelete")}
        </p>
        <ul className="text-sm text-red-700 leading-relaxed mb-4 list-disc list-inside space-y-1">
          <li>{t("deleteAccount.item1")}</li>
          <li>{t("deleteAccount.item2")}</li>
          <li>{t("deleteAccount.item3")}</li>
          <li>{t("deleteAccount.item4")}</li>
        </ul>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
        <p className="text-sm text-gray-700 mb-3">
          {t("deleteAccount.typeInstruction")} <strong>SUPPRIMER</strong> {t("deleteAccount.typeConfirm")} ({user.email || t("deleteAccount.emailUnavailable")}).
        </p>
        <Input
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder={t("deleteAccount.placeholder")}
          className="font-mono"
        />
      </div>

      <form action={formAction}>
        <button
          type="submit"
          disabled={!isConfirmed || isPending}
          className="h-11 w-full rounded-lg bg-red-600 text-white inline-flex items-center justify-center gap-2 text-sm font-semibold transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending && <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
          {t("deleteAccount.btn")}
        </button>
      </form>
    </div>
  );
}
