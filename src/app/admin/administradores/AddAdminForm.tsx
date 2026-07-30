"use client";

import { useActionState, useState } from "react";
import { addSystemAdmin, type AddAdminState } from "./actions";

const initialState: AddAdminState = { error: null };

export function AddAdminForm() {
  const [state, action, pending] = useActionState(addSystemAdmin, initialState);
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-col gap-3">
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

      {!state.error && state.inviteLink && (
        <div className="flex flex-col gap-2 rounded-xl border border-status-free bg-surface-container-high p-4">
          <p className="text-xs text-on-surface-variant">
            Administrador adicionado. O e-mail de convite não foi enviado automaticamente (limite
            de envio do sistema) — copie o link e envie manualmente:
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value={state.inviteLink}
              onFocus={(event) => event.target.select()}
              className="flex-1 rounded-lg border border-outline-variant bg-surface-container-highest px-3 py-2 font-mono text-xs text-on-surface-variant outline-none"
            />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(state.inviteLink!);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-on-primary hover:brightness-110"
            >
              {copied ? "Copiado!" : "Copiar link"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
