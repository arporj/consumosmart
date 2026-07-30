"use client";

import { usePosStore } from "@/store/pos-store";

export function QtyStepper({ orderId, productId }: { orderId: string; productId: string }) {
  const quantity = usePosStore(
    (s) => s.orders[orderId]?.items.find((i) => i.productId === productId)?.quantity ?? 0
  );
  const increment = usePosStore((s) => s.incrementItem);
  const decrement = usePosStore((s) => s.decrementItem);

  if (quantity <= 0) {
    return (
      <button
        type="button"
        onClick={() => increment(orderId, productId)}
        className="h-8 w-full rounded-lg bg-primary text-base font-extrabold text-on-primary active:scale-95"
      >
        +
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={() => decrement(orderId, productId)}
        className="h-8 w-8 flex-none rounded-lg bg-primary text-base font-extrabold text-on-primary active:scale-95"
        aria-label="Diminuir quantidade"
      >
        –
      </button>
      <span className="font-mono text-sm font-extrabold tabular-nums">{quantity}</span>
      <button
        type="button"
        onClick={() => increment(orderId, productId)}
        className="h-8 w-8 flex-none rounded-lg bg-primary text-base font-extrabold text-on-primary active:scale-95"
        aria-label="Aumentar quantidade"
      >
        +
      </button>
    </div>
  );
}
