"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSystemAdmin } from "@/lib/auth/require-admin";

export type UpdatePlanState = { error: string | null; success: boolean };

const BOOLEAN_FIELDS = [
  "self_service_ordering",
  "kds",
  "reservations",
  "nfce_enabled",
  "stock_advanced",
  "financial_entries",
  "suppliers",
  "hr_commissions",
] as const;

export async function updatePlan(
  _prevState: UpdatePlanState,
  formData: FormData,
): Promise<UpdatePlanState> {
  await requireSystemAdmin();

  const planId = String(formData.get("plan_id") ?? "");
  const priceReais = Number(formData.get("price_reais"));
  const nfceLimitRaw = String(formData.get("nfce_monthly_limit") ?? "").trim();

  if (!planId || !Number.isFinite(priceReais) || priceReais < 0) {
    return { error: "Dados inválidos.", success: false };
  }

  const update: Record<string, unknown> = {
    price_cents: Math.round(priceReais * 100),
  };

  for (const field of BOOLEAN_FIELDS) {
    update[field] = formData.get(field) === "on";
  }

  update.nfce_monthly_limit =
    update.nfce_enabled && nfceLimitRaw !== "" ? Number(nfceLimitRaw) : null;

  const supabase = createAdminClient();
  const { error } = await supabase.from("plans").update(update).eq("id", planId);

  if (error) {
    return { error: error.message, success: false };
  }

  revalidatePath("/admin/planos");
  revalidatePath("/");
  return { error: null, success: true };
}
