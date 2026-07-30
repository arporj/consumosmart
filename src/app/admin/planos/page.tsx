import { createAdminClient } from "@/lib/supabase/admin";
import { requireSystemAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

type Plan = {
  id: string;
  code: string;
  name: string;
  price_cents: number;
  self_service_ordering: boolean;
  kds: boolean;
  reservations: boolean;
  nfce_enabled: boolean;
  nfce_monthly_limit: number | null;
  stock_advanced: boolean;
  financial_entries: boolean;
  suppliers: boolean;
  hr_commissions: boolean;
};

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function featureList(plan: Plan) {
  const items: { label: string; enabled: boolean }[] = [
    { label: "Autoatendimento (pedido pelo celular)", enabled: plan.self_service_ordering },
    { label: "Telas de produção (Cozinha e Bar)", enabled: plan.kds },
    { label: "Reserva de mesa", enabled: plan.reservations },
    {
      label: plan.nfce_enabled
        ? `Nota fiscal (${plan.nfce_monthly_limit ? `até ${plan.nfce_monthly_limit}/mês` : "ilimitada"})`
        : "Nota fiscal",
      enabled: plan.nfce_enabled,
    },
    { label: "Estoque avançado + ficha técnica", enabled: plan.stock_advanced },
    { label: "Financeiro (contas a pagar/receber)", enabled: plan.financial_entries },
    { label: "Fornecedores", enabled: plan.suppliers },
    { label: "Comissões da equipe", enabled: plan.hr_commissions },
  ];
  return items;
}

export default async function PlanosPage() {
  await requireSystemAdmin();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("plans")
    .select(
      "id, code, name, price_cents, self_service_ordering, kds, reservations, nfce_enabled, nfce_monthly_limit, stock_advanced, financial_entries, suppliers, hr_commissions",
    )
    .order("price_cents", { ascending: true });

  const plans = (data ?? []) as Plan[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Planos & Preços</h1>
        <p className="text-sm text-on-surface-variant">
          Preço e funcionalidades liberadas em cada plano vendido pelo ConsumoSmart.
        </p>
      </div>

      {error && <p className="text-sm text-error">Erro ao carregar: {error.message}</p>}

      <div className="grid gap-6 sm:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-surface-container-low p-6"
          >
            <div>
              <h2 className="font-display text-xl font-bold">{plan.name}</h2>
              <p className="mt-1 font-mono text-2xl font-bold">
                {formatPrice(plan.price_cents)}
                <span className="text-base font-sans font-normal text-on-surface-variant">
                  /mês
                </span>
              </p>
            </div>
            <ul className="flex flex-1 flex-col gap-2 text-sm">
              {featureList(plan).map((item) => (
                <li key={item.label} className="flex gap-2">
                  <span className={item.enabled ? "text-secondary" : "text-outline-variant"}>
                    {item.enabled ? "✓" : "–"}
                  </span>
                  <span
                    className={item.enabled ? "text-on-surface-variant" : "text-outline-variant"}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {plans.length === 0 && !error && (
          <p className="text-sm text-on-surface-variant">Nenhum plano cadastrado.</p>
        )}
      </div>

      <p className="text-xs text-on-surface-variant">
        Edição de preço e funcionalidades ainda não está disponível por aqui — os valores acima
        vêm direto da tabela <code className="font-mono">plans</code>.
      </p>
    </div>
  );
}
