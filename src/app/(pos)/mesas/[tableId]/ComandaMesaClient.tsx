"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  orderDiscountCents,
  orderSubtotalCents,
  orderTotalCents,
  usePosStore,
} from "@/store/pos-store";
import { digitsToCents, formatCentsBRL } from "@/lib/domain/format";
import { getTableStatus } from "@/lib/domain/table-status";
import { ProductTile } from "@/components/pos/ProductTile";
import { QtyStepper } from "@/components/pos/QtyStepper";

export function ComandaMesaClient({ tableId }: { tableId: string }) {
  const tables = usePosStore((s) => s.tables);
  const table = tables.find((t) => t.id === tableId);
  const otherTables = tables.filter((t) => t.id !== tableId);
  const orders = usePosStore((s) => s.orders);
  const categories = usePosStore((s) => s.categories);
  const products = usePosStore((s) => s.products);

  const openTableOrder = usePosStore((s) => s.openTableOrder);
  const toggleService = usePosStore((s) => s.toggleServiceCharge);
  const setDiscount = usePosStore((s) => s.setDiscount);
  const setGuestCount = usePosStore((s) => s.setGuestCount);
  const requestBill = usePosStore((s) => s.requestBill);
  const transferTable = usePosStore((s) => s.transferTable);
  const mergeTables = usePosStore((s) => s.mergeTables);

  const [orderId, setOrderId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id ?? "");
  const [showTransfer, setShowTransfer] = useState(false);
  const [showMerge, setShowMerge] = useState(false);

  useEffect(() => {
    // Sincroniza com o store (sistema externo): garante que a mesa tenha uma
    // comanda aberta assim que a tela monta ou a mesa muda.
    if (table) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOrderId(openTableOrder(tableId));
    }
  }, [tableId, table, openTableOrder]);

  const order = orderId ? orders[orderId] : null;

  const visibleProducts = useMemo(
    () => products.filter((p) => p.categoryId === activeCategory && p.isActive),
    [products, activeCategory]
  );

  if (!table) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center text-sm text-on-surface-variant">
        Mesa não encontrada.{" "}
        <Link href="/mesas" className="font-bold text-secondary underline">
          Voltar ao mapa
        </Link>
      </div>
    );
  }

  if (!order) {
    return <div className="px-6 py-10 text-sm text-on-surface-variant">Abrindo comanda…</div>;
  }

  const subtotal = orderSubtotalCents(order);
  const discount = orderDiscountCents(order);
  const total = orderTotalCents(order);
  const status = getTableStatus(table, orders);

  const freeTables = otherTables.filter((t) => getTableStatus(t, orders) === "free");
  const occupiedTables = otherTables.filter((t) => {
    const s = getTableStatus(t, orders);
    return s === "occupied" || s === "waiting";
  });

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_360px]">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/mesas"
            className="rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-bold text-on-surface-variant"
          >
            ‹ Mesas
          </Link>
          <h1 className="text-2xl font-extrabold">Mesa {table.label}</h1>
          {status === "waiting" ? (
            <span className="rounded-full bg-status-waiting/20 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-status-waiting">
              Aguardando conta
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-on-surface-variant">Pessoas</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setGuestCount(order.id, order.guestCount - 1)}
              aria-label="Diminuir número de pessoas"
              className="h-7 w-7 rounded-lg bg-surface-container-high text-sm font-extrabold"
            >
              –
            </button>
            <span className="w-4 text-center font-mono text-sm font-extrabold">
              {order.guestCount}
            </span>
            <button
              type="button"
              onClick={() => setGuestCount(order.id, order.guestCount + 1)}
              aria-label="Aumentar número de pessoas"
              className="h-7 w-7 rounded-lg bg-surface-container-high text-sm font-extrabold"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowTransfer((v) => !v);
              setShowMerge(false);
            }}
            className="rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:border-secondary"
          >
            Transferir mesa
          </button>
          <button
            type="button"
            onClick={() => {
              setShowMerge((v) => !v);
              setShowTransfer(false);
            }}
            className="rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:border-secondary"
          >
            Juntar comanda
          </button>
        </div>

        {showTransfer ? (
          <div className="mt-3 flex flex-wrap gap-2 rounded-xl border border-outline-variant bg-surface-container-high p-3">
            {freeTables.length === 0 ? (
              <span className="text-xs text-on-surface-variant">
                Nenhuma mesa livre no momento.
              </span>
            ) : (
              freeTables.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => transferTable(tableId, t.id)}
                  className="rounded-lg bg-surface-container-highest px-3 py-1.5 text-xs font-bold"
                >
                  → Mesa {t.label}
                </button>
              ))
            )}
          </div>
        ) : null}

        {showMerge ? (
          <div className="mt-3 flex flex-wrap gap-2 rounded-xl border border-outline-variant bg-surface-container-high p-3">
            {occupiedTables.length === 0 ? (
              <span className="text-xs text-on-surface-variant">
                Nenhuma outra mesa ocupada pra juntar.
              </span>
            ) : (
              occupiedTables.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    mergeTables(tableId, t.id);
                    setShowMerge(false);
                  }}
                  className="rounded-lg bg-surface-container-highest px-3 py-1.5 text-xs font-bold"
                >
                  + Mesa {t.label}
                </button>
              ))
            )}
          </div>
        ) : null}

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className={`flex-none whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold ${
                category.id === activeCategory
                  ? "bg-primary text-on-primary"
                  : "border border-outline-variant bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {visibleProducts.map((product) => (
            <ProductTile
              key={product.id}
              product={product}
              action={<QtyStepper orderId={order.id} productId={product.id} />}
            />
          ))}
        </div>
      </div>

      <aside className="h-fit rounded-2xl border border-outline-variant bg-paper p-4 text-paper-ink lg:sticky lg:top-6">
        <div className="mb-3 text-center font-mono text-xs font-extrabold uppercase tracking-wide">
          Comanda · Mesa {table.label}
        </div>

        {order.items.length === 0 ? (
          <p className="py-6 text-center text-xs text-paper-ink/60">
            Nenhum item lançado ainda.
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {order.items.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              if (!product) return null;
              return (
                <div
                  key={item.productId}
                  className="flex justify-between border-b border-dashed border-paper-line py-1 font-mono text-[11.5px]"
                >
                  <span>
                    {item.quantity}× {product.name}
                  </span>
                  <span>{formatCentsBRL(item.quantity * item.unitPriceCents)}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-3 flex justify-between font-mono text-xs">
          <span>Subtotal</span>
          <span>{formatCentsBRL(subtotal)}</span>
        </div>

        <div className="mt-1 flex items-center justify-between gap-2 font-mono text-xs">
          <span>Desconto</span>
          <input
            value={discount === 0 ? "" : formatCentsBRL(discount)}
            onChange={(e) => setDiscount(order.id, digitsToCents(e.target.value))}
            placeholder="0,00"
            inputMode="decimal"
            className="w-20 rounded-md border border-paper-line bg-white px-2 py-1 text-right font-mono text-xs text-paper-ink"
          />
        </div>

        <label className="mt-1 flex items-center justify-between gap-2 font-mono text-xs">
          <span className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={order.serviceChargeEnabled}
              onChange={() => toggleService(order.id)}
              className="h-3.5 w-3.5 accent-primary"
            />
            Serviço (10%)
          </span>
          <span className={order.serviceChargeEnabled ? "" : "opacity-40 line-through"}>
            {formatCentsBRL(Math.round((subtotal - discount) * order.serviceChargeRate))}
          </span>
        </label>

        <div className="mt-2 flex justify-between border-t border-paper-ink/30 pt-2 font-mono text-base font-extrabold">
          <span>Total</span>
          <span>{formatCentsBRL(total)}</span>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => requestBill(order.id)}
            disabled={order.items.length === 0 || status === "waiting"}
            className="rounded-lg border border-tertiary py-2.5 text-center text-sm font-extrabold text-tertiary disabled:opacity-40"
          >
            Solicitar fechamento
          </button>
          <Link
            href={`/fechamento?orderId=${order.id}`}
            className={`block rounded-lg py-2.5 text-center text-sm font-extrabold ${
              order.items.length === 0
                ? "pointer-events-none bg-paper-ink/20 text-paper-ink/40"
                : "bg-primary text-on-primary"
            }`}
          >
            Ir para fechamento
          </Link>
        </div>
      </aside>
    </div>
  );
}
