"use client";

import { useState, useTransition } from "react";
import { createArea, deleteArea, createTable, updateTable, deleteTable } from "./actions";
import { ConfirmModal } from "@/components/ConfirmModal";

type Area = { id: string; name: string };
type Table = { id: string; area_id: string | null; label: string; seats: number | null };

function AddAreaInline({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-dashed border-outline-variant px-4 py-3 text-sm font-bold text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
      >
        <span className="material-symbols-outlined">add</span>
        Nova área
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-low p-4 sm:flex-row sm:items-center">
      <input
        autoFocus
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Ex: Salão, Varanda"
        className="flex-1 rounded-lg border border-outline-variant bg-surface-container-highest px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
      />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              try {
                await createArea(slug, name);
                setName("");
                setOpen(false);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Erro ao criar área.");
              }
            });
          }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-60"
        >
          Salvar
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold text-on-surface-variant"
        >
          Cancelar
        </button>
      </div>
      <ConfirmModal
        open={error !== null}
        title="Não foi possível criar a área"
        description={error ?? ""}
        confirmLabel="Ok"
        hideCancel
        onCancel={() => setError(null)}
        onConfirm={() => setError(null)}
      />
    </div>
  );
}

function AddTableInline({ slug, areaId }: { slug: string; areaId: string | null }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [seats, setSeats] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-dashed border-outline-variant px-4 py-2.5 text-sm font-bold text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
      >
        <span className="material-symbols-outlined text-base">add</span>
        Nova mesa
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-low p-3 sm:flex-row sm:items-center">
      <input
        autoFocus
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        placeholder="Número ou nome (ex: 07, André)"
        className="flex-1 rounded-lg border border-outline-variant bg-surface-container-highest px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
      />
      <input
        value={seats}
        onChange={(event) => setSeats(event.target.value.replace(/\D/g, ""))}
        placeholder="Lugares"
        className="w-24 rounded-lg border border-outline-variant bg-surface-container-highest px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
      />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              try {
                await createTable(slug, areaId, label, seats ? Number(seats) : null);
                setLabel("");
                setSeats("");
                setOpen(false);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Erro ao criar mesa.");
              }
            });
          }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-60"
        >
          Salvar
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold text-on-surface-variant"
        >
          Cancelar
        </button>
      </div>
      <ConfirmModal
        open={error !== null}
        title="Não foi possível criar a mesa"
        description={error ?? ""}
        confirmLabel="Ok"
        hideCancel
        onCancel={() => setError(null)}
        onConfirm={() => setError(null)}
      />
    </div>
  );
}

function EditTableInline({
  slug,
  table,
  onDone,
}: {
  slug: string;
  table: Table;
  onDone: () => void;
}) {
  const [label, setLabel] = useState(table.label);
  const [seats, setSeats] = useState(table.seats ? String(table.seats) : "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-low p-3 sm:flex-row sm:items-center">
      <input
        autoFocus
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        placeholder="Número ou nome"
        className="flex-1 rounded-lg border border-outline-variant bg-surface-container-highest px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
      />
      <input
        value={seats}
        onChange={(event) => setSeats(event.target.value.replace(/\D/g, ""))}
        placeholder="Lugares"
        className="w-24 rounded-lg border border-outline-variant bg-surface-container-highest px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
      />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              try {
                await updateTable(slug, table.id, label, seats ? Number(seats) : null);
                onDone();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Erro ao salvar mesa.");
              }
            });
          }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-60"
        >
          Salvar
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold text-on-surface-variant"
        >
          Cancelar
        </button>
      </div>
      <ConfirmModal
        open={error !== null}
        title="Não foi possível salvar"
        description={error ?? ""}
        confirmLabel="Ok"
        hideCancel
        onCancel={() => setError(null)}
        onConfirm={() => setError(null)}
      />
    </div>
  );
}

function TableRow({ slug, table }: { slug: string; table: Table }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (editing) {
    return <EditTableInline slug={slug} table={table} onDone={() => setEditing(false)} />;
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-outline-variant/50 bg-surface-container-highest px-4 py-2.5 shadow-sm shadow-black/10">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-on-surface-variant">table_restaurant</span>
        <span className="text-sm font-bold">{table.label}</span>
        {table.seats && (
          <span className="text-xs text-on-surface-variant">{table.seats} lugares</span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex p-1 text-on-surface-variant transition-colors hover:text-primary"
        >
          <span className="material-symbols-outlined text-base">edit</span>
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setConfirmOpen(true)}
          className="inline-flex p-1 text-on-surface-variant transition-colors hover:text-error disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-base">delete</span>
        </button>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Excluir mesa"
        description={`Excluir a mesa "${table.label}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Voltar"
        destructive
        pending={pending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          startTransition(async () => {
            try {
              await deleteTable(slug, table.id);
              setConfirmOpen(false);
            } catch (err) {
              setConfirmOpen(false);
              setError(err instanceof Error ? err.message : "Erro ao excluir mesa.");
            }
          });
        }}
      />
      <ConfirmModal
        open={error !== null}
        title="Não foi possível excluir"
        description={error ?? ""}
        confirmLabel="Ok"
        hideCancel
        onCancel={() => setError(null)}
        onConfirm={() => setError(null)}
      />
    </div>
  );
}

function AreaCard({
  slug,
  area,
  tables,
}: {
  slug: string;
  area: Area | null;
  tables: Table[];
}) {
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-outline-variant/60 bg-surface-container-low p-6 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold">{area ? area.name : "Sem área"}</h3>
        {area && (
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirmOpen(true)}
            className="inline-flex p-1 text-on-surface-variant transition-colors hover:text-error disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-base">delete</span>
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {tables.map((table) => (
          <TableRow key={table.id} slug={slug} table={table} />
        ))}
        {tables.length === 0 && (
          <p className="text-sm text-on-surface-variant">Nenhuma mesa aqui ainda.</p>
        )}
      </div>

      <AddTableInline slug={slug} areaId={area?.id ?? null} />

      {area && (
        <>
          <ConfirmModal
            open={confirmOpen}
            title="Excluir área"
            description={`Excluir a área "${area.name}"? As mesas dela passam a ficar sem área — os dados são preservados.`}
            confirmLabel="Excluir"
            cancelLabel="Voltar"
            destructive
            pending={pending}
            onCancel={() => setConfirmOpen(false)}
            onConfirm={() => {
              startTransition(async () => {
                try {
                  await deleteArea(slug, area.id);
                  setConfirmOpen(false);
                } catch (err) {
                  setConfirmOpen(false);
                  setError(err instanceof Error ? err.message : "Erro ao excluir área.");
                }
              });
            }}
          />
          <ConfirmModal
            open={error !== null}
            title="Não foi possível excluir"
            description={error ?? ""}
            confirmLabel="Ok"
            hideCancel
            onCancel={() => setError(null)}
            onConfirm={() => setError(null)}
          />
        </>
      )}
    </section>
  );
}

export function MesasBoard({
  slug,
  areas,
  tables,
}: {
  slug: string;
  areas: Area[];
  tables: Table[];
}) {
  const tablesWithoutArea = tables.filter((t) => t.area_id === null);

  return (
    <div className="flex flex-col gap-6">
      <AddAreaInline slug={slug} />
      {areas.map((area) => (
        <AreaCard
          key={area.id}
          slug={slug}
          area={area}
          tables={tables.filter((t) => t.area_id === area.id)}
        />
      ))}
      {(tablesWithoutArea.length > 0 || areas.length === 0) && (
        <AreaCard slug={slug} area={null} tables={tablesWithoutArea} />
      )}
    </div>
  );
}
