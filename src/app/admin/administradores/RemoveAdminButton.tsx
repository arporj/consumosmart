"use client";

import { useActionState } from "react";
import { removeSystemAdmin, type RemoveAdminState } from "./actions";

const initialState: RemoveAdminState = { error: null };

export function RemoveAdminButton({ userId, email }: { userId: string; email: string }) {
  const [state, action, pending] = useActionState(removeSystemAdmin, initialState);

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!confirm(`Remover o acesso de administrador de ${email}?`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="user_id" value={userId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-bold text-error transition-colors hover:bg-error/10 disabled:opacity-60"
      >
        {pending ? "Removendo…" : "Remover"}
      </button>
      {state.error && <p className="mt-1 text-xs font-semibold text-error">{state.error}</p>}
    </form>
  );
}
