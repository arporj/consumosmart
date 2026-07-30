"use client";

import { useActionState, useState } from "react";
import { updateEstablishment, type UpdateEstablishmentState } from "./actions";

const initialState: UpdateEstablishmentState = { error: null, success: false };

const STATUS_OPTIONS = [
  { value: "trial", label: "Em teste" },
  { value: "active", label: "Ativo" },
  { value: "suspended", label: "Suspenso" },
  { value: "canceled", label: "Cancelado" },
];

const STATUS_DOT: Record<string, string> = {
  trial: "bg-status-waiting",
  active: "bg-status-free",
  suspended: "bg-status-occupied",
  canceled: "bg-outline-variant",
};

export function StatusForm({
  restaurantId,
  currentStatus,
  currentPlanCode,
  plans,
}: {
  restaurantId: string;
  currentStatus: string;
  currentPlanCode: string;
  plans: { code: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(updateEstablishment, initialState);
  const [status, setStatus] = useState(currentStatus);

  const selectClass =
    "w-full appearance-none rounded-xl border border-outline-variant bg-surface-container-highest py-3 pr-4 text-on-surface outline-none focus:border-transparent focus:ring-2 focus:ring-primary";

  return (
    <form action={action} className="grid grid-cols-1 items-end gap-6 md:grid-cols-12">
      <input type="hidden" name="restaurant_id" value={restaurantId} />

      <div className="md:col-span-4">
        <label className="mb-3 block text-xs font-bold tracking-widest text-on-surface-variant uppercase">
          Status do Estabelecimento
        </label>
        <div className="relative">
          <span
            className={`pointer-events-none absolute top-1/2 left-4 h-2 w-2 -translate-y-1/2 rounded-full ${STATUS_DOT[status]}`}
          />
          <select
            name="status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className={`${selectClass} pl-8`}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-on-surface-variant">
            expand_more
          </span>
        </div>
      </div>

      <div className="md:col-span-5">
        <label className="mb-3 block text-xs font-bold tracking-widest text-on-surface-variant uppercase">
          Plano Atual
        </label>
        <div className="relative">
          <select name="plan_code" defaultValue={currentPlanCode} className={`${selectClass} px-4`}>
            {plans.map((plan) => (
              <option key={plan.code} value={plan.code}>
                {plan.name}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-on-surface-variant">
            expand_more
          </span>
        </div>
      </div>

      <div className="md:col-span-3">
        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-display font-extrabold text-on-primary shadow-lg shadow-primary/20 transition-all active:scale-[0.98] hover:brightness-110 disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-xl">save</span>
          {pending ? "Salvando…" : "Salvar"}
        </button>
      </div>

      {state.error && (
        <p className="text-sm font-semibold text-error md:col-span-12">{state.error}</p>
      )}
      {state.success && (
        <p className="text-sm font-semibold text-status-free md:col-span-12">Salvo!</p>
      )}
    </form>
  );
}
