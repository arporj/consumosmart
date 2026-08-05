"use client";

import { useState, useTransition } from "react";
import { inviteStaff, toggleStaffActive, type InvitableRole } from "./actions";
import { ConfirmModal } from "@/components/ConfirmModal";

type StaffMember = {
  id: string;
  name: string;
  role: string;
  is_active: boolean;
  email: string;
};

const ROLE_OPTIONS: { value: InvitableRole; label: string }[] = [
  { value: "garcom", label: "Garçom" },
  { value: "caixa", label: "Caixa" },
  { value: "cozinha", label: "Cozinha" },
  { value: "bar", label: "Bar" },
  { value: "gestor", label: "Gestor" },
];

const ROLE_LABEL: Record<string, string> = {
  gestor: "Gestor",
  garcom: "Garçom",
  caixa: "Caixa",
  cozinha: "Cozinha",
  bar: "Bar",
};

function InviteStaffInline({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InvitableRole>("garcom");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ emailSent: boolean; link: string | null } | null>(null);

  if (result) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border-2 border-status-free bg-surface-container-low p-4">
        <p className="text-sm text-on-surface-variant">
          {result.emailSent
            ? "Convite enviado por e-mail. Enquanto o sistema não tem domínio próprio, a entrega só é garantida pro e-mail de teste cadastrado no serviço — se não chegar, copie o link abaixo."
            : "Não consegui enviar o e-mail automaticamente. Copie o link abaixo e envie manualmente."}
        </p>
        {result.link && (
          <input
            readOnly
            value={result.link}
            onFocus={(event) => event.target.select()}
            className="rounded-lg border border-outline-variant bg-surface-container-highest px-3 py-2 font-mono text-xs text-on-surface-variant outline-none"
          />
        )}
        <button
          type="button"
          onClick={() => {
            setResult(null);
            setName("");
            setEmail("");
            setOpen(false);
          }}
          className="self-start rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold text-on-surface-variant"
        >
          Fechar
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-dashed border-outline-variant px-4 py-3 text-sm font-bold text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
      >
        <span className="material-symbols-outlined">add</span>
        Convidar funcionário
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-low p-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nome completo"
          className="flex-1 rounded-lg border border-outline-variant bg-surface-container-highest px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
        />
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="E-mail"
          className="flex-1 rounded-lg border border-outline-variant bg-surface-container-highest px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
        />
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as InvitableRole)}
          className="rounded-lg border border-outline-variant bg-surface-container-highest px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              try {
                const res = await inviteStaff(slug, name, email, role);
                setResult(res);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Erro ao convidar funcionário.");
              }
            });
          }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-60"
        >
          {pending ? "Enviando…" : "Convidar"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold text-on-surface-variant"
        >
          Cancelar
        </button>
      </div>
      <ConfirmModal
        open={error !== null}
        title="Não foi possível convidar"
        description={error ?? ""}
        confirmLabel="Ok"
        hideCancel
        onCancel={() => setError(null)}
        onConfirm={() => setError(null)}
      />
    </div>
  );
}

function StaffRow({
  slug,
  member,
  isSelf,
}: {
  slug: string;
  member: StaffMember;
  isSelf: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div
      className={`flex items-center justify-between rounded-xl border border-outline-variant bg-surface-container-highest px-4 py-3 ${!member.is_active ? "opacity-50 grayscale" : ""}`}
    >
      <div className="flex flex-col">
        <span className="text-sm font-bold">{member.name}</span>
        <span className="text-xs text-on-surface-variant">
          {ROLE_LABEL[member.role] ?? member.role} · {member.email}
          {!member.is_active && " · Inativo"}
          {isSelf && " · Você"}
        </span>
      </div>
      {!isSelf && (
        <button
          type="button"
          disabled={pending}
          title={member.is_active ? "Desativar" : "Reativar"}
          onClick={() => setConfirmOpen(true)}
          className="inline-flex p-1 text-on-surface-variant transition-colors hover:text-error disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-base">
            {member.is_active ? "person_off" : "person_check"}
          </span>
        </button>
      )}

      <ConfirmModal
        open={confirmOpen}
        title={member.is_active ? "Desativar funcionário" : "Reativar funcionário"}
        description={
          member.is_active
            ? `Desativar "${member.name}"? A pessoa perde o acesso ao sistema até ser reativada.`
            : `Reativar "${member.name}"? A pessoa volta a ter acesso ao sistema.`
        }
        confirmLabel={member.is_active ? "Desativar" : "Reativar"}
        cancelLabel="Voltar"
        destructive={member.is_active}
        pending={pending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          startTransition(async () => {
            try {
              await toggleStaffActive(slug, member.id, !member.is_active);
              setConfirmOpen(false);
            } catch (err) {
              setConfirmOpen(false);
              setError(err instanceof Error ? err.message : "Erro ao atualizar funcionário.");
            }
          });
        }}
      />
      <ConfirmModal
        open={error !== null}
        title="Não foi possível atualizar"
        description={error ?? ""}
        confirmLabel="Ok"
        hideCancel
        onCancel={() => setError(null)}
        onConfirm={() => setError(null)}
      />
    </div>
  );
}

export function EquipeBoard({
  slug,
  staff,
  currentStaffId,
}: {
  slug: string;
  staff: StaffMember[];
  currentStaffId: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <InviteStaffInline slug={slug} />
      <div className="flex flex-col gap-2">
        {staff.map((member) => (
          <StaffRow
            key={member.id}
            slug={slug}
            member={member}
            isSelf={member.id === currentStaffId}
          />
        ))}
        {staff.length === 0 && (
          <p className="text-sm text-on-surface-variant">Nenhum funcionário cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}
