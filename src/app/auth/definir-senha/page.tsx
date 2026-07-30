import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SetPasswordForm } from "./SetPasswordForm";

export default async function DefinirSenhaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface px-5 py-16 text-on-surface">
      <h1 className="font-display text-2xl font-bold">Defina sua senha</h1>
      <p className="max-w-sm text-center text-sm text-on-surface-variant">
        Você foi convidado(a) para o ConsumoSmart. Escolha uma senha pra acessar sua conta nas
        próximas vezes.
      </p>
      <SetPasswordForm />
    </div>
  );
}
