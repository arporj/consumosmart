"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { orderTotalCents, usePosStore } from "@/store/pos-store";
import { formatElapsed, getTableStatus, minutesSince, type TableStatus } from "@/lib/domain/table-status";
import { useNowTick } from "@/lib/useNowTick";
import { TableTile } from "@/components/pos/TableTile";
import { AddTableTile } from "@/components/pos/AddTableTile";
import { AddAreaTile } from "@/components/pos/AddAreaTile";
import { OpenTableModal } from "@/components/pos/OpenTableModal";

const STAT_ITEMS: { status: TableStatus; label: string; icon: string; tone: string }[] = [
  { status: "free", label: "Livres", icon: "check_circle", tone: "bg-status-free/15 text-status-free" },
  { status: "occupied", label: "Ocupadas", icon: "table_restaurant", tone: "bg-status-occupied/15 text-status-occupied" },
  { status: "waiting", label: "Conta", icon: "receipt_long", tone: "bg-status-waiting/15 text-status-waiting" },
  { status: "reserved", label: "Reservadas", icon: "bookmark", tone: "bg-status-reserved/15 text-status-reserved" },
];

export default function MesasPage() {
  const router = useRouter();
  const areas = usePosStore((s) => s.areas);
  const tables = usePosStore((s) => s.tables);
  const orders = usePosStore((s) => s.orders);
  const openTableOrder = usePosStore((s) => s.openTableOrder);
  const setGuestCount = usePosStore((s) => s.setGuestCount);
  const now = useNowTick(30_000);
  const [openingTableId, setOpeningTableId] = useState<string | null>(null);

  const counts = tables.reduce(
    (acc, table) => {
      acc[getTableStatus(table, orders)] += 1;
      return acc;
    },
    { free: 0, occupied: 0, waiting: 0, reserved: 0 }
  );

  const openingTable = tables.find((t) => t.id === openingTableId) ?? null;

  function handleConfirmOpen(guestCount: number) {
    if (!openingTable) return;
    const orderId = openTableOrder(openingTable.id);
    setGuestCount(orderId, guestCount);
    setOpeningTableId(null);
    router.push(`/mesas/${openingTable.id}`);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Mapa de Mesas</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Toque numa mesa para abrir a comanda.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {STAT_ITEMS.map((item) => (
            <div
              key={item.status}
              className="flex items-center gap-2 rounded-xl border border-outline-variant/40 bg-surface-container-high px-3 py-2 shadow-sm"
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${item.tone}`}>
                <span className="material-symbols-outlined text-base">{item.icon}</span>
              </span>
              <div className="leading-tight">
                <p className="font-mono text-sm font-extrabold">{counts[item.status]}</p>
                <p className="text-[10px] text-on-surface-variant">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-8">
        {areas
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((area) => {
            const areaTables = tables.filter((t) => t.areaId === area.id);
            return (
              <section key={area.id}>
                <div className="mb-3 flex items-center gap-3">
                  <span className="whitespace-nowrap text-xs font-extrabold uppercase tracking-wide text-secondary">
                    {area.name}
                  </span>
                  <div className="h-[3px] flex-1 bg-outline-variant" />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {areaTables.map((table) => {
                    const status = getTableStatus(table, orders);
                    const order = table.orderId ? orders[table.orderId] : null;
                    const elapsed =
                      order && now ? formatElapsed(minutesSince(order.openedAt, now)) : undefined;

                    return (
                      <TableTile
                        key={table.id}
                        tableId={table.id}
                        label={table.label}
                        status={status}
                        seats={table.seats}
                        guestCount={order?.guestCount}
                        totalCents={order ? orderTotalCents(order) : undefined}
                        elapsed={elapsed}
                        reservationNote={table.reservationNote}
                        onOpen={() => setOpeningTableId(table.id)}
                      />
                    );
                  })}
                  <AddTableTile areaId={area.id} />
                </div>
              </section>
            );
          })}

        <AddAreaTile />
      </div>

      <OpenTableModal
        open={openingTable !== null}
        tableLabel={openingTable?.label ?? ""}
        onCancel={() => setOpeningTableId(null)}
        onConfirm={handleConfirmOpen}
      />
    </div>
  );
}
