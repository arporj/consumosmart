"use server";

import { redirect } from "next/navigation";
import { startImpersonation } from "@/lib/impersonation";

export async function startImpersonationAction(
  staffUserId: string,
  restaurantId: string,
  restaurantSlug: string,
) {
  await startImpersonation(staffUserId, restaurantId);
  redirect(`/gestao/${restaurantSlug}/mesas`);
}
