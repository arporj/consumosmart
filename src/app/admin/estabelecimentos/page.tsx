import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSystemAdmin } from "@/lib/auth/require-admin";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { CancelEstablishmentButton } from "./CancelEstablishmentButton";

// O client de admin (service role) não usa cookies(), então o Next não tem sinal
// nenhum de que essa página precisa ser gerada por request — sem isso, ele congelaria
// a lista de estabelecimentos no snapshot do momento do build.
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const STATUS_LABEL: Record<string, string> = {
  trial: "Em teste",
  active: "Ativo",
  suspended: "Suspenso",
  canceled: "Cancelado",
};

const STATUS_BADGE: Record<string, string> = {
  trial: "bg-secondary/10 text-secondary",
  active: "bg-tertiary/10 text-tertiary",
  suspended: "bg-primary/10 text-primary",
  canceled: "bg-outline-variant/30 text-on-surface-variant",
};

const AVATAR_TONE = ["text-primary", "text-secondary", "text-tertiary"] as const;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
}

export default async function EstablishmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireSystemAdmin();
  const { q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = createAdminClient();

  let query = supabase
    .from("restaurants")
    .select("id, name, slug, status, created_at, plans(name)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (q) query = query.ilike("name", `%${q}%`);

  const { data: restaurants, count, error } = await query.range(from, to);

  const { count: activeCount } = await supabase
    .from("restaurants")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");
  const { count: trialCount } = await supabase
    .from("restaurants")
    .select("id", { count: "exact", head: true })
    .eq("status", "trial");

  const list = restaurants ?? [];
  const total = count ?? 0;
  const showingFrom = total === 0 ? 0 : from + 1;
  const showingTo = Math.min(from + list.length, total);

  return (
    <div className="flex flex-col">
      <AdminTopBar
        crumbs={["Estabelecimentos"]}
        search={{
          placeholder: "Buscar estabelecimento...",
          action: "/admin/estabelecimentos",
          value: q,
        }}
        showNewEstablishment={false}
      />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-5 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-black tracking-tight">Estabelecimentos</h1>
            <p className="mt-1 text-on-surface-variant">
              Gerencie todos os parceiros e unidades ativas no sistema.
            </p>
          </div>
          <Link
            href="/admin/estabelecimentos/novo"
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-on-primary shadow-lg shadow-primary/20 transition-all active:scale-95 hover:brightness-110"
          >
            <span className="material-symbols-outlined">add</span>
            Novo estabelecimento
          </Link>
        </div>

        {error && <p className="text-sm text-error">Erro ao carregar: {error.message}</p>}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-low p-6">
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-surface-container-highest p-3">
                <span className="material-symbols-outlined text-on-surface-variant">
                  storefront
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface-variant">
                Total de estabelecimentos
              </p>
              <h3 className="mt-1 font-display text-4xl font-black">{total}</h3>
            </div>
          </div>

          <div className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-low p-6">
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-tertiary/10 p-3">
                <span className="material-symbols-outlined text-tertiary">check_circle</span>
              </div>
              <span className="rounded-full bg-tertiary/10 px-2 py-1 text-[10px] font-bold tracking-tighter text-tertiary uppercase">
                Saudável
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface-variant">Ativos</p>
              <h3 className="mt-1 font-display text-4xl font-black text-tertiary">
                {activeCount ?? 0}
              </h3>
            </div>
          </div>

          <div className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-low p-6">
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-secondary/10 p-3">
                <span className="material-symbols-outlined text-secondary">pending</span>
              </div>
              <span className="rounded-full bg-secondary/10 px-2 py-1 text-[10px] font-bold tracking-tighter text-secondary uppercase">
                Trial
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface-variant">Em teste</p>
              <h3 className="mt-1 font-display text-4xl font-black text-secondary">
                {trialCount ?? 0}
              </h3>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container shadow-2xl">
          <div className="flex items-center justify-between border-b border-outline-variant p-6">
            <h3 className="font-display text-lg font-bold">Lista de Estabelecimentos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="bg-surface-container-highest/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                    Nome
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                    Slug
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                    Plano
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                    Criado em
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {list.map((restaurant, i) => {
                  const plan = restaurant.plans as unknown as { name: string } | null;
                  return (
                    <tr key={restaurant.id} className="transition-colors hover:bg-outline-variant/20">
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/estabelecimentos/${restaurant.id}`}
                          className="flex items-center gap-3"
                        >
                          <span
                            className={`flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-surface-container-highest font-bold ${AVATAR_TONE[i % AVATAR_TONE.length]}`}
                          >
                            {initials(restaurant.name)}
                          </span>
                          <span className="text-sm font-semibold hover:text-primary">
                            {restaurant.name}
                          </span>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <code className="rounded bg-surface-container-low px-2 py-0.5 text-xs text-on-surface-variant">
                          {restaurant.slug}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-sm">{plan?.name ?? "—"}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${STATUS_BADGE[restaurant.status] ?? "bg-outline-variant/30 text-on-surface-variant"}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {STATUS_LABEL[restaurant.status] ?? restaurant.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">
                        {new Date(restaurant.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <CancelEstablishmentButton
                          restaurantId={restaurant.id}
                          restaurantName={restaurant.name}
                          disabled={restaurant.status === "canceled"}
                        />
                      </td>
                    </tr>
                  );
                })}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">
                      {q
                        ? `Nenhum estabelecimento encontrado para "${q}".`
                        : "Nenhum estabelecimento cadastrado ainda."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-low p-6">
            <p className="text-xs text-on-surface-variant">
              {total === 0
                ? "Nenhum resultado"
                : `Exibindo ${showingFrom}–${showingTo} de ${total} resultados`}
            </p>
            <div className="flex gap-2">
              <Link
                href={`/admin/estabelecimentos?${new URLSearchParams({ ...(q ? { q } : {}), page: String(page - 1) })}`}
                aria-disabled={page <= 1}
                className={`rounded-lg border border-outline-variant bg-surface-container-highest px-3 py-1 text-xs font-bold ${
                  page <= 1
                    ? "pointer-events-none opacity-50"
                    : "transition-all hover:bg-primary hover:text-on-primary"
                }`}
              >
                Anterior
              </Link>
              <Link
                href={`/admin/estabelecimentos?${new URLSearchParams({ ...(q ? { q } : {}), page: String(page + 1) })}`}
                aria-disabled={to + 1 >= total}
                className={`rounded-lg border border-outline-variant bg-surface-container-highest px-3 py-1 text-xs font-bold ${
                  to + 1 >= total
                    ? "pointer-events-none opacity-50"
                    : "transition-all hover:bg-primary hover:text-on-primary"
                }`}
              >
                Próximo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
