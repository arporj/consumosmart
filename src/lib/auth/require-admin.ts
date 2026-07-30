import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// A checagem de verdade de "isso aqui é admin do sistema?" — Proxy (src/lib/supabase/proxy.ts)
// só confirma que existe sessão, não que ela é de admin (ver comentário lá). Todo
// Server Component/Action da Área SupraAdmin que usa createAdminClient() (service
// role, ignora RLS) precisa chamar isto primeiro — sem essa chamada, a rota fica
// aberta pra qualquer conta logada, já que o client de admin não tem RLS te protegendo.
export async function requireSystemAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: adminRow } = await supabase
    .from("system_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) redirect("/login");

  return user;
}
