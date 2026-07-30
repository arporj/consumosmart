-- "Comissões" (nome comercial do Módulo 6 — RH & Folha de Pagamento), exclusivo do plano Pro.
-- SCREENS_PLAN.md, Módulo 6 (telas 30-33). A tela 29 (cadastro de funcionários) já mora em
-- `staff` (migration consumosmart_plans_and_staff), liberada em todos os planos.

set search_path to consumosmart, extensions, public;

create type attendance_type as enum ('falta', 'hora_extra');

create table staff_attendance (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff(id) on delete cascade,
  type attendance_type not null,
  occurred_on date not null,
  hours numeric(5,2), -- preenchido para hora_extra
  note text,
  created_at timestamptz not null default now()
);

create table salary_advances (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff(id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  requested_at timestamptz not null default now(),
  paid_at timestamptz
);

create table service_charge_distributions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  total_amount_cents integer not null check (total_amount_cents >= 0),
  created_at timestamptz not null default now()
);

create table service_charge_shares (
  id uuid primary key default gen_random_uuid(),
  distribution_id uuid not null references service_charge_distributions(id) on delete cascade,
  staff_id uuid not null references staff(id),
  amount_cents integer not null check (amount_cents >= 0)
);

create type payroll_run_status as enum ('draft', 'closed');

create table payroll_runs (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  status payroll_run_status not null default 'draft',
  closed_at timestamptz,
  created_at timestamptz not null default now()
);

create table payroll_items (
  id uuid primary key default gen_random_uuid(),
  payroll_run_id uuid not null references payroll_runs(id) on delete cascade,
  staff_id uuid not null references staff(id),
  base_amount_cents integer not null default 0,
  advances_amount_cents integer not null default 0,
  commission_amount_cents integer not null default 0,
  total_amount_cents integer not null default 0
);

alter table staff_attendance enable row level security;
alter table salary_advances enable row level security;
alter table service_charge_distributions enable row level security;
alter table service_charge_shares enable row level security;
alter table payroll_runs enable row level security;
alter table payroll_items enable row level security;
