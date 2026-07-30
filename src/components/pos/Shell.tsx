"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock } from "./Clock";

const NAV = [
  { href: "/mesas", label: "Mesas" },
  { href: "/balcao", label: "Venda Balcão" },
  { href: "/cardapio", label: "Cardápio" },
  { href: "/fechamento", label: "Fechamento" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface">
      <header className="flex flex-none items-center gap-3 border-b-[3px] border-primary bg-surface-container-low px-4 py-3 sm:px-5">
        <div
          className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-primary text-[10px] font-display font-extrabold text-on-primary shadow-lg shadow-primary/30"
          title="Logo do estabelecimento"
        >
          LOGO
        </div>

        <nav className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 whitespace-nowrap rounded-xl px-4 py-3 text-center text-sm font-bold transition-colors ${
                  active
                    ? "bg-primary text-on-primary"
                    : "border border-outline-variant bg-surface-container-high text-on-surface-variant hover:border-secondary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Clock />
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
