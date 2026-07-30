-- Conta de cliente recorrente (login próprio no app do cliente — e-mail/senha ou OAuth
-- Google/Apple, via Supabase Auth) e endereço/geolocalização do estabelecimento (usado pela
-- tela 37, lista de bares próximos por distância). Ver SCREENS_PLAN.md, Módulo 4 (telas 36-38).
--
-- `customers` é o perfil do cliente: nome vem do provedor de login (OAuth/e-mail) na hora do
-- cadastro; cpf/phone ficam nulos até o cliente preencher pela primeira vez o form de
-- identificação (tela 13) em algum estabelecimento que exija isso — depois disso, passam a
-- ser reaproveitados automaticamente nos próximos check-ins, em qualquer estabelecimento.
--
-- `order_checkins.customer_id` liga um check-in ao perfil, quando existir, mas
-- `order_checkins.name/cpf/phone` continuam sendo o retrato do que foi usado NAQUELE check-in
-- (histórico), mesmo que o cliente edite o perfil depois.

set search_path to consumosmart, extensions, public;

alter table restaurants
  add column address_line text,
  add column city text,
  add column state text,
  add column postal_code text,
  add column latitude numeric(9,6),
  add column longitude numeric(9,6);

create table customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id),
  name text not null,
  cpf text,
  phone text,
  created_at timestamptz not null default now()
);

alter table order_checkins
  add column customer_id uuid references customers(id);

alter table customers enable row level security;
