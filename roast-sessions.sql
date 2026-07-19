-- AUTO ROAST-RECORD SYNC · run once in Supabase SQL editor (project: Roast Assist)
-- Every signed-in Roaster+ session lands here automatically at Drop; measured color rides in on Map.

create table if not exists roast_sessions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  coffee text,
  roasted_at timestamptz not null default now(),
  t_total_s real,
  n_cracks int,
  a0_s real,
  proj_stop real,
  agtron real,
  target real,
  batch_g real,
  machine text,
  note text,
  stages jsonb,
  device text
);

alter table roast_sessions enable row level security;

-- each account reads and writes only its own rows; the owner reads all
create policy rs_insert_own on roast_sessions for insert to authenticated
  with check ((auth.jwt()->>'email') = email);
create policy rs_select_own on roast_sessions for select to authenticated
  using ((auth.jwt()->>'email') = email or (auth.jwt()->>'email') = 'omer_aydin@coffeenutz.net');
create policy rs_update_own on roast_sessions for update to authenticated
  using ((auth.jwt()->>'email') = email) with check ((auth.jwt()->>'email') = email);

create index if not exists rs_email_date on roast_sessions (email, roasted_at desc);
