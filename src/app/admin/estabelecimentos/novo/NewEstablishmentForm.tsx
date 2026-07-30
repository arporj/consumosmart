"use client";

import { useActionState, useState } from "react";
import { createEstablishment, type CreateEstablishmentState } from "./actions";
import { formatPlanPrice, planFeatureList, type Plan } from "@/lib/plans";

const initialState: CreateEstablishmentState = { error: null };

const STATES = ["SP", "RJ", "MG", "PR", "SC", "RS", "BA", "DF"];

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-high">
        <span className="material-symbols-outlined text-sm text-primary">{icon}</span>
      </div>
      <h3 className="font-display text-xl font-bold">{title}</h3>
    </div>
  );
}

export function NewEstablishmentForm({ plans }: { plans: Plan[] }) {
  const [state, action, pending] = useActionState(createEstablishment, initialState);
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-outline-variant bg-surface-container-highest px-4 py-3 text-on-surface outline-none focus:border-transparent focus:ring-2 focus:ring-primary";

  return (
    <form action={action} className="flex flex-col gap-6">
      <section className="rounded-2xl border border-outline-variant bg-surface-container-low p-6 sm:p-8">
        <SectionHeader icon="storefront" title="Informações Básicas" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <label className="col-span-full flex flex-col gap-2 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
            Nome do Estabelecimento
            <input
              type="text"
              name="name"
              required
              placeholder="Ex: Bar do Porto Gastronomia"
              className={`${inputClass} normal-case`}
              onChange={(event) => {
                if (!slugTouched) setSlug(slugify(event.target.value));
              }}
            />
          </label>

          <div className="col-span-full flex flex-col gap-2 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
            Slug Personalizado
            <div className="flex items-center">
              <span className="rounded-l-xl border border-r-0 border-outline-variant bg-surface-container-high px-4 py-3 font-mono text-sm text-on-surface-variant normal-case">
                consumosmart.com.br/
              </span>
              <input
                type="text"
                name="slug"
                required
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(slugify(event.target.value));
                }}
                placeholder="meu-estabelecimento"
                className={`${inputClass} rounded-l-none font-mono normal-case`}
              />
            </div>
            <p className="font-mono text-xs font-normal text-on-surface-variant/60 normal-case">
              usado na URL/QR Code das mesas
            </p>
          </div>

          <label className="flex flex-col gap-2 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
            Endereço
            <input
              type="text"
              name="address_line"
              placeholder="Rua, número, complemento"
              className={`${inputClass} normal-case`}
            />
          </label>
          <label className="flex flex-col gap-2 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
            Cidade
            <input
              type="text"
              name="city"
              placeholder="São Paulo"
              className={`${inputClass} normal-case`}
            />
          </label>
          <label className="flex flex-col gap-2 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
            Estado (UF)
            <select name="state" defaultValue="" className={`${inputClass} normal-case`}>
              <option value="" disabled>
                Selecione
              </option>
              {STATES.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
            CEP
            <input
              type="text"
              name="postal_code"
              placeholder="00000-000"
              className={`${inputClass} normal-case`}
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-outline-variant bg-surface-container-low p-6 sm:p-8">
        <SectionHeader icon="stars" title="Escolha seu Plano" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {plans.map((plan, index) => {
            const highlight = plan.code === "essencial";
            const teaser = planFeatureList(plan).slice(0, 3);
            return (
              <label key={plan.code} className="group relative cursor-pointer">
                <input
                  type="radio"
                  name="plan_code"
                  value={plan.code}
                  defaultChecked={index === 1}
                  className="peer sr-only"
                />
                {highlight && (
                  <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-secondary px-3 py-1 text-[10px] font-black tracking-tighter text-on-secondary uppercase">
                    Mais Popular
                  </span>
                )}
                <div
                  className={`h-full rounded-2xl border p-6 transition-all peer-checked:border-primary peer-checked:bg-primary/5 ${
                    highlight ? "border-2 border-primary shadow-[0_0_15px_rgba(230,87,43,0.1)]" : "border-outline-variant"
                  }`}
                >
                  <h4 className="mb-1 text-sm font-bold text-on-surface-variant">{plan.name}</h4>
                  <p className="mb-4 font-display text-2xl font-black">
                    {formatPlanPrice(plan.price_cents)}
                    <span className="text-sm font-normal text-on-surface-variant">/mês</span>
                  </p>
                  <ul className="space-y-2 text-xs text-on-surface-variant">
                    {teaser.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[14px] text-primary">
                          check_circle
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </label>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-outline-variant bg-surface-container-low p-6 sm:p-8">
        <SectionHeader icon="person" title="Responsável Técnico" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
            Nome Completo
            <input
              type="text"
              name="manager_name"
              required
              placeholder="Nome do proprietário ou gerente"
              className={`${inputClass} normal-case`}
            />
          </label>
          <label className="flex flex-col gap-2 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
            E-mail para Acesso
            <input
              type="email"
              name="manager_email"
              required
              placeholder="nome@exemplo.com"
              className={`${inputClass} normal-case`}
            />
            <p className="flex items-center gap-1 text-xs font-normal text-on-surface-variant/80 normal-case">
              <span className="material-symbols-outlined text-[14px]">info</span>
              recebe o convite pra criar a própria senha
            </p>
          </label>
        </div>
      </section>

      {state.error && <p className="text-sm font-semibold text-error">{state.error}</p>}

      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border-t-4 border-primary bg-surface-container-low p-6 sm:flex-row sm:p-8">
        <div className="hidden text-center sm:block sm:text-left">
          <p className="text-sm text-on-surface-variant">
            Ao criar, você concorda com os termos de serviço.
          </p>
          <p className="text-xs text-on-surface-variant/60">
            Faturamento mensal iniciará após a confirmação.
          </p>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="group flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-10 py-4 text-lg font-black text-on-primary shadow-lg shadow-primary/20 transition-all active:scale-95 hover:brightness-110 disabled:opacity-60 sm:w-auto"
        >
          {pending ? "Criando…" : "Criar estabelecimento"}
          <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
            arrow_forward
          </span>
        </button>
      </div>
    </form>
  );
}
