import { requireGestor } from "@/lib/auth/require-gestor";
import { createAdminClient } from "@/lib/supabase/admin";
import { MesasBoard } from "./MesasBoard";

export const dynamic = "force-dynamic";

export default async function MesasPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { restaurant } = await requireGestor(slug);
  const supabase = createAdminClient();

  const { data: areas } = await supabase
    .from("restaurant_areas")
    .select("id, name")
    .eq("restaurant_id", restaurant.id)
    .order("sort_order", { ascending: true });

  const { data: tables } = await supabase
    .from("tables")
    .select("id, area_id, label, seats")
    .eq("restaurant_id", restaurant.id)
    .order("label", { ascending: true });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-5 sm:p-8">
      <div>
        <h1 className="font-display text-3xl font-black tracking-tight">Mesas</h1>
        <p className="mt-1 text-on-surface-variant">
          Organize o salão em áreas e cadastre as mesas de cada uma.
        </p>
      </div>

      <MesasBoard slug={slug} areas={areas ?? []} tables={tables ?? []} />
    </div>
  );
}
