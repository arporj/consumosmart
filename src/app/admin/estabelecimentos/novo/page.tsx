import { createAdminClient } from "@/lib/supabase/admin";
import { requireSystemAdmin } from "@/lib/auth/require-admin";
import { NewEstablishmentForm } from "./NewEstablishmentForm";

// Mesmo motivo do painel de estabelecimentos: client de service role não usa
// cookies(), então sem isso o Next congelaria a lista de planos no build.
export const dynamic = "force-dynamic";

export default async function NewEstablishmentPage() {
  await requireSystemAdmin();
  const supabase = createAdminClient();
  const { data: plans } = await supabase
    .from("plans")
    .select("code, name, price_cents")
    .order("price_cents", { ascending: true });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-bold">Novo estabelecimento</h1>
      <NewEstablishmentForm plans={plans ?? []} />
    </div>
  );
}
