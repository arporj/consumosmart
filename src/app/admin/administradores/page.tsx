import { createAdminClient } from "@/lib/supabase/admin";
import { requireSystemAdmin } from "@/lib/auth/require-admin";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AddAdminForm } from "./AddAdminForm";
import { RemoveAdminButton } from "./RemoveAdminButton";

export const dynamic = "force-dynamic";

export default async function AdministradoresPage() {
  const currentAdmin = await requireSystemAdmin();
  const supabase = createAdminClient();

  const { data: admins, error } = await supabase
    .from("system_admins")
    .select("user_id, is_owner, created_at")
    .order("created_at", { ascending: true });

  const adminList = admins ?? [];
  const withEmails = await Promise.all(
    adminList.map(async (row) => {
      const { data } = await supabase.auth.admin.getUserById(row.user_id);
      return { ...row, email: data.user?.email ?? "—" };
    }),
  );

  return (
    <div className="flex flex-col">
      <AdminTopBar crumbs={["Área de Gestão", "Administradores"]} showNewEstablishment={false} />

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 p-5 sm:p-8">
        <div>
          <h1 className="font-display text-3xl font-black tracking-tight">Administradores</h1>
          <p className="mt-1 text-on-surface-variant">
            Quem tem acesso à Área de Gestão do Sistema.
          </p>
        </div>

        {error && <p className="text-sm text-error">Erro ao carregar: {error.message}</p>}

        <section className="rounded-2xl border border-outline-variant bg-surface-container-low p-6 sm:p-8">
          <h2 className="mb-4 font-display text-lg font-bold">Adicionar administrador</h2>
          <AddAdminForm />
        </section>

        <section className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container shadow-2xl">
          <div className="border-b border-outline-variant p-6">
            <h2 className="font-display text-lg font-bold">Administradores atuais</h2>
          </div>
          <ul className="divide-y divide-outline-variant">
            {withEmails.map((row) => (
              <li key={row.user_id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-surface-container-highest text-xs font-bold text-primary">
                    {row.email[0]?.toUpperCase() ?? "?"}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{row.email}</p>
                    <p className="text-xs text-on-surface-variant">
                      desde {new Date(row.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  {row.is_owner && (
                    <span className="rounded-full bg-secondary/10 px-2 py-1 text-[10px] font-bold tracking-wider text-secondary uppercase">
                      Dono da conta
                    </span>
                  )}
                </div>
                {!row.is_owner && row.user_id !== currentAdmin.id && (
                  <RemoveAdminButton userId={row.user_id} email={row.email} />
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
