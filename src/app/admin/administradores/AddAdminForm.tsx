"use client";

import { useActionState } from "react";
import { addSystemAdmin, type AddAdminState } from "./actions";

const initialState: AddAdminState = { error: null };

export function AddAdminForm() {
  const [state, action, pending] = useActionState(addSystemAdmin, initialState);

  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="flex flex-1 flex-col gap-1 text-sm">
        E-mail
        <input
          type="email"
          name="email"
          required
          placeholder="nome@exemplo.com"
          className="rounded-xl border border-outline-variant bg-surface-container-highest px-4 py-3 text-on-surface outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary transition-all active:scale-95 hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Adicionando…" : "Adicionar"}
      </button>
      {state.error && (
        <p className="text-sm font-semibold text-error sm:basis-full">{state.error}</p>
      )}
    </form>
  );
}
