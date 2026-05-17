-- State education travel overlays (destination rates still from GSA).

create table if not exists public.state_education_travel_rules (
  state char(2) primary key,
  name text not null,
  uses_gsa_destination boolean not null default true,
  source_url text not null,
  source_label text not null,
  mie_cap numeric(8, 2),
  lodging_cap numeric(8, 2),
  day_trip_mie numeric(8, 2),
  travel_day_fraction numeric(4, 3) not null default 0.75,
  partial_travel_days boolean not null default true,
  notes text,
  updated_at timestamptz not null default now()
);

insert into public.state_education_travel_rules (
  state, name, uses_gsa_destination, source_url, source_label,
  mie_cap, lodging_cap, day_trip_mie, travel_day_fraction, partial_travel_days, notes
) values
  (
    'TX', 'Texas', true,
    'https://tea.texas.gov/about-tea/news-and-multimedia/correspondence/taa-letters/state-fiscal-year-2026-travel-reimbursement-rates',
    'Texas Education Agency (TEA)',
    68, 110, 36, 0.75, true,
    'TEA grant travel: federal per diem map for overnight; $36 meals on non-overnight days.'
  ),
  (
    'NJ', 'New Jersey', true,
    'https://www.nj.gov/education/finance/fp/psd/audit/1415/AppendixEGuidance.pdf',
    'NJ Department of Education audit guidance',
    46, 83, null, 0.75, true,
    'When destination is not listed in the Federal Register, Appendix E caps apply.'
  ),
  (
    'NY', 'New York', true,
    'https://osc.ny.gov/state-agencies/gfo/chapter-xiii/xiii4d-meals-and-incidental-expenses-breakdown',
    'NY State Comptroller (OSC)',
    null, null, null, 0.75, true,
    'Many NY schools follow GSA or OSC schedules; check your district.'
  ),
  (
    'CA', 'California', true,
    'https://benefits.calhr.ca.gov/state-employees/work-resources/travel-reimbursements-2/',
    'CalHR (state employee travel)',
    68, null, null, 0.75, true,
    'K–12 districts vary; many align with GSA.'
  ),
  (
    'FL', 'Florida', true,
    'https://www.fldoe.org/',
    'Florida Department of Education',
    null, null, null, 0.75, true,
    'District policies often reference federal rates for out-of-county travel.'
  )
on conflict (state) do update set
  name = excluded.name,
  uses_gsa_destination = excluded.uses_gsa_destination,
  source_url = excluded.source_url,
  source_label = excluded.source_label,
  mie_cap = excluded.mie_cap,
  lodging_cap = excluded.lodging_cap,
  day_trip_mie = excluded.day_trip_mie,
  travel_day_fraction = excluded.travel_day_fraction,
  partial_travel_days = excluded.partial_travel_days,
  notes = excluded.notes,
  updated_at = now();

alter table public.state_education_travel_rules enable row level security;
create policy "Public read state_education_travel_rules"
  on public.state_education_travel_rules for select using (true);
