-- Coleta opcional de identificação do cliente no check-in (tela 13), configurável por
-- estabelecimento (tela 35 — Configurações Gerais). Ver SCREENS_PLAN.md e FUNCTIONAL_SPEC.md:
-- Área 2 (o gestor liga/desliga) / Área 4 (o form aparece pro cliente quando ligado).
--
-- `order_checkins` só ganha linha quando o estabelecimento tem a opção ligada e o cliente de
-- fato preenche o form — não é um cadastro de cliente permanente/CRM, é um registro por
-- check-in. CPF é dado sensível (LGPD): armazenado como texto simples, sem tratamento
-- adicional por enquanto — cabe à tela 35 trazer um aviso de consentimento quando for construída.

set search_path to consumosmart, extensions, public;

alter table restaurants
  add column require_customer_checkin_info boolean not null default false;

create table order_checkins (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  name text not null,
  cpf text not null,
  phone text not null,
  checked_in_at timestamptz not null default now()
);

alter table order_checkins enable row level security;
