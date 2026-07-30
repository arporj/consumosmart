"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { orderSubtotalCents, orderTotalCents, usePosStore } from "@/store/pos-store";
import { ProductTile } from "@/components/pos/ProductTile";
import { QtyStepper } from "@/components/pos/QtyStepper";
import { formatCentsBRL } from "@/lib/domain/format";

export default function BalcaoPage() {
  const categories = usePosStore((s) => s.categories);
  const products = usePosStore((s) => s.products);
  const balcaoOrderId = usePosStore((s) => s.balcaoOrderId);
  const order = usePosStore((s) => s.orders[s.balcaoOrderId]);
  const toggleService = usePosStore((s) => s.toggleServiceCharge);

  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id ?? "");

  const visibleProducts = useMemo(
    () => products.filter((p) => p.categoryId === activeCategory && p.isActive),
    [products, activeCategory]
  );

  const subtotal = orderSubtotalCents(order);
  const total = orderTotalCents(order);
  const serviceIfEnabled = Math.round(subtotal * order.serviceChargeRate);

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_340px]">
      <div>
        <h1 className="text-2xl font-extrabold">Venda Balcão</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Pedido rápido, sem vincular a uma mesa.
        </p>

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
              action={<QtyStepper orderId={balcaoOrderId} productId={product.id} />}
            />
          ))}
        </div>
      </div>

      <aside className="h-fit rounded-2xl border border-outline-variant bg-paper p-4 text-paper-ink lg:sticky lg:top-6">
        <div className="mb-3 text-center font-mono text-xs font-extrabold uppercase tracking-wide">
          Comanda · Balcão
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

        <label className="mt-1 flex items-center justify-between gap-2 font-mono text-xs">
          <span className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={order.serviceChargeEnabled}
              onChange={() => toggleService(balcaoOrderId)}
              className="h-3.5 w-3.5 accent-primary"
            />
            Serviço (10%)
          </span>
          <span className={order.serviceChargeEnabled ? "" : "opacity-40 line-through"}>
            {formatCentsBRL(serviceIfEnabled)}
          </span>
        </label>

        <div className="mt-2 flex justify-between border-t border-paper-ink/30 pt-2 font-mono text-base font-extrabold">
          <span>Total</span>
          <span>{formatCentsBRL(total)}</span>
        </div>

        <Link
          href={`/fechamento?orderId=${balcaoOrderId}`}
          aria-disabled={order.items.length === 0}
          className={`mt-4 block rounded-lg py-2.5 text-center text-sm font-extrabold ${
            order.items.length === 0
              ? "pointer-events-none bg-paper-ink/20 text-paper-ink/40"
              : "bg-primary text-on-primary"
          }`}
        >
          Ir para fechamento
        </Link>
      </aside>
    </div>
  );
}
