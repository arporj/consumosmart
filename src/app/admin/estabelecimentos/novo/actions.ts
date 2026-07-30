"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSystemAdmin } from "@/lib/auth/require-admin";
import { logAdminAction } from "@/lib/audit";

export type CreateEstablishmentState = { error: string | null };

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
  const managerEmail = String(formData.get("manager_email") ?? "").trim();

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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data: invite, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
    managerEmail,
    {
      data: { name: managerName },
      redirectTo: `${siteUrl}/auth/callback?next=/auth/definir-senha`,
    },
  );

  if (inviteError || !invite.user) {
    return {
      error: `Estabelecimento criado, mas o convite ao responsável falhou: ${inviteError?.message}`,
    };
  }

  const { error: staffError } = await supabase.from("staff").insert({
    restaurant_id: restaurant.id,
    user_id: invite.user.id,
    name: managerName,
    role: "gestor",
    is_active: true,
  });

  if (staffError) {
    return {
      error: `Convite enviado, mas falhou ao vincular o responsável: ${staffError.message}`,
    };
  }

  await logAdminAction(supabase, admin.id, "estabelecimento.criado", {
    targetType: "restaurant",
    targetId: restaurant.id,
    details: { name, slug, plan_code: planCode, manager_email: managerEmail },
  });

  redirect(`/admin/estabelecimentos/${restaurant.id}`);
}
