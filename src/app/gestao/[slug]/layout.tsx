import Link from "next/link";
import { requireGestor } from "@/lib/auth/require-gestor";
import { Logo } from "@/components/Logo";
import { GestaoNav } from "@/components/gestao/GestaoNav";
import { endImpersonationAction } from "./end-impersonation-action";

export default async function GestaoLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { user, restaurant, impersonating } = await requireGestor(slug);

  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface">
      {impersonating && (
        <div className="flex flex-wrap items-center justify-center gap-3 bg-secondary px-4 py-2 text-center text-xs font-bold text-on-secondary md:text-sm">
          <span className="material-symbols-outlined text-base">visibility</span>
          Você está vendo como um funcionário de {restaurant.name} — modo simulação
          <form action={endImpersonationAction}>
            <button
              type="submit"
              className="rounded-full bg-on-secondary/20 px-3 py-1 text-xs font-bold uppercase tracking-wide hover:bg-on-secondary/30"
            >
              Sair da simulação
            </button>
          </form>
        </div>
      )}
      <div className="flex flex-1 flex-col md:flex-row">
      <aside className="hidden shrink-0 flex-col justify-between border-r border-outline-variant bg-surface p-4 shadow-md md:flex md:w-64">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 px-2">
            <Link href={`/gestao/${slug}/mesas`}>
              <Logo markClassName="h-7 w-7" textClassName="text-base" />
            </Link>
            <div>
              <h2 className="text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                {restaurant.name}
              </h2>
              <p className="text-[10px] tracking-tighter text-tertiary uppercase opacity-80">
                Gestão do Restaurante
              </p>
            </div>
          </div>
          <GestaoNav slug={slug} />
        </div>

        <div className="mt-auto flex flex-col gap-1 border-t border-outline-variant pt-4">
          <p className="truncate px-4 text-xs text-on-surface-variant" title={user.email ?? ""}>
            {user.email}
          </p>
          <Link
            href="/auth/escolher"
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-medium text-on-surface-variant transition-colors hover:text-secondary"
          >
            <span className="material-symbols-outlined text-sm">sync_alt</span>
            Trocar de estabelecimento
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-bold text-on-surface-variant transition-all duration-200 hover:bg-error-container hover:text-on-error-container"
            >
              <span className="material-symbols-outlined">logout</span>
              Sair
            </button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex flex-col gap-3 border-b border-outline-variant/60 bg-surface-container-low px-5 py-3 md:hidden">
          <div className="flex items-center justify-between">
            <Link href={`/gestao/${slug}/mesas`}>
              <Logo markClassName="h-7 w-7" textClassName="text-base" />
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/auth/escolher"
                className="text-xs font-semibold text-on-surface-variant hover:text-on-surface"
              >
                Trocar
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
          <GestaoNav slug={slug} orientation="horizontal" />
        </header>

        <main className="flex-1">{children}</main>
      </div>
      </div>
    </div>
  );
}
