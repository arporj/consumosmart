"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  orderDiscountCents,
  orderSubtotalCents,
  orderTotalCents,
  usePosStore,
} from "@/store/pos-store";
import { digitsToCents, formatCentsBRL } from "@/lib/domain/format";
import type { PaymentMethod } from "@/lib/domain/types";

const GUEST_OPTIONS = [1, 2, 3, 4, 5, 6];

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: "pix", label: "Pix", icon: "💠" },
  { value: "cartao", label: "Cartão", icon: "💳" },
  { value: "dinheiro", label: "Dinheiro", icon: "💵" },
];

export function FechamentoClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const balcaoOrderId = usePosStore((s) => s.balcaoOrderId);
  const resolvedOrderId = searchParams.get("orderId") ?? balcaoOrderId;

  const order = usePosStore((s) => s.orders[resolvedOrderId]);
  const products = usePosStore((s) => s.products);
  const tables = usePosStore((s) => s.tables);
  const toggleService = usePosStore((s) => s.toggleServiceCharge);
  const addPayment = usePosStore((s) => s.addPayment);
  const closeOrder = usePosStore((s) => s.closeOrder);
  const startNewBalcaoOrder = usePosStore((s) => s.startNewBalcaoOrder);

  const [splitMode, setSplitMode] = useState<"pessoas" | "customizado">("pessoas");
  const [guestCount, setGuestCount] = useState(1);
  const [customAmounts, setCustomAmounts] = useState<number[]>([0]);
  const [method, setMethod] = useState<PaymentMethod>("pix");
  const [closedTableLabel, setClosedTableLabel] = useState<string | null | undefined>(undefined);

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-sm text-on-surface-variant">Comanda não encontrada.</p>
      </div>
    );
  }

  const subtotal = orderSubtotalCents(order);
  const discount = orderDiscountCents(order);
  const total = orderTotalCents(order);
  const customSum = customAmounts.reduce((a, b) => a + b, 0);
  const customRemaining = total - customSum;

  function updateCustomAmount(index: number, cents: number) {
    setCustomAmounts((prev) => prev.map((v, i) => (i === index ? cents : v)));
  }

  function handleClose() {
    const table = tables.find((t) => t.orderId === order.id);
    addPayment(order.id, method, splitMode === "customizado" ? customSum : total);
    closeOrder(order.id);
    setClosedTableLabel(table ? table.label : null);
  }

  if (order.status === "closed") {
    const wasTable = closedTableLabel !== undefined ? closedTableLabel !== null : order.type === "mesa";
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-3xl text-on-secondary">
          ✓
        </div>
        <h1 className="text-xl font-extrabold">Conta fechada</h1>
        <p className="text-sm text-on-surface-variant">
          Pagamento de R$ {formatCentsBRL(total)} registrado via{" "}
          {PAYMENT_OPTIONS.find((p) => p.value === method)?.label ?? method}.
        </p>
        <button
          type="button"
          onClick={() => {
            if (wasTable) {
              router.push("/mesas");
            } else {
              startNewBalcaoOrder();
              router.push("/balcao");
            }
          }}
          className="mt-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-extrabold text-on-primary"
        >
          {wasTable
            ? `Voltar ao mapa${closedTableLabel ? ` (Mesa ${closedTableLabel} liberada)` : ""}`
            : "Nova venda"}
        </button>
      </div>
    );
  }

  if (order.items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-sm text-on-surface-variant">
          Nenhum item na comanda ainda.{" "}
          <a href="/balcao" className="font-bold text-secondary underline">
            Voltar pro balcão
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-extrabold">Fechamento</h1>
      <p className="mt-1 text-sm text-on-surface-variant">
        Confira, divida (se precisar) e feche a conta.
      </p>

      <div className="mt-5 rounded-2xl bg-paper p-4 text-paper-ink">
        <div className="text-center font-mono text-xs font-extrabold uppercase tracking-wide">
          Fechamento · {order.type === "mesa" ? "Mesa" : "Balcão"}
        </div>

        <div className="mt-3 flex flex-col gap-1">
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

        <div className="mt-3 flex justify-between font-mono text-xs">
          <span>Subtotal</span>
          <span>{formatCentsBRL(subtotal)}</span>
        </div>

        {discount > 0 ? (
          <div className="flex justify-between font-mono text-xs">
            <span>Desconto</span>
            <span>−{formatCentsBRL(discount)}</span>
          </div>
        ) : null}

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

        <div className="mt-2 flex justify-between border-t border-paper-ink/30 pt-2 font-mono text-lg font-extrabold">
          <span>Total</span>
          <span>{formatCentsBRL(total)}</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {GUEST_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                setSplitMode("pessoas");
                setGuestCount(n);
              }}
              className={`rounded-lg py-2.5 text-xs font-bold ${
                splitMode === "pessoas" && guestCount === n
                  ? "bg-tertiary text-on-tertiary"
                  : "border border-paper-line bg-white/60 text-paper-ink"
              }`}
            >
              {n}p · R$ {formatCentsBRL(Math.round(total / n))}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSplitMode("customizado")}
            className={`col-span-2 rounded-lg py-2.5 text-xs font-bold ${
              splitMode === "customizado"
                ? "bg-tertiary text-on-tertiary"
                : "border border-paper-line bg-white/60 text-paper-ink"
            }`}
          >
            Customizado
          </button>
        </div>

        {splitMode === "customizado" ? (
          <div className="mt-3 border-t border-dashed border-paper-line pt-3">
            <div className="mb-2 text-[9.5px] font-bold uppercase tracking-wide text-paper-ink/70">
              Valores a cobrar — adicione quantos precisar
            </div>
            <div className="flex flex-col gap-2">
              {customAmounts.map((amount, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={amount === 0 ? "" : formatCentsBRL(amount)}
                    onChange={(e) => updateCustomAmount(index, digitsToCents(e.target.value))}
                    placeholder="0,00"
                    inputMode="decimal"
                    className="min-w-0 flex-1 rounded-md border-[1.5px] border-primary bg-white px-2.5 py-2 font-mono text-sm text-paper-ink"
                  />
                  {index === customAmounts.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCustomAmounts((prev) => [...prev, 0])}
                      className="w-8 flex-none rounded-md bg-secondary text-base font-extrabold text-on-secondary"
                      aria-label="Adicionar outro valor"
                    >
                      +
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
            <div
              className={`mt-2 font-mono text-[11px] ${
                customRemaining <= 0 ? "font-extrabold text-tertiary" : "text-paper-ink/70"
              }`}
            >
              Somado: R$ {formatCentsBRL(customSum)} de R$ {formatCentsBRL(total)}
              {customRemaining === 0
                ? " · completo"
                : customRemaining > 0
                ? ` · faltam R$ ${formatCentsBRL(customRemaining)}`
                : ` · R$ ${formatCentsBRL(-customRemaining)} a mais`}
            </div>
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-3 gap-2">
          {PAYMENT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setMethod(option.value)}
              className={`rounded-lg border-2 py-3 text-center text-xs font-bold ${
                method === option.value
                  ? "border-secondary bg-secondary/15 text-paper-ink"
                  : "border-paper-line bg-white/60 text-paper-ink"
              }`}
            >
              <div className="text-lg">{option.icon}</div>
              {option.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="mt-4 w-full rounded-lg bg-primary py-3 text-sm font-extrabold text-on-primary"
        >
          Fechar Conta
        </button>
      </div>
    </div>
  );
}
