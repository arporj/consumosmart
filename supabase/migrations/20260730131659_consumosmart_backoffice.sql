-- Retaguarda do plano Pro: estoque avançado + ficha técnica, fornecedores e financeiro.
-- Fiscal (NFC-e) e Reserva de Mesa também moram aqui (Módulo 5) mas pertencem aos planos
-- Essencial+ — o "liga/desliga" por estabelecimento é feito via `plans` (tela 0.5), não aqui.
-- SCREENS_PLAN.md, Módulo 5, Fase 1 (telas 24-28).

set search_path to consumosmart, extensions, public;

create table stock_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  sector text not null default 'cozinha', -- cozinha | bar | salao | limpeza — estoque segregado por setor
  name text not null,
  unit text not null, -- kg, l, un, etc.
  current_quantity numeric(12,3) not null default 0,
  min_quantity numeric(12,3),
  created_at timestamptz not null default now()
);

create type stock_movement_type as enum ('entrada', 'saida', 'ajuste');

create table stock_movements (
  id uuid primary key default gen_random_uuid(),
  stock_item_id uuid not null references stock_items(id) on delete cascade,
  type stock_movement_type not null,
  quantity numeric(12,3) not null check (quantity > 0),
  reason text,
  order_item_id uuid references order_items(id), -- preenchido quando a baixa é automática (ficha técnica)
  created_at timestamptz not null default now()
);

-- Ficha técnica: quanto de cada insumo um produto consome por unidade vendida.
create table product_recipe_items (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  stock_item_id uuid not null references stock_items(id) on delete cascade,
  quantity_per_unit numeric(12,3) not null check (quantity_per_unit > 0),
  unique (product_id, stock_item_id)
);

create table suppliers (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  created_at timestamptz not null default now()
);

-- Preço de compra por fornecedor/data — histórico, permite comparar fornecedores no tempo.
create table supplier_prices (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(id) on delete cascade,
  stock_item_id uuid not null references stock_items(id) on delete cascade,
  price_cents integer not null check (price_cents >= 0),
  valid_from date not null default current_date,
  created_at timestamptz not null default now()
);

create type financial_entry_type as enum ('payable', 'receivable');

create table financial_entries (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  type financial_entry_type not null,
  description text not null,
  amount_cents integer not null check (amount_cents >= 0),
  due_date date not null,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create type reservation_status as enum ('confirmed', 'canceled', 'completed', 'no_show');

create table reservations (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  table_id uuid references tables(id) on delete set null,
  customer_name text not null,
  customer_phone text,
  guest_count int not null default 1,
  reserved_at timestamptz not null,
  status reservation_status not null default 'confirmed',
  created_at timestamptz not null default now()
);

create type fiscal_invoice_status as enum ('issued', 'canceled', 'pending');

-- Registro da nota fiscal emitida para o pedido. A emissão em si depende de uma ponte/agente
-- local (certificado A1 + SEFAZ ou gateway tipo Focus NFe/eNotas) — fora do escopo desta tabela,
-- que só guarda o resultado.
create table fiscal_invoices (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  order_id uuid not null references orders(id),
  number text,
  amount_cents integer not null check (amount_cents >= 0),
  status fiscal_invoice_status not null default 'pending',
  issued_at timestamptz,
  created_at timestamptz not null default now()
);

alter table stock_items enable row level security;
alter table stock_movements enable row level security;
alter table product_recipe_items enable row level security;
alter table suppliers enable row level security;
alter table supplier_prices enable row level security;
alter table financial_entries enable row level security;
alter table reservations enable row level security;
alter table fiscal_invoices enable row level security;
