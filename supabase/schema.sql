-- Execute no SQL Editor do Supabase

create extension if not exists "pgcrypto";

create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists settings (
  id text primary key default 'default',
  pix_key text,
  pix_enabled boolean default false,
  secret_route text default 'admin-correio',
  merchant_name text default 'Correio Elegante',
  merchant_city text default 'RECIFE',
  pix_provider text default 'brcode',
  mercadopago_access_token text,
  openpix_app_id text,
  updated_at timestamptz default now()
);

create type order_status as enum (
  'AWAITING_PAYMENT',
  'AWAITING_PRODUCTION',
  'COMPLETED'
);

create type identification_mode as enum ('IDENTIFIED', 'ANONYMOUS');

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  status order_status default 'AWAITING_PAYMENT',
  letter_type text not null,
  letter_price numeric not null,
  receiver_name text not null,
  receiver_class text not null,
  identification_mode identification_mode not null,
  sender_name text,
  sender_class text,
  message text not null,
  spotify_link text,
  polaroid_url text,
  extras jsonb,
  total_amount numeric not null,
  payment_id text unique,
  payment_confirmed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

insert into settings (id) values ('default') on conflict (id) do nothing;

-- Storage: crie o bucket "polaroids" como público no painel Supabase
