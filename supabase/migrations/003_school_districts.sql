-- NCES CCD open LEAs (synced via scripts/sync-nces-lea.mjs --supabase).
-- Static site uses public/data/lea/*.json; this table is optional for hosted search.

create table if not exists public.school_districts (
  nces_id text primary key,
  state char(2) not null,
  name text not null,
  city text
);

create index if not exists school_districts_state_idx on public.school_districts (state);
create index if not exists school_districts_state_name_idx on public.school_districts (state, name);

alter table public.school_districts enable row level security;
create policy "Public read school_districts"
  on public.school_districts for select using (true);
