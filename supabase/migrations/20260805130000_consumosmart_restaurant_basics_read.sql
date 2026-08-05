-- Permite resolver um restaurante pelo slug antes de confirmar vínculo de staff (usado por
-- requireGestor() e por /auth/escolher). Nome/slug/tema não são dados sensíveis — a Área do
-- Cliente também vai precisar resolver isso publicamente via QR mais adiante.

set search_path to consumosmart, extensions, public;

create policy "authenticated can read restaurant basics"
  on restaurants for select
  to authenticated
  using (true);
