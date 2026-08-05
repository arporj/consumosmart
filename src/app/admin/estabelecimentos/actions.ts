"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSystemAdmin } from "@/lib/auth/require-admin";
import { logAdminAction } from "@/lib/audit";

// Cancelamento é soft-delete: marca o status como "canceled" em vez de apagar a linha, já que
// restaurant_id é referenciado por staff, caixa, RH e outras tabelas — um DELETE de verdade
// arrastaria ou quebraria essas dependências.
export async function cancelEstablishment(restaurantId: string) {
  const admin = await requireSystemAdmin();

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("restaurants")
    .update({ status: "canceled" })
    .eq("id", restaurantId);

  if (error) {
    throw new Error(error.message);
  }

  await logAdminAction(supabase, admin.id, "estabelecimento.cancelado", {
    targetType: "restaurant",
    targetId: restaurantId,
  });

  revalidatePath("/admin/estabelecimentos");
  revalidatePath(`/admin/estabelecimentos/${restaurantId}`);
}
