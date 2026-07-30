import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveHomePath } from "@/lib/auth/resolve-home";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Usado pelo convite de responsável (tela 0.3): manda quem acabou de aceitar o
  // convite direto pra definir a própria senha, em vez de resolver o papel ainda.
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      if (next) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      const home = await resolveHomePath(supabase, data.user.id);
      return NextResponse.redirect(`${origin}${home}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
