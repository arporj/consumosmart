"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireGestor } from "@/lib/auth/require-gestor";
import { createInviteLink } from "@/lib/invite";

const INVITABLE_ROLES = ["gestor", "garcom", "caixa", "cozinha", "bar"] as const;
export type InvitableRole = (typeof INVITABLE_ROLES)[number];

export async function inviteStaff(slug: string, name: string, email: string, role: string) {
  const { restaurant } = await requireGestor(slug);

  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedName || !trimmedEmail) {
    throw new Error("Nome e e-mail são obrigatórios.");
  }
  if (!INVITABLE_ROLES.includes(role as InvitableRole)) {
    throw new Error("Papel inválido.");
  }

  const supabase = createAdminClient();

  const invite = await createInviteLink(supabase, trimmedEmail, { name: trimmedName });

  let staffUserId: string;

  if (invite.userId) {
    staffUserId = invite.userId;
  } else {
    const alreadyExists = /already|registered|existe/i.test(invite.error ?? "");
    if (!alreadyExists) {
      throw new Error(invite.error ?? "Falha ao gerar convite.");
    }
    const { data: usersPage } = await supabase.auth.admin.listUsers({ perPage: 200 });
    const existing = usersPage?.users.find((u) => u.email?.toLowerCase() === trimmedEmail);
    if (!existing) {
      throw new Error("Já existe uma conta com esse e-mail, mas não consegui localizá-la.");
    }
    staffUserId = existing.id;
  }

  const { error: staffError } = await supabase.from("staff").insert({
    restaurant_id: restaurant.id,
    user_id: staffUserId,
    name: trimmedName,
    role,
    is_active: true,
  });

  if (staffError) throw new Error(staffError.message);

  revalidatePath(`/gestao/${slug}/equipe`);
  return { emailSent: invite.emailSent, link: invite.link };
}

export async function toggleStaffActive(slug: string, staffId: string, isActive: boolean) {
  const { restaurant } = await requireGestor(slug);

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("staff")
    .update({ is_active: isActive })
    .eq("id", staffId)
    .eq("restaurant_id", restaurant.id);

  if (error) throw new Error(error.message);
  revalidatePath(`/gestao/${slug}/equipe`);
}
