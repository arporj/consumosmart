import "server-only";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveImpersonation } from "@/lib/impersonation";

// Espelha requireSystemAdmin() (ver require-admin.ts): checagem real de "isso aqui é gestor
// deste restaurante?" que toda página/action da Área 2 precisa chamar primeiro. Usa o client
// normal (RLS) só pra resolver sessão + restaurante + vínculo — a leitura/escrita de dados em si
// acontece via createAdminClient() nas próprias páginas, igual à Área 1.
//
// Impersonation: se a sessão real é de um admin com simulação ativa pra este restaurante, o
// "usuário efetivo" vira o staff simulado, não o admin. Nesse caso o lookup do staff usa
// createAdminClient() — a policy de staff só permite ler a própria linha (user_id = auth.uid()),
// e aqui precisamos ler a linha de outra pessoa, o que é uma capacidade de admin, não de RLS.
export async function requireGestor(slug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (!restaurant) notFound();

  const impersonation = await getActiveImpersonation();
  const isImpersonating =
    !!impersonation &&
    impersonation.admin_id === user.id &&
    impersonation.restaurant_id === restaurant.id;

  const effectiveUserId = isImpersonating ? impersonation!.staff_user_id : user.id;
  const staffClient = isImpersonating ? createAdminClient() : supabase;

  const { data: staffRow } = await staffClient
    .from("staff")
    .select("id")
    .eq("restaurant_id", restaurant.id)
    .eq("user_id", effectiveUserId)
    .eq("role", "gestor")
    .eq("is_active", true)
    .maybeSingle();

  if (!staffRow) redirect("/auth/escolher");

  return { user, restaurant, staffId: staffRow.id, impersonating: isImpersonating };
}
