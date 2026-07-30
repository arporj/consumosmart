import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ContaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-5 text-center text-on-surface">
      <h1 className="font-display text-2xl font-bold">Bem-vindo(a)!</h1>
      <p className="max-w-sm text-on-surface-variant">
        Sua conta ({user.email}) está pronta. A Área do Cliente do ConsumoSmart ainda está em
        construção.
      </p>
      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="rounded-xl border border-outline-variant bg-surface-container-high px-4 py-2 text-sm font-bold hover:border-secondary"
        >
          Sair
        </button>
      </form>
    </div>
  );
}
