import Link from "next/link";
import { requireGestor } from "@/lib/auth/require-gestor";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Order = { id: string; table_id: string | null; status: string; guest_count: number };
type OrderItem = { order_id: string; product_id: string; quantity: number; unit_price_cents: number };
type OrderPayment = { order_id: string; amount_cents: number };
type Reservation = { id: string; table_id: string | null; guest_count: number; reserved_at: string };

type TableStatus = "free" | "occupied" | "waiting" | "reserved";

type TableState = {
  status: TableStatus;
  guestCount: number;
  totalCents: number;
  reservedAt?: string;
};

const TONE_CHIP: Record<string, string> = {
  primary: "bg-primary-container/30 text-primary",
  secondary: "bg-secondary-container/50 text-secondary",
  tertiary: "bg-tertiary-container/20 text-tertiary",
};

const STATUS_LABEL: Record<TableStatus, string> = {
  free: "Livre",
  occupied: "Ocupada",
  waiting: "Aguardando",
  reserved: "Reservada",
};

const STATUS_DOT_CLASS: Record<TableStatus, string> = {
  free: "bg-status-free",
  occupied: "bg-status-occupied",
  waiting: "bg-status-waiting",
  reserved: "bg-status-reserved",
};

const STATUS_BADGE_CLASS: Record<TableStatus, string> = {
  free: "bg-status-free/20 text-status-free",
  occupied: "bg-status-occupied/20 text-status-occupied",
  waiting: "bg-status-waiting/20 text-status-waiting",
  reserved: "bg-status-reserved/20 text-status-reserved",
};

const STATUS_BORDER_CLASS: Record<TableStatus, string> = {
  free: "border-status-free/40",
  occupied: "border-status-occupied/40",
  waiting: "border-status-waiting/40",
  reserved: "border-status-reserved/40",
};

const ROLE_LABEL: Record<string, string> = {
  gestor: "Gerente",
  garcom: "Garçom",
  caixa: "Caixa",
  cozinha: "Cozinheiro",
  bar: "Bar",
};

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
}

