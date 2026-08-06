"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireGestor } from "@/lib/auth/require-gestor";

export async function createCategory(slug: string, name: string) {
  const { restaurant } = await requireGestor(slug);
  if (!name.trim()) throw new Error("Nome da categoria é obrigatório.");

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("product_categories")
    .insert({ restaurant_id: restaurant.id, name: name.trim() });

  if (error) throw new Error(error.message);
  revalidatePath(`/gestao/${slug}/cardapio`);
}

export async function deleteCategory(slug: string, categoryId: string) {
  const { restaurant } = await requireGestor(slug);

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("product_categories")
    .delete()
    .eq("id", categoryId)
    .eq("restaurant_id", restaurant.id);

  if (error) throw new Error(error.message);
  revalidatePath(`/gestao/${slug}/cardapio`);
}

// Upload sempre via service role — o bucket é público só pra leitura (URL direta), a escrita
// nunca passa pelo client do navegador, então não precisamos de policy de storage.objects.
async function uploadProductImage(
  supabase: ReturnType<typeof createAdminClient>,
  restaurantId: string,
  imageFile: File,
) {
  const ext = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${restaurantId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, imageFile, { contentType: imageFile.type || undefined, upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function createProduct(
  slug: string,
  categoryId: string | null,
  name: string,
  description: string,
  priceCents: number,
  station: string,
  imageFile: File | null,
) {
  const { restaurant } = await requireGestor(slug);
  if (!name.trim()) throw new Error("Nome do produto é obrigatório.");
  if (!Number.isFinite(priceCents) || priceCents < 0) throw new Error("Preço inválido.");

  const supabase = createAdminClient();

  const imageUrl =
    imageFile && imageFile.size > 0
      ? await uploadProductImage(supabase, restaurant.id, imageFile)
      : null;

  const { error } = await supabase.from("products").insert({
    restaurant_id: restaurant.id,
    category_id: categoryId,
    name: name.trim(),
    description: description.trim() || null,
    price_cents: priceCents,
    station,
    image_url: imageUrl,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/gestao/${slug}/cardapio`);
}

export async function updateProduct(
  slug: string,
  productId: string,
  name: string,
  description: string,
  priceCents: number,
  station: string,
  imageFile: File | null,
  categoryId: string | null,
) {
  const { restaurant } = await requireGestor(slug);
  if (!name.trim()) throw new Error("Nome do produto é obrigatório.");
  if (!Number.isFinite(priceCents) || priceCents < 0) throw new Error("Preço inválido.");

  const supabase = createAdminClient();

  const update: Record<string, unknown> = {
    name: name.trim(),
    description: description.trim() || null,
    price_cents: priceCents,
    station,
    category_id: categoryId,
  };

  if (imageFile && imageFile.size > 0) {
    update.image_url = await uploadProductImage(supabase, restaurant.id, imageFile);
  }

  const { error } = await supabase
    .from("products")
    .update(update)
    .eq("id", productId)
    .eq("restaurant_id", restaurant.id);

  if (error) throw new Error(error.message);
  revalidatePath(`/gestao/${slug}/cardapio`);
}

export async function toggleProductActive(slug: string, productId: string, isActive: boolean) {
  const { restaurant } = await requireGestor(slug);

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", productId)
    .eq("restaurant_id", restaurant.id);

  if (error) throw new Error(error.message);
  revalidatePath(`/gestao/${slug}/cardapio`);
}
