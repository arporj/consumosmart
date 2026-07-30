"use client";

import { useState } from "react";
import { usePosStore } from "@/store/pos-store";

export function AddAreaTile() {
  const addArea = usePosStore((s) => s.addArea);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  function submit() {
    if (!name.trim()) return;
    addArea(name.trim());
    setName("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border-2 border-dashed border-outline-variant py-3 text-xs font-bold text-on-surface-variant transition-colors hover:border-secondary"
      >
        + Nova área
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Nome da área (ex. Deck Externo)"
        className="flex-1 rounded-lg border border-secondary bg-surface-container-high px-3 py-2 text-sm text-on-surface"
      />
      <button
        type="button"
        onClick={submit}
        className="rounded-lg bg-primary px-4 text-sm font-extrabold text-on-primary"
      >
        Criar
      </button>
    </div>
  );
}
