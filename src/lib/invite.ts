import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";

// Usa inviteUserByEmail pra criar o usuário e disparar o e-mail de convite de verdade, via o
// SMTP customizado configurado no projeto. Como o Resend em modo sandbox só entrega pro
// remetente verificado (até termos domínio próprio), ainda geramos o link via generateLink como
// alternativa copiável — ele nunca envia e-mail, só devolve a URL, então serve de fallback
// independente do envio ter funcionado ou não.
export async function createInviteLink(
  supabase: ReturnType<typeof createAdminClient>,
  email: string,
  data?: Record<string, unknown>,
) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const redirectTo = `${siteUrl}/auth/callback?next=/auth/definir-senha`;

  const { data: invited, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
    data,
    redirectTo,
  });

  if (inviteError || !invited.user) {
    return {
      userId: null,
      link: null,
      emailSent: false,
      error: inviteError?.message ?? "Falha ao gerar convite.",
    };
  }

  const { data: linkResult, error: linkError } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  return {
    userId: invited.user.id,
    link: linkError ? null : linkResult.properties.action_link,
    emailSent: true,
    error: null,
  };
}
