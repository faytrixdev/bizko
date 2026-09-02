"use client";

import { useRef, useEffect } from "react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields: { name: string; value: string }[];
}

export function ConfirmDialog({
  open,
  onClose,
  title,
  message,
  confirmLabel,
  cancelLabel,
  action,
  hiddenFields,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="rounded-2xl border border-gray-200 shadow-2xl p-0 w-full max-w-md"
    >
      <div className="flex flex-col gap-4 p-6">
        <h2 className="text-lg font-semibold text-red-600">{title}</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{message}</p>

        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200 transition-colors"
          >
            {cancelLabel}
          </button>
          <form action={async (formData: FormData) => {
            await action(formData);
            onClose();
          }}>
            {hiddenFields.map((f) => (
              <input key={f.name} type="hidden" name={f.name} value={f.value} />
            ))}
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              {confirmLabel}
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
}
