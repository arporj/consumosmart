"use client";

import { useActionState, useRef, useState } from "react";
import { removeSystemAdmin, type RemoveAdminState } from "./actions";
import { ConfirmModal } from "@/components/ConfirmModal";

const initialState: RemoveAdminState = { error: null };

export function RemoveAdminButton({ userId, email }: { userId: string; email: string }) {
  const [state, action, pending] = useActionState(removeSystemAdmin, initialState);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <form ref={formRef} action={action}>
        <input type="hidden" name="user_id" value={userId} />
        <button
          type="button"
          disabled={pending}
          onClick={() => setConfirmOpen(true)}
          className="rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-bold text-error transition-colors hover:bg-error/10 disabled:opacity-60"
        >
          {pending ? "Removendo…" : "Remover"}
        </button>
        {state.error && <p className="mt-1 text-xs font-semibold text-error">{state.error}</p>}
      </form>

      <ConfirmModal
        open={confirmOpen}
        title="Remover administrador"
        description={`Remover o acesso de administrador de ${email}? Essa pessoa perde acesso à Área de Gestão do Sistema imediatamente.`}
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        destructive
        pending={pending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          formRef.current?.requestSubmit();
        }}
      />
    </>
  );
}
