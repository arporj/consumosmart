import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSystemAdmin } from "@/lib/auth/require-admin";

// O client de admin (service role) não usa cookies(), então o Next não tem sinal
// nenhum de que essa página precisa ser gerada por request — sem isso, ele congelaria
// a lista de estabelecimentos no snapshot do momento do build.
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  trial: "Em teste",
  active: "Ativo",
  suspended: "Suspenso",
  canceled: "Cancelado",
};

const STATUS_BADGE: Record<string, string> = {
  trial: "bg-status-waiting/20 text-status-waiting",
  active: "bg-status-free/20 text-status-free",
  suspended: "bg-status-occupied/20 text-status-occupied",
  canceled: "bg-outline-variant/40 text-on-surface-variant",
};

const AVATAR_TONE = [
  "bg-primary/20 text-primary",
  "bg-secondary/20 text-secondary",
  "bg-tertiary/20 text-tertiary",
] as const;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
}

export default async function EstablishmentsPage() {
  await requireSystemAdmin();
  const supabase = createAdminClient();
  const { data: restaurants, error } = await supabase
    .from("restaurants")
    .select("id, name, slug, status, created_at, plans(name)")
    .order("created_at", { ascending: false });

  const list = restaurants ?? [];
  const activeCount = list.filter((r) => r.status === "active").length;
  const trialCount = list.filter((r) => r.status === "trial").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Estabelecimentos</h1>
          <p className="text-sm text-on-surface-variant">
            Gerencie todos os parceiros e unidades ativas no sistema.
          </p>
        </div>
        <Link
          href="/admin/estabelecimentos/novo"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary shadow-lg shadow-primary/30 transition-transform hover:brightness-110 active:scale-95"
        >
          + Novo estabelecimento
        </Link>
      </div>

      {error && <p className="text-sm text-error">Erro ao carregar: {error.message}</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            Total de estabelecimentos
          </p>
          <p className="mt-2 font-mono text-3xl font-bold">{list.length}</p>
        </div>
        <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            Ativos
          </p>
          <p className="mt-2 font-mono text-3xl font-bold text-status-free">{activeCount}</p>
        </div>
        <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            Em teste
          </p>
          <p className="mt-2 font-mono text-3xl font-bold text-status-waiting">{trialCount}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-outline-variant">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container-high text-on-surface-variant">
            <tr>
              <th className="px-4 py-3 font-semibold">Nome</th>
              <th className="px-4 py-3 font-semibold">Slug</th>
              <th className="px-4 py-3 font-semibold">Plano</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Criado em</th>
            </tr>
          </thead>
          <tbody>
            {list.map((restaurant, i) => {
              const plan = restaurant.plans as unknown as { name: string } | null;
              return (
                <tr
                  key={restaurant.id}
                  className="border-t border-outline-variant hover:bg-surface-container"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/estabelecimentos/${restaurant.id}`}
                      className="flex items-center gap-3 font-semibold hover:text-primary"
                    >
                      <span
                        className={`flex h-8 w-8 flex-none items-center justify-center rounded-full text-xs font-bold ${AVATAR_TONE[i % AVATAR_TONE.length]}`}
                      >
                        {initials(restaurant.name)}
                      </span>
                      {restaurant.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-on-surface-variant">
                    {restaurant.slug}
                  </td>
                  <td className="px-4 py-3">{plan?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_BADGE[restaurant.status] ?? "bg-outline-variant/40 text-on-surface-variant"}`}
                    >
                      {STATUS_LABEL[restaurant.status] ?? restaurant.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {new Date(restaurant.created_at).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant">
                  Nenhum estabelecimento cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
