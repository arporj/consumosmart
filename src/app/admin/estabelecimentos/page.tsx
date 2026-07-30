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

export default async function EstablishmentsPage() {
  await requireSystemAdmin();
  const supabase = createAdminClient();
  const { data: restaurants, error } = await supabase
    .from("restaurants")
    .select("id, name, slug, status, created_at, plans(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Estabelecimentos</h1>
        <Link
          href="/admin/estabelecimentos/novo"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary"
        >
          + Novo estabelecimento
        </Link>
      </div>

      {error && <p className="text-sm text-error">Erro ao carregar: {error.message}</p>}

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
            {(restaurants ?? []).map((restaurant) => {
              const plan = restaurant.plans as unknown as { name: string } | null;
              return (
                <tr
                  key={restaurant.id}
                  className="border-t border-outline-variant hover:bg-surface-container"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/estabelecimentos/${restaurant.id}`}
                      className="font-semibold hover:text-primary"
                    >
                      {restaurant.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-on-surface-variant">
                    {restaurant.slug}
                  </td>
                  <td className="px-4 py-3">{plan?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    {STATUS_LABEL[restaurant.status] ?? restaurant.status}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {new Date(restaurant.created_at).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              );
            })}
            {(restaurants ?? []).length === 0 && (
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
