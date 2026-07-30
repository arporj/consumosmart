import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSystemAdmin } from "@/lib/auth/require-admin";
import { StatusForm } from "./StatusForm";

// Idem: client de service role não usa cookies(), então marcamos explícito em vez
// de depender só do heurístico de rota dinâmica ([id]) pra evitar cache indevido.
export const dynamic = "force-dynamic";

export default async function EstablishmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSystemAdmin();
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select(
      "id, name, slug, status, created_at, address_line, city, state, postal_code, plans(code, name), organizations(name)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!restaurant) notFound();

  const { data: plans } = await supabase
    .from("plans")
    .select("code, name")
    .order("price_cents", { ascending: true });

  const { data: staff } = await supabase
    .from("staff")
    .select("id, name, role, is_active")
    .eq("restaurant_id", id)
    .order("created_at", { ascending: true });

  const plan = restaurant.plans as unknown as { code: string; name: string } | null;
  const organization = restaurant.organizations as unknown as { name: string } | null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold">{restaurant.name}</h1>
        <p className="text-sm text-on-surface-variant">
          {organization?.name} · /{restaurant.slug}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="flex flex-col gap-2 rounded-2xl border border-outline-variant bg-surface-container-low p-5">
          <h2 className="font-display text-lg font-bold">Endereço</h2>
          <p className="text-sm text-on-surface-variant">
            {restaurant.address_line ?? "—"}
            {restaurant.city ? `, ${restaurant.city}` : ""}
            {restaurant.state ? `/${restaurant.state}` : ""}
            {restaurant.postal_code ? ` · ${restaurant.postal_code}` : ""}
          </p>
          <p className="text-xs text-on-surface-variant">
            Criado em {new Date(restaurant.created_at).toLocaleDateString("pt-BR")}
          </p>
        </section>

        <section className="flex flex-col gap-2 rounded-2xl border border-outline-variant bg-surface-container-low p-5">
          <h2 className="font-display text-lg font-bold">Equipe</h2>
          {(staff ?? []).length === 0 && (
            <p className="text-sm text-on-surface-variant">Nenhum vínculo ainda.</p>
          )}
          <ul className="flex flex-col gap-1 text-sm">
            {(staff ?? []).map((member) => (
              <li key={member.id} className="text-on-surface-variant">
                {member.name} — {member.role}
                {!member.is_active && " (inativo)"}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-surface-container-low p-5">
        <h2 className="font-display text-lg font-bold">Plano e status</h2>
        <StatusForm
          restaurantId={restaurant.id}
          currentStatus={restaurant.status}
          currentPlanCode={plan?.code ?? ""}
          plans={plans ?? []}
        />
      </section>
    </div>
  );
}
