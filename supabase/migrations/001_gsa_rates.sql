-- GSA CONUS per diem cache (synced from https://open.gsa.gov/api/perdiem/)

create table if not exists public.fiscal_years (
  year integer primary key,
  start_date date not null,
  end_date date not null
);

insert into public.fiscal_years (year, start_date, end_date) values
  (2025, '2024-10-01', '2025-09-30'),
  (2026, '2025-10-01', '2026-09-30')
on conflict (year) do nothing;

create table if not exists public.localities (
  id uuid primary key default gen_random_uuid(),
  did text not null,
  state char(2) not null,
  city text not null,
  county text,
  is_standard boolean not null default false,
  fiscal_year integer not null references public.fiscal_years (year) on delete cascade,
  mie_total numeric(8, 2) not null,
  synced_at timestamptz not null default now(),
  unique (did, state, fiscal_year)
);

create index if not exists localities_state_year_idx on public.localities (state, fiscal_year);
create index if not exists localities_city_idx on public.localities (city);

create table if not exists public.locality_lodging (
  locality_id uuid not null references public.localities (id) on delete cascade,
  month smallint not null check (month between 1 and 12),
  max_lodging numeric(8, 2) not null,
  primary key (locality_id, month)
);

create table if not exists public.mie_tiers (
  fiscal_year integer not null references public.fiscal_years (year) on delete cascade,
  total numeric(8, 2) not null,
  breakfast numeric(8, 2) not null,
  lunch numeric(8, 2) not null,
  dinner numeric(8, 2) not null,
  incidentals numeric(8, 2) not null,
  primary key (fiscal_year, total)
);

create table if not exists public.zip_locality (
  zip char(5) not null,
  did text not null,
  state char(2) not null,
  fiscal_year integer not null references public.fiscal_years (year) on delete cascade,
  primary key (zip, fiscal_year)
);

create index if not exists zip_locality_did_year_idx on public.zip_locality (did, fiscal_year);

-- Read-only public access for the static site (anon key).
alter table public.fiscal_years enable row level security;
alter table public.localities enable row level security;
alter table public.locality_lodging enable row level security;
alter table public.mie_tiers enable row level security;
alter table public.zip_locality enable row level security;

create policy "Public read fiscal_years" on public.fiscal_years for select using (true);
create policy "Public read localities" on public.localities for select using (true);
create policy "Public read locality_lodging" on public.locality_lodging for select using (true);
create policy "Public read mie_tiers" on public.mie_tiers for select using (true);
create policy "Public read zip_locality" on public.zip_locality for select using (true);

-- Optional: enable pg_trgm in Supabase SQL editor if search index fails:
-- create extension if not exists pg_trgm;