export default async function GestaoDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { restaurant } = await requireGestor(slug);
  const supabase = createAdminClient();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);
  const now = new Date();

  const [
    { data: tables },
    { count: areasCount },
    { count: categoriesCount },
    { data: products },
    { data: staff },
    { data: todayOrders },
    { data: upcomingReservations },
  ] = await Promise.all([
    supabase
      .from("tables")
      .select("id, label, seats")
      .eq("restaurant_id", restaurant.id)
      .order("label", { ascending: true }),
    supabase
      .from("restaurant_areas")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurant.id),
    supabase
      .from("product_categories")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurant.id),
    supabase.from("products").select("id, name, is_active").eq("restaurant_id", restaurant.id),
    supabase
      .from("staff")
      .select("id, name, role, is_active")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("orders")
      .select("id, table_id, status, guest_count")
      .eq("restaurant_id", restaurant.id)
      .gte("opened_at", startOfToday.toISOString())
      .neq("status", "canceled"),
    supabase
      .from("reservations")
      .select("id, table_id, guest_count, reserved_at")
      .eq("restaurant_id", restaurant.id)
      .eq("status", "confirmed")
      .gte("reserved_at", now.toISOString())
      .lt("reserved_at", endOfToday.toISOString()),
  ]);

  const orderIds = (todayOrders as Order[] | null ?? []).map((order) => order.id);

  const [{ data: todayItems }, { data: todayPayments }] = await Promise.all([
    orderIds.length
      ? supabase
          .from("order_items")
          .select("order_id, product_id, quantity, unit_price_cents")
          .in("order_id", orderIds)
      : Promise.resolve({ data: [] as OrderItem[] }),
    orderIds.length
      ? supabase.from("order_payments").select("order_id, amount_cents").in("order_id", orderIds)
      : Promise.resolve({ data: [] as OrderPayment[] }),
  ]);

  const orders = (todayOrders as Order[] | null) ?? [];
  const items = (todayItems as OrderItem[] | null) ?? [];
  const payments = (todayPayments as OrderPayment[] | null) ?? [];
  const productNameById = new Map((products ?? []).map((product) => [product.id, product.name]));
  const activeProductsCount = (products ?? []).filter((product) => product.is_active).length;

  const tableStates = new Map<string, TableState>();
  for (const order of orders) {
    if (!order.table_id) continue;
    if (order.status !== "open" && order.status !== "awaiting_payment") continue;
    const totalCents = items
      .filter((item) => item.order_id === order.id)
      .reduce((sum, item) => sum + item.unit_price_cents * item.quantity, 0);
    tableStates.set(order.table_id, {
      status: order.status === "open" ? "occupied" : "waiting",
      guestCount: order.guest_count,
      totalCents,
    });
  }
  for (const reservation of (upcomingReservations as Reservation[] | null) ?? []) {
    if (!reservation.table_id || tableStates.has(reservation.table_id)) continue;
    tableStates.set(reservation.table_id, {
      status: "reserved",
      guestCount: reservation.guest_count,
      totalCents: 0,
      reservedAt: reservation.reserved_at,
    });
  }
  const occupiedOrWaitingCount = [...tableStates.values()].filter(
    (state) => state.status === "occupied" || state.status === "waiting",
  ).length;

  const closedOrdersCount = orders.filter((order) => order.status === "closed").length;
  const faturamentoHojeCents = payments.reduce((sum, payment) => sum + payment.amount_cents, 0);
  const ticketMedioCents =
    closedOrdersCount > 0 ? Math.round(faturamentoHojeCents / closedOrdersCount) : 0;

  const productQuantities = new Map<string, number>();
  for (const item of items) {
    productQuantities.set(item.product_id, (productQuantities.get(item.product_id) ?? 0) + item.quantity);
  }
  const topProducts = [...productQuantities.entries()]
    .map(([productId, quantity]) => ({ name: productNameById.get(productId) ?? "Produto", quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 4);

  const activeStaff = (staff ?? []).filter((member) => member.is_active);
  const weekday = new Date().toLocaleDateString("pt-BR", { weekday: "long" });

  const stats = [
    {
      label: "Mesas ocupadas",
      value: `${occupiedOrWaitingCount}`,
      hint: `de ${(tables ?? []).length}`,
      icon: "table_restaurant",
      tone: "primary",
    },
    {
      label: "Pedidos hoje",
      value: `${orders.length}`,
      hint: "abertos e fechados",
      icon: "receipt_long",
      tone: "secondary",
    },
    {
      label: "Faturamento do dia",
      value: formatBRL(faturamentoHojeCents),
      hint: `${closedOrdersCount} conta${closedOrdersCount === 1 ? "" : "s"} fechada${closedOrdersCount === 1 ? "" : "s"}`,
      icon: "payments",
      tone: "primary",
    },
    {
      label: "Ticket médio",
      value: closedOrdersCount > 0 ? formatBRL(ticketMedioCents) : "—",
      hint: "por conta fechada",
      icon: "insights",
      tone: "tertiary",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black tracking-tight">Painel</h1>
          <p className="mt-1 text-on-surface-variant">
            Visão geral de hoje, {weekday}.
          </p>
        </div>
        <Link
          href="/balcao"
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Nova comanda
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-3 rounded-2xl border border-outline-variant/30 bg-surface-container-high p-5 shadow-md"
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${TONE_CHIP[stat.tone]}`}
            >
              <span className="material-symbols-outlined">{stat.icon}</span>
            </span>
            <div>
              <p className="font-display text-3xl font-black tabular-nums">{stat.value}</p>
              <p className="text-sm font-bold text-on-surface-variant">{stat.label}</p>
              <p className="text-xs text-on-surface-variant/70">{stat.hint}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="flex flex-col gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container p-6 shadow-md lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-lg font-bold">Mesas em tempo real</h2>
              <p className="text-xs text-on-surface-variant">
                {areasCount ?? 0} área{(areasCount ?? 0) === 1 ? "" : "s"} do salão
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
              {(["free", "occupied", "waiting", "reserved"] as const).map((status) => (
                <span key={status} className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${STATUS_DOT_CLASS[status]}`} />
                  {STATUS_LABEL[status]}
                </span>
              ))}
            </div>
          </div>

          {(tables ?? []).length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              Nenhuma mesa cadastrada ainda —{" "}
              <Link href={`/gestao/${slug}/mesas`} className="font-bold text-primary">
                cadastre em Mesas
              </Link>
              .
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {(tables ?? []).map((table) => {
                const state = tableStates.get(table.id);
                const status = state?.status ?? "free";

                let meta: string;
                if (status === "reserved" && state?.reservedAt) {
                  const time = new Date(state.reservedAt).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  meta = `${state.guestCount} pessoa${state.guestCount === 1 ? "" : "s"} · ${time}h`;
                } else if (state) {
                  meta = `${state.guestCount} pessoa${state.guestCount === 1 ? "" : "s"}${state.totalCents > 0 ? ` · ${formatBRL(state.totalCents)}` : ""}`;
                } else {
                  meta = `${table.seats ?? "—"} lugares`;
                }

                return (
                  <div
                    key={table.id}
                    className={`flex flex-col gap-1.5 rounded-xl border bg-surface-container-highest px-3 py-2.5 shadow-sm ${STATUS_BORDER_CLASS[status]}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-base font-extrabold">{table.label}</span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_BADGE_CLASS[status]}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT_CLASS[status]}`} />
                        {STATUS_LABEL[status]}
                      </span>
                    </div>
                    <span className="text-xs text-on-surface-variant">{meta}</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="flex flex-col gap-4">
          <section className="flex flex-col gap-3 rounded-2xl border border-outline-variant/30 bg-surface-container p-5 shadow-md">
            <h2 className="font-display text-base font-bold">Mais pedidos hoje</h2>
            {topProducts.length === 0 ? (
              <p className="text-sm text-on-surface-variant">Nenhum pedido lançado hoje ainda.</p>
            ) : (
              <ol className="flex flex-col gap-2">
                {topProducts.map((product, index) => (
                  <li key={product.name} className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2 truncate">
                      <span className="text-xs font-bold text-on-surface-variant">{index + 1}</span>
                      <span className="truncate font-semibold">{product.name}</span>
                    </span>
                    <span className="flex-none text-xs font-bold text-on-surface-variant">
                      {product.quantity} un
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="flex flex-col gap-3 rounded-2xl border border-outline-variant/30 bg-surface-container p-5 shadow-md">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold">Equipe</h2>
              <span className="text-xs text-on-surface-variant">
                {activeStaff.length} ativo{activeStaff.length === 1 ? "" : "s"}
              </span>
            </div>
            {activeStaff.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                Nenhum funcionário cadastrado ainda —{" "}
                <Link href={`/gestao/${slug}/equipe`} className="font-bold text-primary">
                  convide em Equipe
                </Link>
                .
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {activeStaff.slice(0, 5).map((member) => (
                  <li key={member.id} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-surface-container-highest text-xs font-bold text-on-surface-variant">
                      {initials(member.name)}
                    </span>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-bold">{member.name}</span>
                      <span className="text-xs text-on-surface-variant">
                        {ROLE_LABEL[member.role] ?? member.role}
                      </span>
                    </div>
                  </li>
                ))}
                {activeStaff.length > 5 && (
                  <li className="text-xs text-on-surface-variant">
                    +{activeStaff.length - 5} outra{activeStaff.length - 5 === 1 ? "" : "s"} pessoa
                    {activeStaff.length - 5 === 1 ? "" : "s"}
                  </li>
                )}
              </ul>
            )}
          </section>
        </div>
      </div>

      <p className="text-center text-xs text-on-surface-variant/60">
        {activeProductsCount} item{activeProductsCount === 1 ? "" : "s"} ativo
        {activeProductsCount === 1 ? "" : "s"} em {categoriesCount ?? 0} categoria
        {(categoriesCount ?? 0) === 1 ? "" : "s"} de cardápio.
      </p>
    </div>
  );
}
