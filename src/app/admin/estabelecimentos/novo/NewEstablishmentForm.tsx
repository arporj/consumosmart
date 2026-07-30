"use client";

import { useActionState, useState } from "react";
import { createEstablishment, type CreateEstablishmentState } from "./actions";

const initialState: CreateEstablishmentState = { error: null };

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function NewEstablishmentForm({
  plans,
}: {
  plans: { code: string; name: string; price_cents: number }[];
}) {
  const [state, action, pending] = useActionState(createEstablishment, initialState);
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const inputClass =
    "rounded-xl border border-outline-variant bg-surface-container-highest px-4 py-3 text-on-surface outline-none focus:border-secondary";

  return (
    <form action={action} className="flex max-w-2xl flex-col gap-6">
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 font-display text-lg font-bold">Estabelecimento</legend>
        <label className="flex flex-col gap-1 text-sm">
          Nome
          <input
            type="text"
            name="name"
            required
            className={inputClass}
            onChange={(event) => {
              if (!slugTouched) setSlug(slugify(event.target.value));
            }}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Slug (usado na URL/QR Code das mesas)
          <input
            type="text"
            name="slug"
            required
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(slugify(event.target.value));
            }}
            className={`${inputClass} font-mono`}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Endereço
            <input type="text" name="address_line" className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Cidade
            <input type="text" name="city" className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Estado (UF)
            <input type="text" name="state" maxLength={2} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            CEP
            <input type="text" name="postal_code" className={inputClass} />
          </label>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 font-display text-lg font-bold">Plano</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {plans.map((plan, index) => (
            <label
              key={plan.code}
              className="flex cursor-pointer flex-col gap-1 rounded-xl border border-outline-variant bg-surface-container-high p-4 has-[:checked]:border-secondary"
            >
              <span className="flex items-center gap-2 font-bold">
                <input type="radio" name="plan_code" value={plan.code} defaultChecked={index === 1} />
                {plan.name}
              </span>
              <span className="font-mono text-sm text-on-surface-variant">
                R$ {(plan.price_cents / 100).toFixed(0)}/mês
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 font-display text-lg font-bold">Responsável</legend>
        <label className="flex flex-col gap-1 text-sm">
          Nome
          <input type="text" name="manager_name" required className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          E-mail (recebe o convite pra criar a própria senha)
          <input type="email" name="manager_email" required className={inputClass} />
        </label>
      </fieldset>

      {state.error && <p className="text-sm font-semibold text-error">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary disabled:opacity-60"
      >
        {pending ? "Criando…" : "Criar estabelecimento"}
      </button>
    </form>
  );
}
