import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";

export async function logAdminAction(
  supabase: ReturnType<typeof createAdminClient>,
  actorUserId: string,
  action: string,
  options?: { targetType?: string; targetId?: string; details?: Record<string, unknown> },
) {
  const { error } = await supabase.from("admin_audit_log").insert({
    actor_user_id: actorUserId,
    action,
    target_type: options?.targetType ?? null,
    target_id: options?.targetId ?? null,
    details: options?.details ?? null,
  });

  // Auditoria é best-effort: uma falha aqui não pode derrubar a ação principal
  // (ex. criar estabelecimento) que já foi concluída com sucesso.
  if (error) console.error("Falha ao registrar auditoria:", error.message);
}
