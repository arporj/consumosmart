import { createAdminClient } from "@/lib/supabase/admin";
import { requireSystemAdmin } from "@/lib/auth/require-admin";
import { AdminTopBar } from "@/components/admin/AdminTopBar";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

const ACTION_LABEL: Record<string, string> = {
  "estabelecimento.criado": "Criou estabelecimento",
  "estabelecimento.atualizado": "Atualizou estabelecimento",
  "estabelecimento.cancelado": "Cancelou estabelecimento",
  "impersonation.iniciada": "Iniciou simulação de funcionário",
  "impersonation.encerrada": "Encerrou simulação de funcionário",
  "plano.atualizado": "Atualizou plano",
  "admin.adicionado": "Adicionou administrador",
  "admin.removido": "Removeu administrador",
};

export default async function AuditoriaPage() {
  await requireSystemAdmin();
  const supabase = createAdminClient();

  const { data: entries, error } = await supabase
    .from("admin_audit_log")
    .select("id, actor_user_id, action, target_type, target_id, details, created_at")
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  const list = entries ?? [];
  const actorIds = [...new Set(list.map((e) => e.actor_user_id).filter(Boolean))] as string[];
  const emailByActor = new Map<string, string>();
  await Promise.all(
    actorIds.map(async (id) => {
      const { data } = await supabase.auth.admin.getUserById(id);
      emailByActor.set(id, data.user?.email ?? id);
    }),
  );

  return (
    <div className="flex flex-col">
      <AdminTopBar crumbs={["Área de Gestão", "Auditoria"]} showNewEstablishment={false} />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-5 sm:p-8">
        <div>
          <h1 className="font-display text-3xl font-black tracking-tight">Auditoria</h1>
          <p className="mt-1 text-on-surface-variant">
            Últimas {PAGE_SIZE} ações de administradores na Área de Gestão do Sistema.
          </p>
        </div>

        {error && <p className="text-sm text-error">Erro ao carregar: {error.message}</p>}

        <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-surface-container-highest/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                    Quando
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                    Quem
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                    Ação
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                    Detalhes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {list.map((entry) => (
                  <tr key={entry.id} className="transition-colors hover:bg-outline-variant/20">
                    <td className="px-6 py-4 whitespace-nowrap text-on-surface-variant">
                      {new Date(entry.created_at).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {entry.actor_user_id ? (emailByActor.get(entry.actor_user_id) ?? "—") : "—"}
                    </td>
                    <td className="px-6 py-4">
                      {ACTION_LABEL[entry.action] ?? entry.action}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">
                      {entry.details ? JSON.stringify(entry.details) : "—"}
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant">
                      Nenhuma ação registrada ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
