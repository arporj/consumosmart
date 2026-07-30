"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSystemAdmin } from "@/lib/auth/require-admin";

export type UpdateEstablishmentState = { error: string | null; success: boolean };

export async function updateEstablishment(
  _prevState: UpdateEstablishmentState,
  formData: FormData,
): Promise<UpdateEstablishmentState> {
  await requireSystemAdmin();

  const restaurantId = String(formData.get("restaurant_id") ?? "");
  const status = String(formData.get("status") ?? "");
  const planCode = String(formData.get("plan_code") ?? "");

  if (!restaurantId || !status || !planCode) {
    return { error: "Dados incompletos.", success: false };
  }

  const supabase = createAdminClient();

  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("id")
    .eq("code", planCode)
    .single();

  if (planError || !plan) {
    return { error: "Plano inválido.", success: false };
  }

  const { error } = await supabase
    .from("restaurants")
    .update({ status, plan_id: plan.id })
    .eq("id", restaurantId);

  if (error) {
    return { error: error.message, success: false };
  }

  revalidatePath(`/admin/estabelecimentos/${restaurantId}`);
  revalidatePath("/admin/estabelecimentos");
  return { error: null, success: true };
}
