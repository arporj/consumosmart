"use client";

import { usePosStore } from "@/store/pos-store";
import { formatElapsed, getTableStatus, minutesSince } from "@/lib/domain/table-status";
import { useNowTick } from "@/lib/useNowTick";
import { TableTile } from "@/components/pos/TableTile";
import { AddTableTile } from "@/components/pos/AddTableTile";
import { AddAreaTile } from "@/components/pos/AddAreaTile";

export default function MesasPage() {
  const areas = usePosStore((s) => s.areas);
  const tables = usePosStore((s) => s.tables);
  const orders = usePosStore((s) => s.orders);
  const now = useNowTick(30_000);

  const counts = tables.reduce(
    (acc, table) => {
      acc[getTableStatus(table, orders)] += 1;
      return acc;
    },
    { free: 0, occupied: 0, waiting: 0, reserved: 0 }
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Mapa de Mesas</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Toque numa mesa para abrir a comanda.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-on-surface-variant">
          <span>
            <span className="font-extrabold text-status-free">{counts.free}</span> livres
          </span>
          <span>
            <span className="font-extrabold text-status-occupied">{counts.occupied}</span>{" "}
            ocupadas
          </span>
          <span>
            <span className="font-extrabold text-status-waiting">{counts.waiting}</span>{" "}
            aguardando
          </span>
          <span>
            <span className="font-extrabold text-status-reserved">{counts.reserved}</span>{" "}
            reservadas
          </span>
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
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                  {areaTables.map((table) => {
                    const status = getTableStatus(table, orders);
                    const order = table.orderId ? orders[table.orderId] : null;

                    let meta = "Livre";
                    if (status === "reserved") {
                      meta = table.reservationNote ?? "Reservada";
                    } else if (order && now) {
                      const elapsed = formatElapsed(minutesSince(order.openedAt, now));
                      meta = `${order.guestCount} pessoa${order.guestCount > 1 ? "s" : ""} · ${elapsed}`;
                    } else if (order) {
                      meta = `${order.guestCount} pessoa${order.guestCount > 1 ? "s" : ""}`;
                    }

                    return (
                      <TableTile
                        key={table.id}
                        tableId={table.id}
                        label={table.label}
                        status={status}
                        meta={meta}
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
    </div>
  );
}
