"use client";

import { useActionState } from "react";
import { setPassword, type SetPasswordState } from "./actions";
import { PasswordField } from "@/components/auth/PasswordField";

const initialState: SetPasswordState = { error: null };

export function SetPasswordForm() {
  const [state, action, pending] = useActionState(setPassword, initialState);

  return (
    <form
      action={action}
      className="mx-auto flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-outline-variant bg-surface-container-low p-6 sm:p-8"
    >
      <PasswordField label="Escolha uma senha" name="password" minLength={6} autoComplete="new-password" />

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
