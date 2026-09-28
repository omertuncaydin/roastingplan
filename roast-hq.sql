-- 2026-09-28 · HQ layer (v2): the admin (omer_aydin@coffeenutz.net) sees every account's presence and roast days,
-- HQ staff accounts read the recipes (so their planner shows Recipe + Target L*) without the editor,
-- and nobody else reads anything. Run once in the Supabase SQL editor. Safe to re-run.
-- v2 fix: hq_staff table is created BEFORE is_hq_staff(), because Postgres validates a sql function body at create time.

-- 0) admin helper: one source of truth for "who is the admin"
create or replace function public.is_hq_admin() returns boolean
language sql stable as
$$ select (auth.jwt()->>'email') = 'omer_aydin@coffeenutz.net' $$;

-- 1) HQ staff list. Only the admin reads or writes it. New staff = one insert like the seeded row below.
create table if not exists public.hq_staff (
  email text primary key,
  added_at timestamptz not null default now()
);
insert into public.hq_staff(email) values ('emrekocakurt1@gmail.com') on conflict do nothing;   -- Emre (HQ roaster), added 2026-09-28
alter table public.hq_staff enable row level security;
drop policy if exists hq_staff_admin on public.hq_staff;
create policy hq_staff_admin on public.hq_staff
  for all to authenticated
  using (public.is_hq_admin())
  with check (public.is_hq_admin());

-- 2) staff helper. Security definer: the policy checks below must read hq_staff even though only the admin can read it directly.
create or replace function public.is_hq_staff() returns boolean
language sql stable security definer set search_path = public as
$$ select exists(select 1 from public.hq_staff where email = (auth.jwt()->>'email')) $$;

-- 3) recipes: reads for the owner, the admin, and HQ staff. Students and any other account read nothing.
--    (Staff planners render Recipe + Target L*; the Reçeteler editor button stays admin-only because staff own no rows.)
drop policy if exists roast_recipes_read on public.roast_recipes;
create policy roast_recipes_read on public.roast_recipes
  for select to authenticated
  using (owner = auth.uid() or public.is_hq_admin() or public.is_hq_staff());

--    writes: same rules as before, expressed through the helper
drop policy if exists roast_recipes_insert on public.roast_recipes;
drop policy if exists roast_recipes_update on public.roast_recipes;
drop policy if exists roast_recipes_delete on public.roast_recipes;
create policy roast_recipes_insert on public.roast_recipes
  for insert to authenticated
  with check (owner = auth.uid() and public.is_hq_admin());
create policy roast_recipes_update on public.roast_recipes
  for update to authenticated
  using (public.is_hq_admin())
  with check (owner = auth.uid());
create policy roast_recipes_delete on public.roast_recipes
  for delete to authenticated
  using (public.is_hq_admin());

-- 4) presence: everyone writes only their own row; the admin also READS everyone's (one-way glass)
drop policy if exists roast_presence_rw on public.roast_presence;
drop policy if exists roast_presence_select on public.roast_presence;
drop policy if exists roast_presence_insert on public.roast_presence;
drop policy if exists roast_presence_update on public.roast_presence;
drop policy if exists roast_presence_delete on public.roast_presence;
create policy roast_presence_select on public.roast_presence
  for select to authenticated using (owner = auth.uid() or public.is_hq_admin());
create policy roast_presence_insert on public.roast_presence
  for insert to authenticated with check (owner = auth.uid());
create policy roast_presence_update on public.roast_presence
  for update to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
create policy roast_presence_delete on public.roast_presence
  for delete to authenticated using (owner = auth.uid());

-- 5) roast days: the admin can also READ every account's saved days (Geçmiş shows them as İzleme · read-only).
--    Additive policy; the existing owner-scoped roast_plans_rw stays as is.
drop policy if exists roast_plans_admin_read on public.roast_plans;
create policy roast_plans_admin_read on public.roast_plans
  for select to authenticated using (public.is_hq_admin());
