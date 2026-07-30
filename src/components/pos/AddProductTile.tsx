"use client";

import { useState } from "react";
import { usePosStore } from "@/store/pos-store";
import { digitsToCents, formatCentsBRL } from "@/lib/domain/format";
import type { Station } from "@/lib/domain/types";

const STATIONS: { value: Station; label: string }[] = [
  { value: "cozinha", label: "Cozinha" },
  { value: "bar", label: "Bar" },
  { value: "sobremesas", label: "Sobremesas" },
];

export function AddProductTile({ categoryId }: { categoryId: string }) {
  const addProduct = usePosStore((s) => s.addProduct);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceCents, setPriceCents] = useState(0);
  const [station, setStation] = useState<Station>("cozinha");

  function reset() {
    setName("");
    setDescription("");
    setPriceCents(0);
    setStation("cozinha");
    setOpen(false);
  }

  function submit() {
    if (!name.trim() || priceCents <= 0) return;
    addProduct({
      name: name.trim(),
      description: description.trim(),
      priceCents,
      categoryId,
      station,
    });
    reset();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-[168px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-outline-variant text-on-surface-variant transition-colors hover:border-secondary"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-outline-variant bg-surface-container-high font-extrabold text-secondary">
          +
        </span>
        <span className="text-xs font-bold">Novo prato</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border-2 border-secondary bg-surface-container-high p-3">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome do prato"
        className="rounded-lg border border-outline bg-surface px-2.5 py-1.5 text-sm text-on-surface"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descrição (o que tem, como é preparado)"
        rows={2}
        className="resize-none rounded-lg border border-outline bg-surface px-2.5 py-1.5 text-xs text-on-surface"
      />
      <div className="flex gap-2">
        <input
          value={priceCents === 0 ? "" : formatCentsBRL(priceCents)}
          onChange={(e) => setPriceCents(digitsToCents(e.target.value))}
          placeholder="0,00"
          inputMode="decimal"
          className="w-24 rounded-lg border border-outline bg-surface px-2.5 py-1.5 font-mono text-sm text-on-surface"
        />
        <select
          value={station}
          onChange={(e) => setStation(e.target.value as Station)}
          className="flex-1 rounded-lg border border-outline bg-surface px-2 py-1.5 text-xs text-on-surface"
        >
          {STATIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={submit}
          className="flex-1 rounded-lg bg-primary py-1.5 text-xs font-extrabold text-on-primary"
        >
          Salvar
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-bold text-on-surface-variant"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
