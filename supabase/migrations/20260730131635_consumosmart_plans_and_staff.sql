-- Planos vendidos pelo ConsumoSmart (Starter/Essencial/Pro) e o vínculo de cada estabelecimento
-- a um plano + status de acesso. Ver SCREENS_PLAN.md (Módulo 0) e
-- FUNCTIONAL_SPEC.md#os-3-planos-do-consumosmart para o detalhamento comercial.
--
-- Também cria `staff` (Login Único Multi-Papéis, tela 1 / Cadastro de Funcionários, tela 29) e
-- `system_admins` (Área 1 — Gestão do Sistema, tela 0.1). `staff.role` inclui 'gestor', que é o
-- papel do Gestor do Estabelecimento (a conta criada na tela 0.3/0.4).

set search_path to consumosmart, extensions, public;

create type plan_code as enum ('starter', 'essencial', 'pro');

create table plans (
  id uuid primary key default gen_random_uuid(),
  code plan_code not null unique,
  name text not null,
  price_cents integer not null check (price_cents >= 0),
  self_service_ordering boolean not null default false, -- autoatendimento do cliente (check-in, pedido, acompanhamento)
  kds boolean not null default false,
  reservations boolean not null default false,
  nfce_enabled boolean not null default false,
  nfce_monthly_limit integer, -- null = ilimitado (Pro); número = limite mensal (Essencial)
  stock_advanced boolean not null default false, -- estoque avançado + ficha técnica com baixa automática
  financial_entries boolean not null default false, -- contas a pagar/receber
  suppliers boolean not null default false,
  hr_commissions boolean not null default false, -- "Comissões": ponto, adiantamento, rateio, folha
  created_at timestamptz not null default now()
);

create type restaurant_status as enum ('trial', 'active', 'suspended', 'canceled');
create type restaurant_signup_source as enum ('admin', 'self_service');

alter table restaurants
  add column plan_id uuid references plans(id),
  add column status restaurant_status not null default 'trial',
  add column signup_source restaurant_signup_source not null default 'admin';

create type staff_role as enum ('gestor', 'garcom', 'caixa', 'cozinha', 'bar');

create table staff (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  user_id uuid references auth.users(id), -- vínculo com o login; nulo até a pessoa ativar o próprio acesso
  name text not null,
  role staff_role not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table system_admins (
  user_id uuid primary key references auth.users(id),
  created_at timestamptz not null default now()
);

alter table plans enable row level security;
alter table staff enable row level security;
alter table system_admins enable row level security;

-- Seed dos 3 planos com os preços sugeridos na base da faixa (R$99/R$169/R$289) e as
-- funcionalidades definidas em 2026-07-30. `nfce_monthly_limit` do Essencial é um placeholder
-- (50 notas/mês) — o usuário ainda não definiu o número exato; ajustar via tela 0.5 quando decidido.
insert into plans (code, name, price_cents, self_service_ordering, kds, reservations, nfce_enabled, nfce_monthly_limit, stock_advanced, financial_entries, suppliers, hr_commissions) values
  ('starter', 'Starter', 9900, false, false, false, false, null, false, false, false, false),
  ('essencial', 'Essencial', 16900, true, true, true, true, 50, false, false, false, false),
  ('pro', 'Pro / Gestão Total', 28900, true, true, true, true, null, true, true, true, true);
