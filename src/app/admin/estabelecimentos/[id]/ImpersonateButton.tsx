"use client";

import { useState, useTransition } from "react";
import { startImpersonationAction } from "./impersonate-action";
import { ConfirmModal } from "@/components/ConfirmModal";

export function ImpersonateButton({
  staffUserId,
  restaurantId,
  restaurantSlug,
  memberName,
}: {
  staffUserId: string;
  restaurantId: string;
  restaurantSlug: string;
  memberName: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <button
        type="button"
        disabled={pending}
        title={`Ver como ${memberName}`}
        onClick={() => {
          startTransition(async () => {
            try {
              await startImpersonationAction(staffUserId, restaurantId, restaurantSlug);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Erro ao iniciar simulação.");
            }
          });
        }}
        className="inline-flex p-1 text-on-surface-variant transition-colors hover:text-secondary disabled:opacity-40"
      >
        <span className="material-symbols-outlined text-base">visibility</span>
      </button>

      <ConfirmModal
        open={error !== null}
        title="Não foi possível iniciar a simulação"
        description={error ?? ""}
        confirmLabel="Ok"
        hideCancel
        onCancel={() => setError(null)}
        onConfirm={() => setError(null)}
      />
    </>
  );
}
