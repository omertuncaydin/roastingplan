-- 2026-09-28 · two-computer sync fixes for the Roast Planner. Run once in the Supabase SQL editor
-- (same project as roast_plans / roast_recipes). Safe to re-run.

-- 1) roast_recipes: delete the older copies where the same (owner, match) exists more than once —
--    the newest updated_at survives — then a unique index so a duplicate can never be inserted again.
delete from public.roast_recipes r
 using public.roast_recipes k
 where r.owner = k.owner and r.match = k.match
   and (r.updated_at < k.updated_at or (r.updated_at = k.updated_at and r.id < k.id));

create unique index if not exists roast_recipes_owner_match
  on public.roast_recipes(owner, match);

-- 2) roast_presence: which computer is doing what in the planner.
--    One row per device on the account; the page refreshes it every minute and a few seconds after each action.
create table if not exists public.roast_presence (
  owner uuid not null references auth.users(id) on delete cascade,
  device text not null,                     -- the name in the "Bu bilgisayar" box (stored per browser)
  day date,                                 -- the roast day that computer is on
  seen_at timestamptz not null default now(),
  state jsonb not null default '{}'::jsonb, -- {items, doneItems, batchDone, batchTotal, recent:[last 8 actions]}
  primary key (owner, device)
);

alter table public.roast_presence enable row level security;

drop policy if exists roast_presence_rw on public.roast_presence;
create policy roast_presence_rw on public.roast_presence
  for all to authenticated
  using (owner = auth.uid())
  with check (owner = auth.uid());
