"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSystemAdmin } from "@/lib/auth/require-admin";
import { logAdminAction } from "@/lib/audit";

export type AddAdminState = { error: string | null };

export async function addSystemAdmin(
  _prevState: AddAdminState,
  formData: FormData,
): Promise<AddAdminState> {
  const admin = await requireSystemAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Informe um e-mail." };

  const supabase = createAdminClient();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data: invite, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/auth/definir-senha`,
  });

  let userId: string | undefined = invite?.user?.id;

  if (inviteError) {
    const alreadyExists = /already|registered|existe/i.test(inviteError.message);
    if (!alreadyExists) {
      return { error: `Erro ao convidar: ${inviteError.message}` };
    }

    // Usuário já tem conta (staff, cliente ou outro admin) — promove a conta existente,
    // sem tentar recriar/reenviar convite pra quem já pode logar normalmente.
    const { data: usersPage, error: listError } = await supabase.auth.admin.listUsers({
      perPage: 200,
    });
    if (listError) return { error: `Erro ao buscar usuário: ${listError.message}` };

    const existing = usersPage.users.find((u) => u.email?.toLowerCase() === email);
    if (!existing) {
      return { error: "Já existe um usuário com esse e-mail, mas não consegui localizá-lo." };
    }
    userId = existing.id;
  }

  if (!userId) return { error: "Não foi possível determinar o usuário." };

  const { error: insertError } = await supabase
    .from("system_admins")
    .insert({ user_id: userId });

  if (insertError) {
    if (insertError.code === "23505") {
      return { error: "Esse usuário já é administrador." };
    }
    return { error: insertError.message };
  }

  await logAdminAction(supabase, admin.id, "admin.adicionado", {
    targetType: "system_admin",
    targetId: userId,
    details: { email },
  });

  revalidatePath("/admin/administradores");
  return { error: null };
}

export type RemoveAdminState = { error: string | null };

export async function removeSystemAdmin(
  _prevState: RemoveAdminState,
  formData: FormData,
): Promise<RemoveAdminState> {
  const admin = await requireSystemAdmin();
  const userId = String(formData.get("user_id") ?? "");

  if (!userId) return { error: "Administrador inválido." };
  if (userId === admin.id) return { error: "Você não pode remover seu próprio acesso." };

  const supabase = createAdminClient();

  const { data: target, error: targetError } = await supabase
    .from("system_admins")
    .select("is_owner")
    .eq("user_id", userId)
    .single();

  if (targetError || !target) return { error: "Administrador não encontrado." };
  if (target.is_owner) {
    return { error: "Este administrador é o dono da conta e não pode ser removido." };
  }

  const { error } = await supabase.from("system_admins").delete().eq("user_id", userId);
  if (error) return { error: error.message };

  await logAdminAction(supabase, admin.id, "admin.removido", {
    targetType: "system_admin",
    targetId: userId,
  });

  revalidatePath("/admin/administradores");
  return { error: null };
}
