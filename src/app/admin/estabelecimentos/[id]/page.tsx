import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSystemAdmin } from "@/lib/auth/require-admin";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { StatusForm } from "./StatusForm";
import { ImpersonateButton } from "./ImpersonateButton";

// Idem: client de service role não usa cookies(), então marcamos explícito em vez
// de depender só do heurístico de rota dinâmica ([id]) pra evitar cache indevido.
export const dynamic = "force-dynamic";

const AVATAR_TONE = ["text-primary", "text-secondary", "text-tertiary"] as const;

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
    .select("id, name, role, is_active, user_id")
    .eq("restaurant_id", id)
    .order("created_at", { ascending: true });

  const plan = restaurant.plans as unknown as { code: string; name: string } | null;
  const organization = restaurant.organizations as unknown as { name: string } | null;
  const staffList = staff ?? [];

  return (
    <div className="flex flex-col">
      <AdminTopBar crumbs={["Estabelecimentos", restaurant.name]} />

      <div className="mx-auto w-full max-w-6xl p-5 sm:p-8">
        <div className="mb-8 flex items-center gap-6">
          <div className="flex h-20 w-20 flex-none items-center justify-center rounded-2xl border border-primary/30 bg-primary/20">
            <span className="material-symbols-outlined text-4xl text-primary">restaurant</span>
          </div>
          <div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight">
              {restaurant.name}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-on-surface-variant">
              <span className="font-medium">{organization?.name}</span>
              <span className="h-1 w-1 rounded-full bg-outline-variant" />
              <span className="opacity-80">/{restaurant.slug}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <section className="rounded-2xl border border-outline-variant bg-surface-container-low p-6">
                <div className="mb-6 flex items-center gap-3 text-secondary">
                  <span className="material-symbols-outlined">location_on</span>
                  <h2 className="font-display text-lg font-bold">Endereço</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="mb-1 text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                      Rua e número
                    </span>
                    <span className="font-medium text-on-surface">
                      {restaurant.address_line ?? "—"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="mb-1 text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                      Cidade / UF
                    </span>
                    <span className="font-medium text-on-surface">
                      {restaurant.city ?? "—"}
                      {restaurant.state ? ` / ${restaurant.state}` : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="mb-1 text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                        CEP
                      </span>
                      <span className="font-medium text-on-surface">
                        {restaurant.postal_code ?? "—"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="mb-1 text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                        Criação
                      </span>
                      <span className="font-medium text-on-surface">
                        {new Date(restaurant.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="flex flex-col rounded-2xl border border-outline-variant bg-surface-container-low p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-tertiary">
                    <span className="material-symbols-outlined">group</span>
                    <h2 className="font-display text-lg font-bold">Equipe</h2>
                  </div>
                  <span className="rounded-full border border-outline-variant px-2 py-1 text-[10px] font-bold text-on-surface-variant">
                    {staffList.length} {staffList.length === 1 ? "membro" : "membros"}
                  </span>
                </div>
                {staffList.length === 0 && (
                  <p className="text-sm text-on-surface-variant">Nenhum vínculo ainda.</p>
                )}
                <ul className="space-y-1">
                  {staffList.map((member, i) => (
                    <li
                      key={member.id}
                      className={`flex items-center justify-between rounded-xl p-2 transition-colors ${
                        member.is_active ? "hover:bg-surface-container" : "opacity-60 grayscale"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-highest text-xs font-bold ${AVATAR_TONE[i % AVATAR_TONE.length]}`}
                        >
                          {member.name[0]?.toUpperCase()}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-on-surface">{member.name}</span>
                          <span className="text-[10px] text-on-surface-variant">
                            {member.role}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.is_active && member.user_id && (
                          <ImpersonateButton
                            staffUserId={member.user_id}
                            restaurantId={restaurant.id}
                            restaurantSlug={restaurant.slug}
                            memberName={member.name}
                          />
                        )}
                        {member.is_active ? (
                          <span className="h-2 w-2 rounded-full bg-status-free shadow-[0_0_8px_rgba(143,191,111,0.5)]" />
                        ) : (
                          <span className="text-[9px] font-bold tracking-tighter text-outline uppercase">
                            Inativo
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section className="rounded-2xl border border-outline-variant bg-surface-container-low p-6 sm:p-8">
              <div className="mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">analytics</span>
                <h2 className="font-display text-xl font-bold">Plano e Status</h2>
              </div>
              <StatusForm
                restaurantId={restaurant.id}
                currentStatus={restaurant.status}
                currentPlanCode={plan?.code ?? ""}
                plans={plans ?? []}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
