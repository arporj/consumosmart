import Link from "next/link";
import { requireGestor } from "@/lib/auth/require-gestor";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const TONE_CLASSES: Record<string, string> = {
  primary: "bg-primary-container text-on-primary-container",
  secondary: "bg-secondary-container text-on-secondary-container",
  tertiary: "bg-tertiary-container text-on-tertiary-container",
};

export default async function GestaoDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { restaurant } = await requireGestor(slug);
  const supabase = createAdminClient();

  const [
    { count: areasCount },
    { count: tablesCount },
    { count: categoriesCount },
    { count: activeProductsCount },
    { data: staff },
  ] = await Promise.all([
    supabase
      .from("restaurant_areas")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurant.id),
    supabase
      .from("tables")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurant.id),
    supabase
      .from("product_categories")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurant.id),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurant.id)
      .eq("is_active", true),
    supabase.from("staff").select("id, is_active").eq("restaurant_id", restaurant.id),
  ]);

  const activeStaff = (staff ?? []).filter((member) => member.is_active).length;
  const totalStaff = (staff ?? []).length;

  const stats = [
    {
      label: "Mesas cadastradas",
      value: tablesCount ?? 0,
      hint: `${areasCount ?? 0} área${(areasCount ?? 0) === 1 ? "" : "s"}`,
      icon: "table_restaurant",
      tone: "primary",
    },
    {
      label: "Itens ativos no cardápio",
      value: activeProductsCount ?? 0,
      hint: `${categoriesCount ?? 0} categoria${(categoriesCount ?? 0) === 1 ? "" : "s"}`,
      icon: "restaurant_menu",
      tone: "secondary",
    },
    {
      label: "Equipe ativa",
      value: activeStaff,
      hint: `${totalStaff} no total`,
      icon: "groups",
      tone: "tertiary",
    },
  ];

  const quickLinks = [
    {
      href: `/gestao/${slug}/mesas`,
      title: "Mesas",
      description: "Organize áreas do salão e cadastre as mesas.",
      icon: "table_restaurant",
    },
    {
      href: `/gestao/${slug}/cardapio`,
      title: "Cardápio",
      description: "Categorias, produtos, preços e setor de produção.",
      icon: "restaurant_menu",
    },
    {
      href: `/gestao/${slug}/equipe`,
      title: "Equipe",
      description: "Convide garçom, caixa, cozinha e bar.",
      icon: "groups",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-5 sm:p-8">
      <div>
        <h1 className="font-display text-3xl font-black tracking-tight">Painel</h1>
        <p className="mt-1 text-on-surface-variant">Visão geral de {restaurant.name}.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-3 rounded-2xl border border-outline-variant/60 bg-surface-container-low p-5 shadow-lg shadow-black/20"
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${TONE_CLASSES[stat.tone]}`}
            >
              <span className="material-symbols-outlined">{stat.icon}</span>
            </span>
            <div>
              <p className="font-display text-3xl font-black tabular-nums">{stat.value}</p>
              <p className="text-sm font-bold text-on-surface-variant">{stat.label}</p>
              <p className="text-xs text-on-surface-variant/70">{stat.hint}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-bold text-on-surface-variant">Gerenciar</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex flex-col gap-3 rounded-2xl border border-outline-variant/60 bg-surface-container-low p-5 shadow-lg shadow-black/20 transition-transform hover:-translate-y-0.5 hover:border-primary"
            >
              <span className="material-symbols-outlined text-2xl text-primary">{link.icon}</span>
              <div>
                <p className="font-display text-base font-bold">{link.title}</p>
                <p className="text-sm text-on-surface-variant">{link.description}</p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1 text-xs font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Gerenciar
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
