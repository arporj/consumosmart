import { requireGestor } from "@/lib/auth/require-gestor";
import { createAdminClient } from "@/lib/supabase/admin";
import { CardapioBoard } from "./CardapioBoard";

export const dynamic = "force-dynamic";

export default async function CardapioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { restaurant } = await requireGestor(slug);
  const supabase = createAdminClient();

  const { data: categories } = await supabase
    .from("product_categories")
    .select("id, name")
    .eq("restaurant_id", restaurant.id)
    .order("sort_order", { ascending: true });

  const { data: products } = await supabase
    .from("products")
    .select("id, category_id, name, description, price_cents, station, is_active, image_url")
    .eq("restaurant_id", restaurant.id)
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-5 sm:p-8">
      <div>
        <h1 className="font-display text-3xl font-black tracking-tight">Cardápio</h1>
        <p className="mt-1 text-on-surface-variant">
          Cadastre categorias e produtos, com preço e setor de produção.
        </p>
      </div>

      <CardapioBoard slug={slug} categories={categories ?? []} products={products ?? []} />
    </div>
  );
}
