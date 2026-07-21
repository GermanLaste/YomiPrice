-- =========================================
-- WORKS (Obras / Series)
-- =========================================
create table works (
  id uuid primary key default gen_random_uuid(),
  anilist_id integer unique not null,
  slug text unique not null,
  title_romaji text not null,
  title_native text,
  author text,
  synopsis text,
  cover_image_url text not null,
  total_volumes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================
-- GENRES + relación N:N con works
-- =========================================
create table genres (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null
);

create table work_genres (
  work_id uuid references works(id) on delete cascade,
  genre_id uuid references genres(id) on delete cascade,
  primary key (work_id, genre_id)
);

-- =========================================
-- EDITIONS (Tomos)
-- =========================================
create table editions (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references works(id) on delete cascade,
  volume_number integer not null,
  title_override text,
  cover_image_url text,
  isbn text,
  created_at timestamptz not null default now(),
  unique (work_id, volume_number)
);

-- =========================================
-- STORES (Comercios)
-- =========================================
create table stores (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  website_url text not null,
  logo_url text
);

-- =========================================
-- PRICE_LISTINGS
-- =========================================
create table price_listings (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid not null references editions(id) on delete cascade,
  store_id uuid not null references stores(id) on delete cascade,
  price numeric(10,2) not null,
  currency text not null default 'ARS',
  purchase_url text not null,
  in_stock boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (edition_id, store_id)
);

-- =========================================
-- ÍNDICES
-- =========================================
create index idx_editions_work_id on editions(work_id);
create index idx_price_listings_edition_id on price_listings(edition_id);
create index idx_works_slug on works(slug);

-- =========================================
-- SEGURIDAD Y POLÍTICAS RLS
-- =========================================
alter table works enable row level security;
alter table editions enable row level security;
alter table genres enable row level security;
alter table work_genres enable row level security;
alter table stores enable row level security;
alter table price_listings enable row level security;

-- Lectura pública (anon + authenticated)
create policy "public_read_works" on works for select using (true);
create policy "public_read_editions" on editions for select using (true);
create policy "public_read_genres" on genres for select using (true);
create policy "public_read_work_genres" on work_genres for select using (true);
create policy "public_read_stores" on stores for select using (true);
create policy "public_read_price_listings" on price_listings for select using (true);

-- Mutación restringida a usuarios autenticados (admins)
create policy "admin_write_works" on works for all to authenticated using (true) with check (true);
create policy "admin_write_editions" on editions for all to authenticated using (true) with check (true);
create policy "admin_write_genres" on genres for all to authenticated using (true) with check (true);
create policy "admin_write_work_genres" on work_genres for all to authenticated using (true) with check (true);
create policy "admin_write_stores" on stores for all to authenticated using (true) with check (true);
create policy "admin_write_price_listings" on price_listings for all to authenticated using (true) with check (true);
