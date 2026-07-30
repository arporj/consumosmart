import Link from "next/link";

export function AdminTopBar({
  crumbs,
  search,
  showNewEstablishment = true,
}: {
  crumbs: string[];
  search?: { placeholder: string; action: string; paramName?: string; value?: string };
  showNewEstablishment?: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-outline-variant/60 bg-surface/80 px-5 py-4 backdrop-blur-md sm:px-8">
      <nav className="flex items-center gap-2 text-sm">
        {crumbs.map((crumb, i) => (
          <span key={crumb} className="flex items-center gap-2">
            {i > 0 && (
              <span className="material-symbols-outlined text-xs text-on-surface-variant">
                chevron_right
              </span>
            )}
            <span
              className={
                i === crumbs.length - 1
                  ? "font-semibold text-on-surface"
                  : "text-on-surface-variant"
              }
            >
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        {search && (
          <form action={search.action} method="get" className="group relative hidden md:block">
            <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-lg text-on-surface-variant transition-colors group-focus-within:text-primary">
              search
            </span>
            <input
              type="text"
              name={search.paramName ?? "q"}
              defaultValue={search.value}
              placeholder={search.placeholder}
              className="w-56 rounded-full border border-outline-variant bg-surface-container-low py-1.5 pr-4 pl-10 text-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-primary"
            />
          </form>
        )}

        {showNewEstablishment && (
          <Link
            href="/admin/estabelecimentos/novo"
            className="hidden items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-on-primary transition-all hover:brightness-110 sm:flex"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Novo estabelecimento
          </Link>
        )}
      </div>
    </header>
  );
}
