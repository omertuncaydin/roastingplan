-- Roast-day archive: one plan per (account, day). Run once in Supabase SQL editor
-- (same project as user_maps / user_universes / user_settings).
create table if not exists public.roast_plans (
  owner uuid not null references auth.users(id) on delete cascade,
  day date not null,
  plan jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (owner, day)
);

alter table public.roast_plans enable row level security;

drop policy if exists roast_plans_rw on public.roast_plans;
create policy roast_plans_rw on public.roast_plans
  for all to authenticated
  using (owner = auth.uid())
  with check (owner = auth.uid());
