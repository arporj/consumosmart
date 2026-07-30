import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function EscolherPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: staffRows } = await supabase
    .from("staff")
    .select("id, role, restaurants(name)")
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (!staffRows || staffRows.length === 0) {
    redirect("/conta");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface px-5 py-16 text-on-surface">
      <h1 className="font-display text-2xl font-bold">Como você quer entrar?</h1>
      <div className="flex w-full max-w-sm flex-col gap-3">
        <Link
          href="/conta"
          className="rounded-xl border border-outline-variant bg-surface-container-high px-4 py-4 text-center text-sm font-bold hover:border-secondary"
        >
          Entrar como Cliente
        </Link>
        {staffRows.map((row) => {
          const restaurant = row.restaurants as unknown as { name: string } | null;
          return (
            <Link
              key={row.id}
              href="/mesas"
              className="rounded-xl bg-primary px-4 py-4 text-center text-sm font-bold text-on-primary"
            >
              Entrar em {restaurant?.name ?? "estabelecimento"} — {row.role}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
