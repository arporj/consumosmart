import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Neste fork do Next.js 16, "middleware.ts" foi renomeado pra "proxy.ts" (função
// exportada "proxy", não mais "middleware") — ver
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.
// AGENTS.md já avisava sobre esse tipo de breaking change; um middleware.ts nesse
// nome antigo é silenciosamente ignorado, sem erro nenhum.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
