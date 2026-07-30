import Link from "next/link";
import { requireSystemAdmin } from "@/lib/auth/require-admin";
import { Logo } from "@/components/Logo";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireSystemAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface md:flex-row">
      <aside className="hidden shrink-0 flex-col justify-between border-r border-outline-variant/60 bg-surface-container-low p-4 md:flex md:w-64">
        <div className="flex flex-col gap-6">
          <div>
            <Link href="/admin/estabelecimentos">
              <Logo markClassName="h-7 w-7" textClassName="text-base" />
            </Link>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              Painel do sistema
            </p>
          </div>
          <AdminNav />
        </div>

        <div className="flex flex-col gap-1 border-t border-outline-variant/60 pt-4">
          <Link
            href="/conta"
            className="rounded-xl px-3 py-2.5 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            Ver como Cliente
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full rounded-xl border border-outline-variant bg-surface-container-high px-3 py-2.5 text-left text-sm font-bold transition-colors hover:border-secondary"
            >
              Sair
            </button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex flex-col gap-3 border-b border-outline-variant/60 bg-surface-container-low px-5 py-3 md:hidden">
          <div className="flex items-center justify-between">
            <Link href="/admin/estabelecimentos">
              <Logo markClassName="h-7 w-7" textClassName="text-base" />
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/conta"
                className="text-xs font-semibold text-on-surface-variant hover:text-on-surface"
              >
                Ver como Cliente
              </Link>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="rounded-lg border border-outline-variant bg-surface-container-high px-3 py-1.5 text-xs font-bold hover:border-secondary"
                >
                  Sair
                </button>
              </form>
            </div>
          </div>
          <AdminNav orientation="horizontal" />
        </header>

        <main className="flex-1 px-5 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
