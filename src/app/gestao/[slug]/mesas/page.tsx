import { requireGestor } from "@/lib/auth/require-gestor";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTodayTableSummary, type TableStatus } from "@/lib/gestao/table-states";
import { MesasBoard } from "./MesasBoard";

export const dynamic = "force-dynamic";

const STAT_ITEMS: { status: TableStatus; label: string; icon: string; tone: string }[] = [
  { status: "free", label: "Livres", icon: "check_circle", tone: "bg-status-free/15 text-status-free" },
  { status: "occupied", label: "Ocupadas", icon: "table_restaurant", tone: "bg-status-occupied/15 text-status-occupied" },
  { status: "waiting", label: "Aguardando", icon: "receipt_long", tone: "bg-status-waiting/15 text-status-waiting" },
  { status: "reserved", label: "Reservadas", icon: "bookmark", tone: "bg-status-reserved/15 text-status-reserved" },
];

export default async function MesasPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { restaurant } = await requireGestor(slug);
  const supabase = createAdminClient();

  const { data: areas } = await supabase
    .from("restaurant_areas")
    .select("id, name")
    .eq("restaurant_id", restaurant.id)
    .order("sort_order", { ascending: true });

  const { data: tables } = await supabase
    .from("tables")
    .select("id, area_id, label, seats")
    .eq("restaurant_id", restaurant.id)
    .order("label", { ascending: true });

  const { tableStates } = await getTodayTableSummary(supabase, restaurant.id);

  const counts = (tables ?? []).reduce(
    (acc, table) => {
      const status = tableStates.get(table.id)?.status ?? "free";
      acc[status] += 1;
      return acc;
    },
    { free: 0, occupied: 0, waiting: 0, reserved: 0 } as Record<TableStatus, number>,
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black tracking-tight">Mesas</h1>
          <p className="mt-1 text-on-surface-variant">
            Organize o salão em áreas e cadastre as mesas de cada uma.
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

      <MesasBoard slug={slug} areas={areas ?? []} tables={tables ?? []} tableStates={tableStates} />
    </div>
  );
}
