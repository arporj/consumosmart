"use client";

import { useActionState, useState } from "react";
import { updatePlan, type UpdatePlanState } from "./actions";
import type { Plan } from "@/lib/plans";

const initialState: UpdatePlanState = { error: null, success: false };

const FEATURE_CHECKBOXES: { field: keyof Plan; label: string }[] = [
  { field: "self_service_ordering", label: "Autoatendimento (pedido pelo celular)" },
  { field: "kds", label: "Telas de produção (Cozinha e Bar)" },
  { field: "reservations", label: "Reserva de mesa" },
  { field: "nfce_enabled", label: "Nota fiscal (NFC-e)" },
  { field: "stock_advanced", label: "Estoque avançado + ficha técnica" },
  { field: "financial_entries", label: "Financeiro (contas a pagar/receber)" },
  { field: "suppliers", label: "Fornecedores" },
  { field: "hr_commissions", label: "Comissões da equipe" },
];

export function PlanEditForm({ plan }: { plan: Plan }) {
  const [state, action, pending] = useActionState(updatePlan, initialState);
  const [nfceEnabled, setNfceEnabled] = useState(plan.nfce_enabled);

  const inputClass =
    "rounded-xl border border-outline-variant bg-surface-container-highest px-4 py-2.5 text-on-surface outline-none focus:border-secondary";

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-surface-container-low p-6"
    >
      <input type="hidden" name="plan_id" value={plan.id} />

      <div>
        <h2 className="font-display text-xl font-bold">{plan.name}</h2>
        <label className="mt-3 flex flex-col gap-1 text-sm">
          Preço mensal (R$)
          <input
            type="number"
            name="price_reais"
            step="0.01"
            min="0"
            defaultValue={(plan.price_cents / 100).toFixed(2)}
            className={`${inputClass} font-mono`}
          />
        </label>
      </div>

      <fieldset className="flex flex-col gap-2 text-sm">
        <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
          Funcionalidades
        </legend>
        {FEATURE_CHECKBOXES.map((item) => (
          <label key={item.field} className="flex items-center gap-2">
            <input
              type="checkbox"
              name={item.field}
              defaultChecked={Boolean(plan[item.field])}
              onChange={
                item.field === "nfce_enabled"
                  ? (event) => setNfceEnabled(event.target.checked)
                  : undefined
              }
              className="h-4 w-4 rounded border-outline-variant accent-primary"
            />
            {item.label}
          </label>
        ))}

        <label
          className={`mt-1 flex flex-col gap-1 pl-6 text-xs ${
            nfceEnabled ? "text-on-surface-variant" : "text-outline-variant"
          }`}
        >
          Limite mensal de notas (vazio = ilimitado)
          <input
            type="number"
            name="nfce_monthly_limit"
            min="0"
            disabled={!nfceEnabled}
            defaultValue={plan.nfce_monthly_limit ?? ""}
            className={`${inputClass} w-32 disabled:opacity-50`}
          />
        </label>
      </fieldset>

      {state.error && <p className="text-sm font-semibold text-error">{state.error}</p>}
      {state.success && <p className="text-sm font-semibold text-status-free">Salvo!</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary transition-transform hover:brightness-110 active:scale-95 disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar"}
      </button>
    </form>
  );
}
