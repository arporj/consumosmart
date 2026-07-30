import type { SupabaseClient } from "@supabase/supabase-js";

// Decide pra onde mandar alguém depois do login, olhando os papéis que a conta tem
// (system_admins/staff/customers todas referenciam auth.users — ver
// supabase/migrations/20260730131635_consumosmart_plans_and_staff.sql).
//
// Admin vai direto pro painel (é o uso principal de quem tem esse papel).
// Quem tem qualquer vínculo de staff ativo passa por /auth/escolher, mesmo com um
// vínculo só — pode ser garçom num lugar e ainda assim querer entrar como cliente.
// Sem nenhum dos dois papéis, só resta a Área do Cliente.
//
// Tipado com os generics em "any": o client de browser/server aponta pro schema
// "consumosmart" (não "public"), então o tipo concreto de SupabaseClient varia
// conforme quem chama — não vale a pena gerar/manter um Database type só pra isso agora.
export async function resolveHomePath(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ver comentário acima
  supabase: SupabaseClient<any, any, any>,
  userId: string,
): Promise<string> {
  const { data: adminRow } = await supabase
    .from("system_admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (adminRow) return "/admin";

  const { data: staffRow } = await supabase
    .from("staff")
    .select("id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (staffRow) return "/auth/escolher";

  return "/conta";
}
