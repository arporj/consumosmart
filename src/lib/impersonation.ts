import "server-only";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSystemAdmin } from "@/lib/auth/require-admin";
import { logAdminAction } from "@/lib/audit";

// Base pra "Ver como" — gatilho de UI em admin/estabelecimentos/[id]/impersonate-action.ts
// (iniciar) e gestao/[slug]/end-impersonation-action.ts (encerrar). A sessão real do admin nunca
// é trocada: o cookie guarda só o id da linha em admin_impersonations, e cada leitura
// (getActiveImpersonation) valida no servidor se ainda é do admin certo e não expirou — por isso
// o cookie não precisa ser assinado, ele não carrega nenhum dado em que confiamos sem checar.

const COOKIE_NAME = "csm_impersonation";
const TTL_MINUTES = 30;

export async function startImpersonation(staffUserId: string, restaurantId: string) {
  const admin = await requireSystemAdmin();
  const supabase = createAdminClient();

  const expiresAt = new Date(Date.now() + TTL_MINUTES * 60_000).toISOString();

  const { data: row, error } = await supabase
    .from("admin_impersonations")
    .insert({
      admin_id: admin.id,
      staff_user_id: staffUserId,
      restaurant_id: restaurantId,
      expires_at: expiresAt,
    })
    .select("id")
    .single();

  if (error || !row) {
    throw new Error(error?.message ?? "Falha ao iniciar simulação.");
  }

  await logAdminAction(supabase, admin.id, "impersonation.iniciada", {
    targetType: "staff",
    targetId: staffUserId,
    details: { restaurant_id: restaurantId, impersonation_id: row.id },
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, row.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_MINUTES * 60,
  });

  return row.id as string;
}

export async function endImpersonation() {
  const cookieStore = await cookies();
  const id = cookieStore.get(COOKIE_NAME)?.value;
  cookieStore.delete(COOKIE_NAME);

  if (!id) return;

  const supabase = createAdminClient();
  const { data: row } = await supabase
    .from("admin_impersonations")
    .select("admin_id, staff_user_id, restaurant_id")
    .eq("id", id)
    .maybeSingle();

  await supabase
    .from("admin_impersonations")
    .update({ ended_at: new Date().toISOString() })
    .eq("id", id);

  if (row) {
    await logAdminAction(supabase, row.admin_id, "impersonation.encerrada", {
      targetType: "staff",
      targetId: row.staff_user_id,
      details: { restaurant_id: row.restaurant_id, impersonation_id: id },
    });
  }
}

// Vai ser usado pelas telas da Área 2/3 pra resolver o usuário efetivo: se houver simulação
// ativa e válida, quem "está logado" pra fins de UI/regra de negócio é o staff simulado, não o
// admin de verdade por trás do cookie de sessão Supabase.
export async function getActiveImpersonation() {
  const cookieStore = await cookies();
  const id = cookieStore.get(COOKIE_NAME)?.value;
  if (!id) return null;

  const supabase = createAdminClient();
  const { data: row } = await supabase
    .from("admin_impersonations")
    .select("id, admin_id, staff_user_id, restaurant_id, expires_at, ended_at")
    .eq("id", id)
    .maybeSingle();

  if (!row || row.ended_at || new Date(row.expires_at) < new Date()) {
    return null;
  }

  return row;
}
