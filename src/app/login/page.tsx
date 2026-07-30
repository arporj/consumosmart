import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveHomePath } from "@/lib/auth/resolve-home";
import { LoginForm } from "./LoginForm";

const HIGHLIGHTS = [
  "Mapa de mesas e comandas em tempo real",
  "Cardápio digital e pedido pelo celular do cliente",
  "Fechamento de conta com divisão por pessoa",
];

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(await resolveHomePath(supabase, user.id));
  }

  return (
    <div className="grid min-h-screen bg-surface text-on-surface lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary-container via-surface-container-lowest to-surface p-12 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-secondary/10 blur-3xl"
        />

        <Link href="/" className="relative font-display text-xl font-extrabold tracking-tight">
          Consumo<span className="text-primary">Smart</span>
        </Link>

        <div className="relative flex flex-col gap-6">
          <h1 className="max-w-md font-display text-3xl font-extrabold leading-tight xl:text-4xl">
            Um login só para gerenciar seu estabelecimento, atender e acompanhar como cliente.
          </h1>
          <ul className="flex flex-col gap-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-on-surface-variant">
                <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-primary/20 text-primary">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-on-surface-variant">
          © {new Date().getFullYear()} ConsumoSmart
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-8 px-5 py-16">
        <Link
          href="/"
          className="font-display text-lg font-extrabold tracking-tight lg:hidden"
        >
          Consumo<span className="text-primary">Smart</span>
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}
