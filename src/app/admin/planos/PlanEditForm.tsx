"use client";

import { useActionState, useState } from "react";
import { updatePlan, type UpdatePlanState } from "./actions";
import type { Plan } from "@/lib/plans";

const initialState: UpdatePlanState = { error: null, success: false };

const ADMIN_TAGLINES: Record<string, string> = {
  starter: "Ideal para pequenos bares e cafeterias.",
  essencial: "Para negócios em crescimento e escala.",
  pro: "Foco absoluto em performance e lucro.",
};

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
  const highlight = plan.code === "essencial";

  const inputClass =
    "w-full rounded-xl border border-outline-variant bg-surface-container-highest px-4 py-2.5 text-on-surface outline-none focus:border-transparent focus:ring-2 focus:ring-primary";

  return (
    <form
      action={action}
      className={`relative flex flex-col gap-6 rounded-2xl border bg-surface-container p-6 shadow-xl transition-colors ${
        highlight
          ? "z-10 scale-100 border-2 border-primary/40 shadow-2xl lg:scale-105"
          : "border-outline-variant hover:border-primary/50"
      }`}
    >
      <input type="hidden" name="plan_id" value={plan.id} />

      {highlight && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-secondary px-4 py-1 text-[10px] font-black tracking-widest text-on-secondary uppercase shadow-lg">
          Mais Popular
        </span>
      )}

      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-bold text-secondary">{plan.name}</h2>
        <p className="text-xs text-on-surface-variant">{ADMIN_TAGLINES[plan.code] ?? ""}</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold tracking-wider text-on-surface-variant uppercase">
          Preço mensal (R$)
        </label>
        <div className="relative">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 font-semibold text-on-surface-variant">
            R$
          </span>
          <input
            type="number"
            name="price_reais"
            step="0.01"
            min="0"
            defaultValue={(plan.price_cents / 100).toFixed(2)}
            className={`${inputClass} pl-12 font-bold`}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 py-2">
        <p className="text-xs font-bold tracking-wider text-on-surface-variant uppercase">
          Recursos Inclusos
        </p>
        <div className="space-y-3">
          {FEATURE_CHECKBOXES.map((item) => (
            <label key={item.field} className="flex items-center gap-3">
              <input
                type="checkbox"
                name={item.field}
                defaultChecked={Boolean(plan[item.field])}
                onChange={
                  item.field === "nfce_enabled"
                    ? (event) => setNfceEnabled(event.target.checked)
                    : undefined
                }
                className="h-5 w-5 rounded border-outline-variant bg-surface-container-low text-primary accent-primary"
              />
              <span className="text-sm text-on-surface">{item.label}</span>
            </label>
          ))}

          <div className={`ml-8 ${nfceEnabled ? "" : "opacity-50"}`}>
            <input
              type="number"
              name="nfce_monthly_limit"
              min="0"
              disabled={!nfceEnabled}
              defaultValue={plan.nfce_monthly_limit ?? ""}
              placeholder="Ex: 50"
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-1 text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
            <p className="mt-1 text-[10px] text-on-surface-variant italic">vazio = ilimitado</p>
          </div>
        </div>
      </div>

      {state.error && <p className="text-sm font-semibold text-error">{state.error}</p>}
      {state.success && <p className="text-sm font-semibold text-status-free">Salvo!</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-auto w-full rounded-xl bg-primary py-3 font-black text-on-primary shadow-lg shadow-primary/20 transition-all active:scale-[0.98] hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar Alterações"}
      </button>
    </form>
  );
}
