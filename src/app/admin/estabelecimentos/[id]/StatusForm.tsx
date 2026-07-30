"use client";

import { useActionState } from "react";
import { updateEstablishment, type UpdateEstablishmentState } from "./actions";

const initialState: UpdateEstablishmentState = { error: null, success: false };

const STATUS_OPTIONS = [
  { value: "trial", label: "Em teste" },
  { value: "active", label: "Ativo" },
  { value: "suspended", label: "Suspenso" },
  { value: "canceled", label: "Cancelado" },
];

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

  const selectClass =
    "rounded-xl border border-outline-variant bg-surface-container-highest px-4 py-3 text-on-surface outline-none focus:border-secondary";

  return (
    <form action={action} className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <input type="hidden" name="restaurant_id" value={restaurantId} />

      <label className="flex flex-1 flex-col gap-1 text-sm">
        Status
        <select name="status" defaultValue={currentStatus} className={selectClass}>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-1 flex-col gap-1 text-sm">
        Plano
        <select name="plan_code" defaultValue={currentPlanCode} className={selectClass}>
          {plans.map((plan) => (
            <option key={plan.code} value={plan.code}>
              {plan.name}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar"}
      </button>

      {state.error && <p className="text-sm font-semibold text-error">{state.error}</p>}
      {state.success && <p className="text-sm font-semibold text-status-free">Salvo!</p>}
    </form>
  );
}
