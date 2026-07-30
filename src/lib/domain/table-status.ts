import type { Order, Table } from "./types";

export type TableStatus = "free" | "occupied" | "waiting" | "reserved";

export function getTableStatus(
  table: Table,
  orders: Record<string, Order>
): TableStatus {
  if (table.orderId) {
    const order = orders[table.orderId];
    if (order?.status === "awaiting_payment") return "waiting";
    return "occupied";
  }
  if (table.reservationNote) return "reserved";
  return "free";
}

export function minutesSince(iso: string, now: Date): number {
  return Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60000));
}

export function formatElapsed(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h${String(rest).padStart(2, "0")}`;
}
