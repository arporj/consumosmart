import { requireGestor } from "@/lib/auth/require-gestor";
import { createAdminClient } from "@/lib/supabase/admin";
import { EquipeBoard } from "./EquipeBoard";

export const dynamic = "force-dynamic";

export default async function EquipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { restaurant, staffId } = await requireGestor(slug);
  const supabase = createAdminClient();

  const { data: staff } = await supabase
    .from("staff")
    .select("id, name, role, is_active, user_id")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: true });

  const staffList = staff ?? [];
  const emailByUserId = new Map<string, string>();
  await Promise.all(
    staffList
      .filter((member) => member.user_id)
      .map(async (member) => {
        const { data } = await supabase.auth.admin.getUserById(member.user_id!);
        emailByUserId.set(member.user_id!, data.user?.email ?? "—");
      }),
  );

  const staffWithEmail = staffList.map((member) => ({
    id: member.id,
    name: member.name,
    role: member.role,
    is_active: member.is_active,
    email: member.user_id ? (emailByUserId.get(member.user_id) ?? "—") : "—",
  }));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-5 sm:p-8">
      <div>
        <h1 className="font-display text-3xl font-black tracking-tight">Equipe</h1>
        <p className="mt-1 text-on-surface-variant">
          Cadastre garçom, caixa, cozinha e bar — cada um com seu próprio acesso.
        </p>
      </div>

      <EquipeBoard slug={slug} staff={staffWithEmail} currentStaffId={staffId} />
    </div>
  );
}
