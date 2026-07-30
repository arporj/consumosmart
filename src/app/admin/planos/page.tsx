import { createAdminClient } from "@/lib/supabase/admin";
import { requireSystemAdmin } from "@/lib/auth/require-admin";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
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
    <div className="flex flex-col">
      <AdminTopBar
        crumbs={["Área de Gestão", "Planos & Preços"]}
        search={{ placeholder: "Buscar configurações...", action: "/admin/planos" }}
      />

      <div className="mx-auto w-full max-w-7xl p-5 sm:p-8">
        <div className="mb-10">
          <h1 className="font-display text-4xl font-black tracking-tight">Planos & Preços</h1>
          <p className="mt-2 text-on-surface-variant">
            Alterações aqui refletem na Landing Page na hora.
          </p>
        </div>

        {error && <p className="mb-6 text-sm text-error">Erro ao carregar: {error.message}</p>}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanEditForm key={plan.id} plan={plan} />
          ))}
          {plans.length === 0 && !error && (
            <p className="text-sm text-on-surface-variant">Nenhum plano cadastrado.</p>
          )}
        </div>
      </div>
    </div>
  );
}
