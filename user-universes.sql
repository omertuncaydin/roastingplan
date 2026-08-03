-- Cupping/Roast universes cloud library for Crack Listener + Guide.
-- Run once in Supabase SQL editor (same project as user_maps / apps_config).
create table if not exists public.user_universes (
  email text not null,
  uid text not null,
  uni jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (email, uid)
);

alter table public.user_universes enable row level security;

drop policy if exists user_universes_rw on public.user_universes;
create policy user_universes_rw on public.user_universes
  for all to authenticated
  using (email = auth.email())
  with check (email = auth.email());
