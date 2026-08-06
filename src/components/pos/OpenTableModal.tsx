"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const QUICK_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function OpenTableModal({
  open,
  tableLabel,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  tableLabel: string;
  onCancel: () => void;
  onConfirm: (guestCount: number) => void;
}) {
  const [guestCount, setGuestCount] = useState(1);
  const [manualValue, setManualValue] = useState("");

  function reset() {
    setGuestCount(1);
    setManualValue("");
  }

  function handleCancel() {
    reset();
    onCancel();
  }

  function handleConfirm() {
    const count = guestCount;
    reset();
    onConfirm(count);
  }

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleCancel closes over guestCount only to reset it; re-subscribing per keystroke isn't needed
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={handleCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="open-table-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-outline-variant bg-surface-container-high shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-outline-variant/40 bg-surface-container px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container/30">
              <span className="material-symbols-outlined text-primary">table_restaurant</span>
            </span>
            <h2 id="open-table-modal-title" className="font-display text-lg font-extrabold">
              Abrir mesa <span className="text-primary">{tableLabel}</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6">
          <p className="mb-3 text-sm font-bold text-on-surface">Número de pessoas</p>
          <div className="grid grid-cols-5 gap-2">
            {QUICK_COUNTS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setGuestCount(n);
                  setManualValue("");
                }}
                className={`flex flex-col items-center gap-1 rounded-xl border py-3 transition-all ${
                  guestCount === n && !manualValue
                    ? "border-2 border-primary bg-primary-container/30 text-primary"
                    : "border-outline-variant/50 bg-surface-container text-on-surface-variant hover:border-primary/60"
                }`}
              >
                <span className="material-symbols-outlined text-lg">person</span>
                <span className="font-display text-sm font-bold">{n}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-xl border border-outline-variant/50 bg-surface-container px-3 py-2.5">
            <span className="material-symbols-outlined text-on-surface-variant">group_add</span>
            <span className="flex-1 text-sm text-on-surface-variant">Mais de 10 pessoas?</span>
            <input
              type="number"
              min={11}
              value={manualValue}
              onChange={(event) => {
                const raw = event.target.value;
                setManualValue(raw);
                const n = Number(raw);
                if (n > 0) setGuestCount(n);
              }}
              placeholder="Qtd"
              className="w-20 rounded-lg border border-outline-variant bg-surface-container-highest px-2 py-1.5 text-center text-sm font-bold outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-outline-variant/40 bg-surface-container px-6 py-4">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-full px-5 py-2.5 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container-highest"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-transform active:scale-95"
          >
            Abrir mesa
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
