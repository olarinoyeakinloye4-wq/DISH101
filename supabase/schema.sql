-- Dish101 schema. Run in Supabase SQL Editor before deploying functions.
create extension if not exists pgcrypto;

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  description text not null check (char_length(description) between 2 and 350),
  price integer not null check (price > 0), -- kobo
  category text not null check (char_length(category) between 2 and 40),
  image text not null,
  badge text,
  available boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  address text not null,
  items jsonb not null check (jsonb_typeof(items) = 'array'),
  total integer not null check (total > 0), -- kobo
  status text not null default 'pending' check (status in ('pending','paid','preparing','delivered','cancelled')),
  payment_reference text unique,
  created_at timestamptz not null default now()
);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_payment_reference_idx on public.orders(payment_reference);

-- The browser never talks directly to these tables. Netlify functions use the service role.
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
revoke all on public.menu_items, public.orders from anon, authenticated;

-- Optional private bucket for bank-transfer receipt uploads.
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do update set public = false;

-- Browser roles cannot read or write customer receipts. Service-role functions bypass RLS.
drop policy if exists "No public receipt access" on storage.objects;
create policy "No public receipt access"
on storage.objects for all
to anon, authenticated
using (false)
with check (false);

-- Starter rows. Image paths refer to the repository's public static assets.
insert into public.menu_items (name,description,price,category,image,badge) values
('Smoky Jollof Rice','Party-style jollof with grilled chicken.',450000,'mains','img/jollof-rice-rotated.jpg','Popular'),
('Fried Rice & Chicken','Colourful fried rice with juicy chicken.',480000,'mains','img/ET5B7665-7.jpg','Best Seller'),
('Chicken Shawarma','Wrapped chicken, crunchy veg and sauce.',350000,'mains','img/Lebanese-Shawarma.png','New'),
('Chicken Suya','Chargrilled, spicy and full of flavour.',400000,'mains','img/Chicken-Suya-IG-1.jpg','Spicy'),
('Crispy Fries','Golden seasoned potato fries.',180000,'sides','img/50223-homemade-crispy-seasoned-french-fries-VAT-Beauty-4x3-789ecb2eaed34d6e879b9a93dd56a50a.jpg','Popular'),
('Sticky Chicken Wings','Tender wings glazed in our house sauce.',320000,'sides','img/wholesomeyum-Baked-Whole-Chicken-Wings-15.jpg','Best Seller'),
('Zobo Chapman','Our chilled Nigerian house drink.',120000,'drinks','img/zobochapmanB.jpg','Popular'),
('Orange Juice','Bright, refreshing fruit juice.',150000,'drinks','img/Orange-juice-smoothie-featured-500x500.jpg','Fresh'),
('Celebration Cake','A sweet slice for the finish.',250000,'desserts','img/cake.jpg','Sweet'),
('Puff Puff','Warm, fluffy, sweet bites.',120000,'desserts','img/Pumpkin-Drop-Donuts-puff-puff-03.jpg','Classic');
