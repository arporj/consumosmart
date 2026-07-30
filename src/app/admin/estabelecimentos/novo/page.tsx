import { createAdminClient } from "@/lib/supabase/admin";
import { requireSystemAdmin } from "@/lib/auth/require-admin";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { PLAN_COLUMNS, type Plan } from "@/lib/plans";
import { NewEstablishmentForm } from "./NewEstablishmentForm";

// Mesmo motivo do painel de estabelecimentos: client de service role não usa
// cookies(), então sem isso o Next congelaria a lista de planos no build.
export const dynamic = "force-dynamic";

export default async function NewEstablishmentPage() {
  await requireSystemAdmin();
  const supabase = createAdminClient();
  const { data: plans } = await supabase
    .from("plans")
    .select(PLAN_COLUMNS)
    .order("price_cents", { ascending: true });

  return (
    <div className="flex flex-col">
      <AdminTopBar crumbs={["Estabelecimentos", "Novo Estabelecimento"]} showNewEstablishment={false} />

      <div className="mx-auto w-full max-w-4xl p-5 sm:p-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-black tracking-tight">
            Cadastrar Novo Estabelecimento
          </h1>
          <p className="mt-1 text-on-surface-variant">
            Preencha as informações básicas para começar a usar o ConsumoSmart.
          </p>
        </div>
        <NewEstablishmentForm plans={(plans ?? []) as Plan[]} />
      </div>
    </div>
  );
}
