"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  destructive = false,
  hideCancel = false,
  pending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  hideCancel?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-description"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-outline-variant bg-surface-container-low p-6 shadow-2xl"
      >
        <h2 id="confirm-modal-title" className="font-display text-lg font-bold">
          {title}
        </h2>
        <p id="confirm-modal-description" className="mt-2 text-sm text-on-surface-variant">
          {description}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          {!hideCancel && (
            <button
              type="button"
              autoFocus
              disabled={pending}
              onClick={onCancel}
              className="rounded-xl border border-outline-variant bg-surface-container-highest px-4 py-2 text-sm font-bold transition-colors hover:border-secondary disabled:opacity-60"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            autoFocus={hideCancel}
            disabled={pending}
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition-all active:scale-95 disabled:opacity-60 ${
              destructive
                ? "bg-error text-on-error hover:brightness-110"
                : "bg-primary text-on-primary hover:brightness-110"
            }`}
          >
            {pending ? "Aguarde…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
