import Link from "next/link";
import { requireSystemAdmin } from "@/lib/auth/require-admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireSystemAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface">
      <header className="flex items-center justify-between border-b-[3px] border-primary bg-surface-container-low px-5 py-4 sm:px-8">
        <Link
          href="/admin/estabelecimentos"
          className="font-display text-lg font-extrabold tracking-tight"
        >
          ConsumoSmart{" "}
          <span className="font-sans text-sm font-normal text-on-surface-variant">
            · Painel do Sistema
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/conta"
            className="text-sm font-semibold text-on-surface-variant hover:text-on-surface"
          >
            Ver como Cliente
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-xl border border-outline-variant bg-surface-container-high px-4 py-2 text-sm font-bold hover:border-secondary"
            >
              Sair
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 px-5 py-8 sm:px-8">{children}</main>
    </div>
  );
}
