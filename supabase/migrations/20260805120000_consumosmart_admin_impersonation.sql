-- Base para o "Ver como" (admin simulando um funcionário de um estabelecimento) que vamos usar
-- quando a Área 2/3 (Gestão do Restaurante / Operação) existir. A sessão real do admin nunca é
-- trocada: um cookie httpOnly guarda só o id desta linha, e cada leitura valida admin/expiração
-- no servidor — por isso o cookie em si não precisa ser assinado/criptografado, é só um ponteiro
-- pra um estado que só o servidor decide se é válido.

set search_path to consumosmart, extensions, public;

create table admin_impersonations (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references auth.users(id),
  staff_user_id uuid not null references auth.users(id),
  restaurant_id uuid not null references restaurants(id),
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  ended_at timestamptz
);

alter table admin_impersonations enable row level security;

create policy "system admins can read own impersonations"
  on admin_impersonations for select
  using (exists (select 1 from system_admins sa where sa.user_id = auth.uid()));
