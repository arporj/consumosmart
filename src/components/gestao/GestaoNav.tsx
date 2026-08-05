"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function GestaoNav({
  slug,
  orientation = "vertical",
}: {
  slug: string;
  orientation?: "vertical" | "horizontal";
}) {
  const pathname = usePathname();

  const items = [
    { href: `/gestao/${slug}`, label: "Painel", icon: "space_dashboard", exact: true },
    { href: `/gestao/${slug}/mesas`, label: "Mesas", icon: "table_restaurant" },
    { href: `/gestao/${slug}/cardapio`, label: "Cardápio", icon: "restaurant_menu" },
    { href: `/gestao/${slug}/equipe`, label: "Equipe", icon: "groups" },
  ] as const;

  return (
    <nav
      className={
        orientation === "vertical"
          ? "flex flex-col gap-1"
          : "flex items-center gap-1 overflow-x-auto"
      }
    >
      {items.map((item) => {
        const active = "exact" in item && item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold whitespace-nowrap transition-all ${
              active
                ? "scale-[0.98] bg-primary-container text-on-primary-container"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
