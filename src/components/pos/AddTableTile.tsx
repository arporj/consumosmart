"use client";

import { useState } from "react";
import { usePosStore } from "@/store/pos-store";

export function AddTableTile({ areaId }: { areaId: string }) {
  const addTable = usePosStore((s) => s.addTable);
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [seats, setSeats] = useState(2);

  function reset() {
    setLabel("");
    setSeats(2);
    setOpen(false);
  }

  function submit() {
    if (!label.trim()) return;
    addTable(areaId, label.trim(), seats);
    reset();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-[86px] flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-outline-variant text-on-surface-variant transition-colors hover:border-secondary"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-outline-variant bg-surface-container-high text-xs font-extrabold text-secondary">
          +
        </span>
        <span className="text-[10.5px] font-bold">Nova mesa</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border-2 border-secondary bg-surface-container-high p-2.5">
      <input
        autoFocus
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Nome ou número (ex. André)"
        maxLength={14}
        className="rounded-lg border border-outline bg-surface px-2.5 py-1.5 text-xs text-on-surface"
      />
      <div className="flex items-center gap-2">
        <label className="text-[10px] font-bold text-on-surface-variant">Lugares</label>
        <input
          type="number"
          min={1}
          max={20}
          value={seats}
          onChange={(e) => setSeats(Math.max(1, Number(e.target.value) || 1))}
          className="w-14 rounded-lg border border-outline bg-surface px-2 py-1 text-xs text-on-surface"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={submit}
          className="flex-1 rounded-lg bg-primary py-1.5 text-[11px] font-extrabold text-on-primary"
        >
          Criar
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-outline-variant px-2.5 py-1.5 text-[11px] font-bold text-on-surface-variant"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
