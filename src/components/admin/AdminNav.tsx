"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin/estabelecimentos", label: "Estabelecimentos", icon: "storefront" },
  { href: "/admin/planos", label: "Planos & Preços", icon: "payments" },
  { href: "/admin/administradores", label: "Administradores", icon: "admin_panel_settings" },
  { href: "/admin/auditoria", label: "Auditoria", icon: "history" },
] as const;

export function AdminNav({ orientation = "vertical" }: { orientation?: "vertical" | "horizontal" }) {
  const pathname = usePathname();

  return (
    <nav
      className={
        orientation === "vertical"
          ? "flex flex-col gap-1"
          : "flex items-center gap-1 overflow-x-auto"
      }
    >
      {NAV_ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
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
