-- Caixa: abertura (fundo de troco), sangria/suplementação e fechamento de turno.
-- SCREENS_PLAN.md, Módulo 2, Fase 1 (telas 8-10).

set search_path to consumosmart, extensions, public;

create type cash_session_status as enum ('open', 'closed');

create table cash_sessions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  opened_by uuid not null references staff(id),
  opening_amount_cents integer not null check (opening_amount_cents >= 0),
  opened_at timestamptz not null default now(),
  closed_by uuid references staff(id),
  closing_amount_cents integer check (closing_amount_cents >= 0),
  closed_at timestamptz,
  status cash_session_status not null default 'open'
);

create type cash_movement_type as enum ('sangria', 'suprimento');

create table cash_movements (
  id uuid primary key default gen_random_uuid(),
  cash_session_id uuid not null references cash_sessions(id) on delete cascade,
  type cash_movement_type not null,
  amount_cents integer not null check (amount_cents > 0),
  note text,
  created_by uuid not null references staff(id),
  created_at timestamptz not null default now()
);

alter table cash_sessions enable row level security;
alter table cash_movements enable row level security;
