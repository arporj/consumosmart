import { createAdminClient } from "@/lib/supabase/admin";
import { requireSystemAdmin } from "@/lib/auth/require-admin";
import { PLAN_COLUMNS, type Plan } from "@/lib/plans";
import { PlanEditForm } from "./PlanEditForm";

export const dynamic = "force-dynamic";

export default async function PlanosPage() {
  await requireSystemAdmin();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("plans")
    .select(PLAN_COLUMNS)
    .order("price_cents", { ascending: true });

  const plans = (data ?? []) as Plan[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Planos & Preços</h1>
        <p className="text-sm text-on-surface-variant">
          Preço e funcionalidades liberadas em cada plano vendido pelo ConsumoSmart. Alterações
          aqui refletem na Landing Page na hora.
        </p>
      </div>

      {error && <p className="text-sm text-error">Erro ao carregar: {error.message}</p>}

      <div className="grid gap-6 sm:grid-cols-3">
        {plans.map((plan) => (
          <PlanEditForm key={plan.id} plan={plan} />
        ))}
        {plans.length === 0 && !error && (
          <p className="text-sm text-on-surface-variant">Nenhum plano cadastrado.</p>
        )}
      </div>
    </div>
  );
}
