"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireSystemAdmin } from "@/lib/auth/require-admin";
import { logAdminAction } from "@/lib/audit";
import { createInviteLink } from "@/lib/invite";

export type CreateEstablishmentState = {
  error: string | null;
  success?: { restaurantId: string; inviteLink: string | null };
};

export async function createEstablishment(
  _prevState: CreateEstablishmentState,
  formData: FormData,
): Promise<CreateEstablishmentState> {
  const admin = await requireSystemAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const planCode = String(formData.get("plan_code") ?? "");
  const addressLine = String(formData.get("address_line") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim() || null;
  const state = String(formData.get("state") ?? "").trim() || null;
  const postalCode = String(formData.get("postal_code") ?? "").trim() || null;
  const managerName = String(formData.get("manager_name") ?? "").trim();
  const managerEmail = String(formData.get("manager_email") ?? "").trim().toLowerCase();

  if (!name || !slug || !planCode || !managerName || !managerEmail) {
    return { error: "Preencha nome, slug, plano e os dados do responsável." };
  }

  const supabase = createAdminClient();

  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("id")
    .eq("code", planCode)
    .single();

  if (planError || !plan) {
    return { error: "Plano inválido." };
  }

  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .insert({ name })
    .select("id")
    .single();

  if (orgError || !organization) {
    return { error: `Erro ao criar organização: ${orgError?.message}` };
  }

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .insert({
      organization_id: organization.id,
      slug,
      name,
      plan_id: plan.id,
      status: "active",
      signup_source: "admin",
      address_line: addressLine,
      city,
      state,
      postal_code: postalCode,
    })
    .select("id")
    .single();

  if (restaurantError || !restaurant) {
    return { error: `Erro ao criar estabelecimento: ${restaurantError.message}` };
  }

  let managerId: string;
  let inviteLink: string | null = null;

  const invite = await createInviteLink(supabase, managerEmail, { name: managerName });

  if (invite.userId) {
    managerId = invite.userId;
    inviteLink = invite.link;
  } else {
    const alreadyExists = /already|registered|existe/i.test(invite.error ?? "");
    if (!alreadyExists) {
      return {
        error: `Estabelecimento criado, mas não consegui gerar o convite: ${invite.error}`,
      };
    }
    const { data: usersPage, error: listError } = await supabase.auth.admin.listUsers({
      perPage: 200,
    });
    const existing = usersPage?.users.find((u) => u.email?.toLowerCase() === managerEmail);
    if (listError || !existing) {
      return {
        error: `Estabelecimento criado, mas já existe um usuário com esse e-mail e não consegui localizá-lo.`,
      };
    }
    managerId = existing.id;
  }

  const { error: staffError } = await supabase.from("staff").insert({
    restaurant_id: restaurant.id,
    user_id: managerId,
    name: managerName,
    role: "gestor",
    is_active: true,
  });

  if (staffError) {
    return {
      error: `Estabelecimento criado, mas falhou ao vincular o responsável: ${staffError.message}`,
    };
  }

  await logAdminAction(supabase, admin.id, "estabelecimento.criado", {
    targetType: "restaurant",
    targetId: restaurant.id,
    details: { name, slug, plan_code: planCode, manager_email: managerEmail },
  });

  return { error: null, success: { restaurantId: restaurant.id, inviteLink } };
}
