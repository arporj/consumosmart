"use client";

import { useActionState } from "react";
import { setPassword, type SetPasswordState } from "./actions";

const initialState: SetPasswordState = { error: null };

export function SetPasswordForm() {
  const [state, action, pending] = useActionState(setPassword, initialState);

  return (
    <form
      action={action}
      className="mx-auto flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-outline-variant bg-surface-container-low p-6 sm:p-8"
    >
      <label className="flex flex-col gap-1 text-sm">
        Escolha uma senha
        <input
          type="password"
          name="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="rounded-xl border border-outline-variant bg-surface-container-highest px-4 py-3 text-on-surface outline-none focus:border-secondary"
        />
      </label>

      {state.error && <p className="text-sm font-semibold text-error">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-on-primary disabled:opacity-60"
      >
        {pending ? "Aguarde…" : "Continuar"}
      </button>
    </form>
  );
}
