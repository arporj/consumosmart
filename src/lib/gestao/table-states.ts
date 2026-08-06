import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";

export type TableStatus = "free" | "occupied" | "waiting" | "reserved";

export type TableState = {
  status: TableStatus;
  guestCount: number;
  totalCents: number;
  reservedAt?: string;
};

export type TodayOrder = { id: string; table_id: string | null; status: string; guest_count: number };
export type TodayOrderItem = {
  order_id: string;
  product_id: string;
  unit_price_cents: number;
  quantity: number;
};
export type TodayOrderPayment = { order_id: string; amount_cents: number };

/**
 * Busca pedidos/itens/pagamentos de hoje e reservas confirmadas pra hoje, e deriva o
 * status de cada mesa (livre/ocupada/aguardando conta/reservada) a partir disso — usado
 * tanto no Painel quanto na tela de Mesas da Gestão, pra não ter duas implementações
 * divergindo. Hoje tende a voltar tudo livre/vazio porque o POS ainda grava pedido só no
 * estado local do navegador (ver SCREENS_PLAN.md), mas a query já é real e passa a valer
 * sozinha assim que isso mudar.
 */
export async function getTodayTableSummary(
  supabase: ReturnType<typeof createAdminClient>,
  restaurantId: string,
) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);
  const now = new Date();

  const [{ data: todayOrdersRaw }, { data: upcomingReservationsRaw }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, table_id, status, guest_count")
      .eq("restaurant_id", restaurantId)
      .gte("opened_at", startOfToday.toISOString())
      .neq("status", "canceled"),
    supabase
      .from("reservations")
      .select("id, table_id, guest_count, reserved_at")
      .eq("restaurant_id", restaurantId)
      .eq("status", "confirmed")
      .gte("reserved_at", now.toISOString())
      .lt("reserved_at", endOfToday.toISOString()),
  ]);

  const orders = (todayOrdersRaw as TodayOrder[] | null) ?? [];
  const orderIds = orders.map((order) => order.id);

  const [{ data: itemsRaw }, { data: paymentsRaw }] = await Promise.all([
    orderIds.length
      ? supabase
          .from("order_items")
          .select("order_id, product_id, unit_price_cents, quantity")
          .in("order_id", orderIds)
      : Promise.resolve({ data: [] as TodayOrderItem[] }),
    orderIds.length
      ? supabase.from("order_payments").select("order_id, amount_cents").in("order_id", orderIds)
      : Promise.resolve({ data: [] as TodayOrderPayment[] }),
  ]);

  const items = (itemsRaw as TodayOrderItem[] | null) ?? [];
  const payments = (paymentsRaw as TodayOrderPayment[] | null) ?? [];

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
  for (const reservation of (upcomingReservationsRaw as
    | { id: string; table_id: string | null; guest_count: number; reserved_at: string }[]
    | null) ?? []) {
    if (!reservation.table_id || tableStates.has(reservation.table_id)) continue;
    tableStates.set(reservation.table_id, {
      status: "reserved",
      guestCount: reservation.guest_count,
      totalCents: 0,
      reservedAt: reservation.reserved_at,
    });
  }

  return { tableStates, orders, items, payments };
}
