-- CLOUD MAP SYNC · run once in Supabase SQL editor
-- Maps (bsCal entries) ride the account: every device sees the same registry.

create table if not exists user_maps (
  email text not null,
  coffee text not null,
  cal jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (email, coffee)
);

alter table user_maps enable row level security;

create policy um_own on user_maps for all to authenticated
  using ((auth.jwt()->>'email') = email)
  with check ((auth.jwt()->>'email') = email);
