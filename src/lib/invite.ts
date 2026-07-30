import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";

// Gera o link de convite direto pela API (generateLink), sem depender do envio de e-mail do
// Supabase — o serviço de e-mail padrão (sem SMTP customizado) tem um limite de envio baixo
// demais pra uso real, então preferimos sempre devolver um link copiável em vez de confiar
// que o e-mail vai chegar.
export async function createInviteLink(
  supabase: ReturnType<typeof createAdminClient>,
  email: string,
  data?: Record<string, unknown>,
) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data: result, error } = await supabase.auth.admin.generateLink({
    type: "invite",
    email,
    options: {
      data,
      redirectTo: `${siteUrl}/auth/callback?next=/auth/definir-senha`,
    },
  });

  if (error || !result.user) {
    return { userId: null, link: null, error: error?.message ?? "Falha ao gerar convite." };
  }

  return { userId: result.user.id, link: result.properties.action_link, error: null };
}
