-- Roast recipes on the account: keyword match → Bullet / HSR15 recipe strings (+ note), edited in roast-planner (Reçeteler panel).
-- Run once in the Supabase SQL editor (same project as roast_plans). The page falls back to its built-in list until this table has rows.
create table if not exists public.roast_recipes (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users(id) on delete cascade,
  match text not null,                     -- comma-separated keywords; ALL must appear in the product name (e.g. 'yaye, cocoa')
  bullet text not null default '',         -- e.g. '-P2 / B1 / 40s / 95A'  (trailing ##A = target Agtron → Target L*)
  hsr text not null default '',            -- e.g. '-P2 / B1 / 60s / 95A'
  note text not null default '',           -- reminder shown as the bell in the Recipe cell
  sort int not null default 100,           -- lower = matched first (most specific first)
  updated_at timestamptz not null default now()
);

alter table public.roast_recipes enable row level security;

drop policy if exists roast_recipes_rw on public.roast_recipes;
create policy roast_recipes_rw on public.roast_recipes
  for all to authenticated
  using (owner = auth.uid())
  with check (owner = auth.uid());
