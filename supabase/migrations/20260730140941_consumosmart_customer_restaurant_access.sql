-- Concessão de acesso do cliente ao restaurante (em vez de só copiar dado uma vez): o cliente
-- logado (tela 36) autoriza um estabelecimento específico a reaproveitar seu perfil
-- (nome/CPF/telefone salvos) no check-in (tela 13); pode revogar quando quiser, na tela 38.
--
-- Não substitui `order_checkins.name/cpf/phone` — aquilo continua sendo o retrato do que foi
-- usado NAQUELE check-in especificamente (importa pra fiscal/auditoria, não pode mudar
-- retroativamente se o cliente editar o perfil depois). Esta tabela é só o que decide se a
-- tela 13 pode se auto-preencher com o valor ATUAL do perfil da próxima vez: existe uma
-- concessão ativa (revoked_at nulo) para aquele par cliente/estabelecimento, ou não.
--
-- Uma linha por par cliente/estabelecimento: revogar seta `revoked_at`; conceder de novo
-- depois de revogado só limpa `revoked_at` (upsert), não cria uma nova linha.

set search_path to consumosmart, extensions, public;

create table customer_restaurant_access (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (customer_id, restaurant_id)
);

alter table customer_restaurant_access enable row level security;
