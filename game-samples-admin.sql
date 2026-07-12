-- game-samples-admin.sql
-- Admin curation policies for game_samples (community crack submissions).
--
-- The Agtron Challenge submissions land in game_samples with the anon key
-- (approved = false). Omer curates them from the Guide's Account > admin area,
-- which runs on a signed-in Supabase session. His session uses the anon apikey
-- but carries an AUTHENTICATED JWT, so it needs SELECT / UPDATE / DELETE policies
-- scoped to the AUTHENTICATED role and keyed to his JWT email.
--
-- These policies are keyed to a single email. Change the address on all three
-- lines below if Omer's admin email ever changes. The anon INSERT / SELECT
-- policies in game-samples.sql are left untouched: anonymous submitters keep
-- inserting unapproved rows, and the game keeps reading replay-consented rows.
--
-- Run this once in the Supabase SQL editor. RLS is already enabled on the table.

-- Admin may read every row (approved or not) so the review queue can list them.
create policy game_samples_admin_select on game_samples
  for select to authenticated
  using ((auth.jwt()->>'email') = 'omer_aydin@coffeenutz.net');

-- Admin may flip approved (and edit any field) on every row.
create policy game_samples_admin_update on game_samples
  for update to authenticated
  using ((auth.jwt()->>'email') = 'omer_aydin@coffeenutz.net')
  with check (true);

-- Admin may delete dirty / spam submissions.
create policy game_samples_admin_delete on game_samples
  for delete to authenticated
  using ((auth.jwt()->>'email') = 'omer_aydin@coffeenutz.net');
