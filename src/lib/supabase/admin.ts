import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente com a service_role key — ignora RLS. Usado só em Server Actions/Route
// Handlers da Área SupraAdmin (ex. criar estabelecimento + convidar o responsável).
// O import "server-only" acima faz o build falhar se isso for importado num client component.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      db: { schema: "consumosmart" },
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
