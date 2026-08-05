-- Account-level settings: the charge table (sole ruler) + the watch key ride the ACCOUNT,
-- so any signed-in phone/desktop sees the same table. Run once in Supabase SQL editor
-- (same project as user_maps / user_universes). Supersedes user-settings-watchkey.sql
-- (that file only ALTERed this table, which never existed — safe to ignore it now).
create table if not exists public.user_settings (
  owner uuid not null primary key references auth.users(id) on delete cascade,
  charge jsonb,
  watch_key text,
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

drop policy if exists user_settings_rw on public.user_settings;
create policy user_settings_rw on public.user_settings
  for all to authenticated
  using (owner = auth.uid())
  with check (owner = auth.uid());
