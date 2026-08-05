"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireGestor } from "@/lib/auth/require-gestor";

export async function createArea(slug: string, name: string) {
  const { restaurant } = await requireGestor(slug);
  if (!name.trim()) throw new Error("Nome da área é obrigatório.");

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("restaurant_areas")
    .insert({ restaurant_id: restaurant.id, name: name.trim() });

  if (error) throw new Error(error.message);
  revalidatePath(`/gestao/${slug}/mesas`);
}

export async function deleteArea(slug: string, areaId: string) {
  const { restaurant } = await requireGestor(slug);

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("restaurant_areas")
    .delete()
    .eq("id", areaId)
    .eq("restaurant_id", restaurant.id);

  if (error) throw new Error(error.message);
  revalidatePath(`/gestao/${slug}/mesas`);
}

export async function createTable(
  slug: string,
  areaId: string | null,
  label: string,
  seats: number | null,
) {
  const { restaurant } = await requireGestor(slug);
  if (!label.trim()) throw new Error("Identificação da mesa é obrigatória.");

  const supabase = createAdminClient();
  const { error } = await supabase.from("tables").insert({
    restaurant_id: restaurant.id,
    area_id: areaId,
    label: label.trim(),
    seats,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/gestao/${slug}/mesas`);
}

export async function updateTable(
  slug: string,
  tableId: string,
  label: string,
  seats: number | null,
) {
  const { restaurant } = await requireGestor(slug);
  if (!label.trim()) throw new Error("Identificação da mesa é obrigatória.");

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("tables")
    .update({ label: label.trim(), seats })
    .eq("id", tableId)
    .eq("restaurant_id", restaurant.id);

  if (error) throw new Error(error.message);
  revalidatePath(`/gestao/${slug}/mesas`);
}

export async function deleteTable(slug: string, tableId: string) {
  const { restaurant } = await requireGestor(slug);
  const supabase = createAdminClient();

  const { data: openOrder } = await supabase
    .from("orders")
    .select("id")
    .eq("table_id", tableId)
    .eq("restaurant_id", restaurant.id)
    .eq("status", "open")
    .maybeSingle();

  if (openOrder) {
    throw new Error("Essa mesa tem um pedido em aberto — feche a conta antes de excluir.");
  }

  const { error } = await supabase
    .from("tables")
    .delete()
    .eq("id", tableId)
    .eq("restaurant_id", restaurant.id);

  if (error) throw new Error(error.message);
  revalidatePath(`/gestao/${slug}/mesas`);
}
