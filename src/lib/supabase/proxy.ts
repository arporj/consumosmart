import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Padrão @supabase/ssr pra Next.js: refresca o cookie de sessão em toda request
// (o token de acesso expira e precisa ser renovado fora dos Server Components,
// que não conseguem escrever cookie de resposta).
//
// Isso é só a checagem OTIMISTA (existe sessão?) — não consulta system_admins aqui.
// Por quê: o Proxy roda em toda rota, inclusive prefetch, e a doc deste Next
// (node_modules/next/dist/docs/.../authentication.md, seção "Optimistic checks with
// Proxy") recomenda não fazer consulta a banco por request nele, e deixa explícito
// que "it should not be your only line of defense". A checagem de verdade (é admin
// mesmo?) fica em requireSystemAdmin() (src/lib/auth/require-admin.ts), chamada em
// cada Server Component/Action da Área SupraAdmin.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: "consumosmart" },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (request.nextUrl.pathname.startsWith("/admin") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
