-- Expõe o schema `consumosmart` para as roles do Data API (feito manualmente pelo usuário no
-- Dashboard, em Project Settings -> Data API -> Exposed schemas) e concede os GRANTs de Postgres
-- que faltam pra role `authenticated` (e `service_role`, usada só no servidor pelo painel
-- SupraAdmin) conseguirem ler/escrever nas tabelas do schema. RLS continua controlando o que cada
-- policy realmente libera — GRANT sem policy não abre nada; `anon` não recebe grant nenhum aqui,
-- então segue bloqueada por padrão.
--
-- Também cria as primeiras policies de auth: cada pessoa logada só enxerga a(s) própria(s)
-- linha(s) em system_admins/staff/customers — usado pelo resolver de pós-login
-- (src/lib/auth/resolve-home.ts) pra decidir se ela é admin, staff ou "só" cliente.
-- Ver plano em C:\Users\andre\.claude\plans\partitioned-hopping-goblet.md.

set search_path to consumosmart, extensions, public;

grant usage on schema consumosmart to authenticated, service_role;

grant select, insert, update, delete on all tables in schema consumosmart to authenticated;
grant select, insert, update, delete on all tables in schema consumosmart to service_role;

alter default privileges in schema consumosmart
  grant select, insert, update, delete on tables to authenticated, service_role;

create policy "system admins can read own row"
  on system_admins for select
  using (user_id = auth.uid());

create policy "staff can read own rows"
  on staff for select
  using (user_id = auth.uid());

create policy "customers can read own profile"
  on customers for select
  using (user_id = auth.uid());

create policy "customers can insert own profile"
  on customers for insert
  with check (user_id = auth.uid());

create policy "customers can update own profile"
  on customers for update
  using (user_id = auth.uid());
