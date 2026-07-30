-- ConsumoSmart — schema inicial
-- Multi-tenant desde o início: organizations (rede) -> restaurants (unidade) -> tables/products/orders.
--
-- Este projeto Supabase ("arrc") é compartilhado com outras aplicações (ex. schema
-- "showradar"). O ConsumoSmart vive isolado no schema "consumosmart" dedicado, não em
-- "public" — mesma instância Postgres, namespace lógico próprio, sem misturar tabelas.
--
-- RLS: todas as tabelas com restaurant_id têm RLS habilitado mas SEM policies ainda —
-- ou seja, ficam inacessíveis por padrão até existir um modelo de auth (staff/organização)
-- para basear as policies. Isso é intencional: preferimos "bloqueado por padrão" a uma
-- policy escrita contra um esquema de auth que ainda não existe.

create schema if not exists consumosmart;

-- pgcrypto já vem instalada globalmente (schema "extensions") na maioria dos projetos
-- Supabase; garantimos aqui só por segurança, sem forçar reinstalação.
create extension if not exists "pgcrypto" schema extensions;

set search_path to consumosmart, extensions, public;

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table restaurants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  slug text not null unique,
  name text not null,
  logo_url text,
  has_custom_theme boolean not null default false,
  theme_config jsonb,
  created_at timestamptz not null default now()
);

create table restaurant_areas (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  sort_order int not null default 0
);

create table tables (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  area_id uuid references restaurant_areas(id) on delete set null,
  label text not null, -- número ("07") ou nome customizado ("André")
  seats int,
  created_at timestamptz not null default now()
);

create table product_categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  sort_order int not null default 0
);

create table products (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  category_id uuid references product_categories(id) on delete set null,
  name text not null,
  description text,
  price_cents integer not null check (price_cents >= 0),
  station text not null default 'cozinha', -- roteamento pro KDS: cozinha | bar | sobremesas
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create type order_type as enum ('mesa', 'balcao');
create type order_status as enum ('open', 'awaiting_payment', 'closed', 'canceled');

create table orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  table_id uuid references tables(id) on delete set null,
  order_type order_type not null default 'balcao',
  status order_status not null default 'open',
  guest_count int not null default 1,
  service_charge_enabled boolean not null default true,
  service_charge_rate numeric(5,4) not null default 0.10,
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);

create type order_item_status as enum ('pending', 'preparing', 'ready', 'delivered', 'canceled');

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  station text not null,
  quantity int not null check (quantity > 0),
  unit_price_cents integer not null,
  notes text,
  status order_item_status not null default 'pending',
  created_at timestamptz not null default now()
);

create type payment_method as enum ('pix', 'cartao', 'dinheiro', 'customizado');

create table order_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  method payment_method not null,
  amount_cents integer not null check (amount_cents >= 0),
  paid_at timestamptz not null default now()
);

-- Chamar garçom / pedir conta, disparado pelo app do cliente (ver client_app_consumosmart).
create table order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  table_id uuid references tables(id) on delete set null,
  type text not null, -- 'call_waiter' | 'request_bill'
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid
);

alter table restaurants enable row level security;
alter table restaurant_areas enable row level security;
alter table tables enable row level security;
alter table product_categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_payments enable row level security;
alter table order_events enable row level security;
