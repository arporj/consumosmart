"use client";

import { useState } from "react";
import { usePosStore } from "@/store/pos-store";

export function AddCategoryTile() {
  const addCategory = usePosStore((s) => s.addCategory);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  function submit() {
    if (!name.trim()) return;
    addCategory(name.trim());
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
        + Nova categoria
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
        placeholder="Nome da categoria (ex. Petiscos)"
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
