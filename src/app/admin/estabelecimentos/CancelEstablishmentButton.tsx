"use client";

import { useState, useTransition } from "react";
import { cancelEstablishment } from "./actions";
import { ConfirmModal } from "@/components/ConfirmModal";

export function CancelEstablishmentButton({
  restaurantId,
  restaurantName,
  disabled,
}: {
  restaurantId: string;
  restaurantName: string;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <button
        type="button"
        disabled={disabled || pending}
        aria-label={`Cancelar ${restaurantName}`}
        title={disabled ? "Já está cancelado" : "Cancelar estabelecimento"}
        onClick={() => setConfirmOpen(true)}
        className="inline-flex p-1 text-on-surface-variant transition-colors hover:text-error disabled:opacity-40 disabled:hover:text-on-surface-variant"
      >
        <span className="material-symbols-outlined">{pending ? "hourglass_empty" : "delete"}</span>
      </button>

      <ConfirmModal
        open={confirmOpen}
        title="Cancelar estabelecimento"
        description={`Cancelar "${restaurantName}"? Ele deixa de aparecer como ativo, mas os dados (staff, histórico, etc.) continuam preservados — dá pra reverter mudando o status de volta na tela de detalhe.`}
        confirmLabel="Cancelar estabelecimento"
        cancelLabel="Voltar"
        destructive
        pending={pending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          startTransition(async () => {
            try {
              await cancelEstablishment(restaurantId);
              setConfirmOpen(false);
            } catch (err) {
              setConfirmOpen(false);
              setError(err instanceof Error ? err.message : "Erro ao cancelar estabelecimento.");
            }
          });
        }}
      />

      <ConfirmModal
        open={error !== null}
        title="Não foi possível cancelar"
        description={error ?? ""}
        confirmLabel="Ok"
        hideCancel
        onCancel={() => setError(null)}
        onConfirm={() => setError(null)}
      />
    </>
  );
}
