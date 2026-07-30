import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveHomePath } from "@/lib/auth/resolve-home";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(await resolveHomePath(supabase, user.id));
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-surface px-5 py-16 text-on-surface">
      <Link href="/" className="font-display text-lg font-extrabold tracking-tight">
        Consumo<span className="text-primary">Smart</span>
      </Link>
      <LoginForm />
    </div>
  );
}
